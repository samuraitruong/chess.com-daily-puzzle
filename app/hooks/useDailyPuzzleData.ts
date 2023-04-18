import { useState, useEffect } from "react";
import format from "date-fns/format";
import endOfMonth from "date-fns/endOfMonth";
import addDays from "date-fns/addDays";

export interface IPuzzle {
  fen?: string;
  title: string;
  player: string;
  moves: string[];
  result?: string;
  date?: string;
  disabledDays?: { from: Date; to: Date }[];
}
const NEXT_PUBLIC_DATA_URL = process.env.NEXT_PUBLIC_DATA_URL || "/api";
export function useDailyPuzzleData(date: Date) {
  const [puzzle, setData] = useState<IPuzzle>({
    fen: undefined,
    title: "No data found",
    player: "White",
    moves: [],
  });
  const [cache, setCache] = useState<any>({});

  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `${NEXT_PUBLIC_DATA_URL}/puzzle/${format(
          date,
          "yyyy"
        )}/${format(date, "yyyy-MM")}.json`;

        let data = cache[url];
        if (!data) {
          const response = await fetch(url);

          data = await response.json();
          cache[url] = data;
          setCache(cache);
        }

        const matchPuzzle = data.find(
          (item: any) => item.date === format(date, "yyyy-MM-dd")
        );
        const lastDate = data[data.length - 1].date;
        const nextDay = addDays(new Date(lastDate), 1);
        const disabledDays = [{ from: nextDay, to: endOfMonth(new Date()) }];

        if (matchPuzzle) {
          const player = matchPuzzle.parsed.fen.includes(" b ")
            ? "Black"
            : "White";
          const moves = matchPuzzle.parsed.moves
            .replace(/\d+\./gi, "")
            .replace("..", "")
            .split(" ")
            .filter(
              (x: string) => x && !["*", "1-0", "0-1", "1/2-1/2"].includes(x)
            );

          setData({
            title: matchPuzzle.title || "No puzzle found",
            fen: matchPuzzle.parsed?.fen || "",
            moves,
            player,
            result: matchPuzzle.parsed.moves,
            date: matchPuzzle.date,
            disabledDays,
          });
        } else {
          setData({
            ...puzzle,
            disabledDays,
          });
        }
      } catch (error) {
        console.log(error);
        setError(error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    if (date) {
      fetchData();
    }
  }, [cache, date]);

  return { data: puzzle, error, loading };
}
