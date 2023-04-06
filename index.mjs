import axios from "axios";
import asyncPool from "tiny-async-pool";
import moment from "moment";
import fs from "fs";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

function parsePgn(pgn) {
  const lines = pgn.split("\r\n").filter((x) => x !== "");
  const moves = lines.pop();
  const data = { moves };
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
  const end = now.format("YYYY-MM-DD");
  const start = now.startOf("month").format("YYYY-MM-DD");

  const url = `https://www.chess.com/callback/puzzles/daily?start=${start}&end=${end}`;
  const { data } = await axios.get(url);
  return data.map((item) => {
    return { ...item, parsed: parsePgn(item.pgn) };
  });
}
async function main() {
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
    const currentMonth = moment().subtract(+month, "months").endOf("month");
    const data = await fetchMonth(currentMonth);
    console.log(currentMonth.format("MM/YYYY"), data.length);
    const key = `puzzle/${currentMonth.format("YYYY/YYYY-MM")}.json`;
    fs.mkdirSync(`puzzle/${currentMonth.format("YYYY")}`, { recursive: true });
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

  fs.writeFileSync("puzzle/all.json", JSON.stringify(allPuzzle, null, 4));
  fs.writeFileSync(
    "puzzle/all.txt",
    allPuzzle.map((x) => x.parsed.fen).join("\r\n")
  );
}

main();
