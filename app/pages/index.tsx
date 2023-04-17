// import Image from "next/image";
import { Inter } from "next/font/google";
import { useDailyPuzzleData } from "@/hooks/useDailyPuzzleData";
import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { ToastContainer, toast } from "react-toastify";
import "react-day-picker/dist/style.css";
import "react-toastify/dist/ReactToastify.css";
import { usePuzzleHistory } from "@/hooks/usePuzzleHistory";
import { useRouter } from "next/router";
import { format } from "date-fns";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  let initialDate = new Date();

  const routerDate = useMemo(
    () => router.query.date && new Date(router.query.date as string),
    [router]
  );

  const [date, setSelected] = useState<Date>(initialDate);
  const [message, setMessage] = useState("");
  const [solved, setSolved] = useState(false);
  const puzzleHistory = usePuzzleHistory();

  const [game, setGame] = useState(new Chess());
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const { data: puzzleData } = useDailyPuzzleData(date);

  const onDateChanged = (newDate: Date) => {
    if (newDate) {
      router.push("/?date=" + format(newDate, "yyyy-MM-dd"));
      setSelected(newDate);
      localStorage.setItem("lastPuzzleDate", newDate.toISOString());
    }
  };

  useEffect(() => {
    if (puzzleData && puzzleData.fen) {
      setMessage("Solving...");
      toast.dismiss();
      setGame(new Chess(puzzleData.fen));
      setValidMoves(puzzleData.moves);
      setSolved(false);
    }
  }, [puzzleData, date]);

  useEffect(() => {
    if (routerDate) {
      setTimeout(() => {
        setSelected(routerDate);
      }, 1000);
    }
  }, [routerDate]);

  function makeAMove(move: any) {
    try {
      const t = new Chess(game.fen());
      const result = t.move(move);
      console.log(result, validMoves);
      if (result.san !== validMoves[0]) return null;
      return result;
    } catch (e) {
      return false;
    }
  }

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move: any = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });
    console.log("Your move: ", move);
    if (!move) {
      setMessage("Incorect move");
      toast.error("Incorect move!, please try again", {
        type: "error",
        autoClose: 3000,
      });
      return false;
    }

    setGame(new Chess(move.after) as any);
    toast(move.san, { type: "info" });
    const computerMove = validMoves[1];
    const remainingMoves = validMoves.slice(2);

    setValidMoves(validMoves.slice(1));
    if (computerMove) {
      setMessage("Solving...");
      setTimeout(() => {
        const t = new Chess(move.after);
        const result = t.move(computerMove as any);
        console.log("Computer move: ", result);
        setValidMoves(remainingMoves);
        // Make computer move
        setGame(new Chess(result.after) as any);
        toast(computerMove, { type: "warning", autoClose: false });
      }, 200);
    } else {
      puzzleHistory.setSolved(date);
      setSolved(true);
      setMessage("Solved");
      toast("Great, You solved it!", { type: "success", autoClose: false });
      setTimeout(() => {
        toast.dismiss();
      }, 5000);
    }

    return true;
  };
  const currentFen = game.fen();
  const player = puzzleData?.player;
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 md:p-5">
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-flow-col grid-cols-2 grid-rows-1 w-full">
          <div className="col-span-9">
            <p className="text-blue-600">{puzzleData?.title}</p>
            <p className="text-blue-500 my-5">{player} to play</p>

            {/* <p className="text-blue-600">{data?.result}</p> */}

            <Chessboard
              position={currentFen}
              onPieceDrop={onDrop}
              boardOrientation={player.toLocaleLowerCase() as any}
              animationDuration={300}
              arePiecesDraggable={!solved}
            />
          </div>
          <div className="col-span-3 items-center flex flex-col">
            <DayPicker
              // defaultMonth={date}
              month={date}
              mode="single"
              selected={date}
              onSelect={onDateChanged as any}
              onMonthChange={onDateChanged}
              disabled={puzzleData.disabledDays}
              modifiers={{ solved: puzzleHistory.days }}
              // modifiersStyles={{ solved: puzzleHistory.styles }}
              modifiersClassNames={{
                solved: puzzleHistory.classNames.solved,
              }}
            />
            <p className="text-blue-600">{message}</p>
          </div>
        </div>
      </div>
      <ToastContainer theme="colored" autoClose={false} />
    </main>
  );
}
