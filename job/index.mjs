import axios from "axios";
import asyncPool from "tiny-async-pool";
import moment from "moment";
import fs from "fs";
import axiosRetry from "axios-retry";
import path from "path";

axiosRetry(axios, {
  retries: 10,
  retryDelay: (retryCount) => {
    return retryCount * 10000;
  },
  retryCondition: (r) => {
    if (r.response?.data?.message === "End date must be after start date")
      return false;
    return true;
  },
});

function extractMainLine(rawInput) {
  return rawInput
    .replace(/\r?\n|\r/g, " ") // Remove newlines
    .replace(/\{[^}]*\}/g, "") // Remove comments
    .replace(/\([^)]*\)/g, "") // Remove variations in parentheses
    .replace(/\$\d+/g, "") // Remove annotations like $4
    .replace(/\*/g, "") // Remove game end marker
    .replace(/\d+\s*\.\.\./g, "") // Remove move numbers like 2...
    .replace(/\d+\s*\./g, "") // Remove move numbers like 2.
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim()
    .split(" ")
    .filter(Boolean); // Remove any empty elements
}

function extractMoves(rawInput) {
  console.log("===== RAW INPUT =====");
  console.log(rawInput);
  console.log("=====================\n");

  // STEP 1: Normalize everything early
  let preCleaned = rawInput
    .replace(/\([^)]*\)/g, "")
    .replace(/\r?\n|\r/g, " ") // Remove newlines early
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/\{[^}]*\}/g, "") // Remove comments
    .replace(/\$\d+/g, "") // Remove $N annotations
    .replace(/\*/g, "") // Remove game end marker
    .replace(/\d+\s*\.\.\./g, "") // Remove black move numbers like 2...
    .replace(/\d+\s*\./g, "") // Remove white move numbers like 2.
    .trim();

  console.log("===== PRE-CLEANED STRING =====");
  console.log(preCleaned);
  console.log("==============================\n");

  let index = 0;

  function parseLine() {
    const stack = [[]];

    while (index < preCleaned.length) {
      const char = preCleaned[index];

      if (char === "(") {
        index++; // skip (
        const variations = parseLine(); // recursively parse variation
        const newStack = [];

        for (let seq of stack) {
          for (let variation of variations) {
            newStack.push([...seq, ...variation]);
          }
        }

        stack.push(...newStack);
      } else if (char === ")") {
        index++; // skip )
        break;
      } else {
        const match = preCleaned.slice(index).match(/^[^\s()]+/);
        if (!match) break;

        const move = match[0];
        for (let seq of stack) {
          seq.push(move);
        }

        index += move.length;
        while (preCleaned[index] === " ") index++;
      }
    }

    return stack;
  }

  const result = parseLine();

  console.log("===== PARSED VARIATIONS =====");
  result.forEach((line, i) => {
    console.log(`Line ${i + 1}: ${line.join(" ")}`);
  });
  console.log("==============================\n");

  return result;
}

function parsePgn(pgn) {
  const pos = pgn.lastIndexOf("]");

  const lines = pgn.split("\r\n").filter((x) => x !== "");
  const raw = pgn.substring(pos + 1).trim();
  const moves = extractMainLine(raw);
  const data = { moves, raw };
  for (const line of lines) {
    const matches = line.match(/\[(.*)\s"(.*)"\]/i);
    if (matches) {
      data[matches[1].toLowerCase()] = matches[2];
    }
  }

  return data;
}
async function fetchMonth(date) {
  const now = moment(date);
  const thisMonth = moment().startOf("month").format("YYYY-MM-DD");
  const end = now.format("YYYY-MM-DD");
  let start = now.startOf("month").format("YYYY-MM-DD");
  if (start === thisMonth) {
    start = now.startOf("month").subtract(1, "day").format("YYYY-MM-DD");
  }

  const url = `https://www.chess.com/callback/puzzles/daily?start=${start}&end=${end}`;
  try {
    const { data } = await axios.get(url);
    return data
      .filter((x) => x.date.includes(end.substring(0, 7)))
      .map((item) => {
        const parsed = parsePgn(item.pgn);
        const viewerUrl = "https://chess-board.fly.dev/?fen=" + parsed.fen;
        return { ...item, parsed, viewerUrl };
      });
  } catch (e) {
    if (e.response?.data?.message === "End date must be after start date") {
      return [];
    }
    throw e;
  }
}
async function main() {
  const puzzleDir = path.resolve("../puzzle");
  const CONCURRENT_REQUESTS = (process.env.CONCURRENT_REQUESTS || 10) * 1;
  // Month has first puzzle
  const firstMonth = moment("2007-04-01");

  const now = moment();
  const monthDiff = now.diff(firstMonth, "months") + 1;
  // console.log("monthDiff", monthDiff);
  // At the code time, the puzzle of the current month is not available
  const numberOfMonth = (process.argv[2] || monthDiff) * 1;
  const months = Array.from(Array(numberOfMonth).keys());
  let allPuzzle = [];

  const processMonth = async (month) => {
    let currentMonth =
      process.env.DEBUG_MONTH ||
      moment().subtract(+month, "months").endOf("month");

    if (process.env.DEBUG_MONTH) {
      currentMonth = moment(process.env.DEBUG_MONTH).endOf("month");
    }
    const data = await fetchMonth(currentMonth);
    console.log(currentMonth.format("MM/YYYY"), data.length);
    const key = `${puzzleDir}/${currentMonth.format("YYYY/YYYY-MM")}.json`;
    fs.mkdirSync(`${puzzleDir}/${currentMonth.format("YYYY")}`, {
      recursive: true,
    });
    fs.writeFileSync(key, JSON.stringify(data, null, 4));
    return data;
  };

  for await (const data of asyncPool(
    CONCURRENT_REQUESTS,
    months,
    processMonth
  )) {
    allPuzzle = [...allPuzzle, ...data];
  }

  const sortedPuzzle = allPuzzle.sort((a, b) => {
    return a.id - b.id;
  });

  fs.writeFileSync(
    `${puzzleDir}/all.json`,
    JSON.stringify(sortedPuzzle, null, 4)
  );

  fs.writeFileSync(
    `${puzzleDir}/all.txt`,
    sortedPuzzle.map((x) => x.parsed.fen).join("\r\n")
  );
}

main();
