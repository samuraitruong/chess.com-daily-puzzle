import { useState, useEffect } from "react";
import { format, endOfMonth, addDays } from "date-fns";

export interface IPuzzle {
  fen?: string;
  title: string;
  player: string;
  moves: string[];
  result?: string;
  date?: string;
  disabledDays?: Date[];
  id?: number;
  pgn?: string;
  video?: {
    url: string;
    author_id: string;
  };
  comment_count?: number;
  solved_count?: number;
}
const NEXT_PUBLIC_DATA_URL = process.env.NEXT_PUBLIC_DATA_URL || "";
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
        const availableDates = data.map((item: any) => item.date);
        const allDaysInMonth = Array.from(
          { length: endOfMonth(date).getDate() },
          (_, i) => {
            const day = new Date(date.getFullYear(), date.getMonth(), i + 1);
            return format(day, "yyyy-MM-dd");
          }
        );

        const disabledDays = allDaysInMonth
          .filter((day) => !availableDates.includes(day))
          .map((day) => new Date(day)); // Convert to { from: Date; to: Date } format

        if (matchPuzzle) {
          const player = matchPuzzle.parsed.fen.includes(" b ")
            ? "Black"
            : "White";
          const moves = matchPuzzle.parsed.moves.filter(
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
            id: matchPuzzle.id,
            pgn: matchPuzzle.pgn,
            video: matchPuzzle.video,
            comment_count: matchPuzzle.comment_count,
            solved_count: matchPuzzle.solved_count,
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
