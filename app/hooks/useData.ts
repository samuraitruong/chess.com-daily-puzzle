import { useState, useEffect } from "react";
import format from "date-fns/format";
import { title } from "process";

export interface IPuzzle {
  fen: string;
  title: string;
  moves: string[];
}
const NEXT_PUBLIC_DATA_URL = process.env.NEXT_PUBLIC_DATA_URL || "/api";
export function useData(date: Date) {
  const [data, setData] = useState<any>(null);
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

        const finddate =
          data.find((item: any) => item.date === format(date, "yyyy-MM-dd")) ||
          {};
        if (finddate) {
          const player = finddate.parsed.fen.includes(" b ") ? "b" : "w";
          finddate.viewerUrl = `https://chess-board.fly.dev?fen=${finddate.parsed.fen}&viewer=${player}`;
        }
        const moves = finddate.parsed.moves
          .split(" ")
          .filter((x: string) => !x.includes(".") && !["*"].includes(x));
        setData({
          title: finddate.title || "No puzzle found",
          fen: finddate.parsed?.fen || "",
          moves,
          result: finddate.parsed.moves,
        });
      } catch (error) {
        console.log(error);
        setError(error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cache, date]);

  return { data, error, loading };
}
