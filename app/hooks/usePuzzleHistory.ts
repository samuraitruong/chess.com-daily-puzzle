import { useState, useEffect, useCallback } from "react";

export function usePuzzleHistory() {
  const [days, setDays] = useState<any>([]);
  const setSolved = useCallback(
    (date: Date) => {
      const solvedDays = [...days, date];
      localStorage.setItem("solved", JSON.stringify(solvedDays));
      setDays(solvedDays);
    },
    [days]
  );

  useEffect(() => {
    const solved = localStorage.getItem("solved");
    if (solved) {
      setDays(JSON.parse(solved).map((x: string) => new Date(x)));
    }
  }, []);

  return {
    days,
    styles: { backgroundColor: "green", color: "white" },
    setSolved,
  };
}
