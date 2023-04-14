// import Image from "next/image";
import { Inter } from "next/font/google";
import { useData } from "@/hooks/useData";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { ToastContainer, toast } from "react-toastify";
import "react-day-picker/dist/style.css";
import "react-toastify/dist/ReactToastify.css";
import { usePuzzleHistory } from "@/hooks/usePuzzleHistory";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [date, setSelected] = useState<Date>(new Date());
  const [message, setMessage] = useState("");

  const puzzleHistory = usePuzzleHistory();

  const [game, setGame] = useState(new Chess());
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const { data } = useData(date);
  const disabledDays = [{ from: new Date(), to: new Date(2030, 4, 29) }];
  useEffect(() => {
    if (data) {
      setMessage("Solving...");
      toast.dismiss();
      // console.log(data);
      setGame(new Chess(data?.fen));
      setValidMoves(data.moves);
    }
  }, [data]);

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
    console.log("humand move result", move);
    if (!move) {
      setMessage("Incorect move");
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
        setValidMoves(remainingMoves);
        // Make computer move
        setGame(new Chess(result.after) as any);
        toast(computerMove, { type: "warning", autoClose: false });
      }, 200);
    } else {
      puzzleHistory.setSolved(date);
      setMessage("Solved");
      toast("You solved it!", { type: "success", autoClose: false });
    }

    return true;
  };

  const player = data?.fen?.includes(" w ") ? "White" : "Black";
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-flow-col grid-cols-2 grid-rows-1 w-full">
          <div className="col-span-9">
            <p className="text-blue-600">{data?.title}</p>
            <p className="text-blue-500 my-5">{player} to play</p>

            {/* <p className="text-blue-600">{data?.result}</p> */}

            <Chessboard
              position={game.fen()}
              onPieceDrop={onDrop}
              boardOrientation={player.toLocaleLowerCase() as any}
            />
          </div>
          <div className="col-span-3 items-center flex flex-col">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setSelected as any}
              onMonthChange={setSelected}
              disabled={disabledDays}
              modifiers={{ solved: puzzleHistory.days }}
              // modifiersStyles={{ solved: puzzleHistory.styles }}
              modifiersClassNames={{ solved: puzzleHistory.classNames.solved }}
            />
            <p className="text-blue-600">{message}</p>
          </div>
        </div>
      </div>
      <ToastContainer theme="colored" autoClose={false} />
    </main>
  );
}
