import { Inter } from "next/font/google";
import { useDailyPuzzleData } from "@/hooks/useDailyPuzzleData";
import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { ToastContainer, toast } from "react-toastify";
import "react-day-picker/dist/style.css";
import "react-toastify/dist/ReactToastify.css";
import { usePuzzleHistory } from "@/hooks/usePuzzleHistory";
import { useRouter } from "next/router";
import { format } from "date-fns";
import useScreenSize from "@/hooks/useScreenSize";
import { sq } from "date-fns/locale";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const screen = useScreenSize();
  const puzzleHistory = usePuzzleHistory();

  const [date, setSelected] = useState<Date>(new Date());
  const [message, setMessage] = useState("");
  const [solvingMoves, setSolvingMove] = useState<Move[]>([]);
  const [solved, setSolved] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  const { data: puzzleData } = useDailyPuzzleData(date);

  const routerDate = useMemo(
    () => router.query.date && new Date(router.query.date as string),
    [router]
  );

  useEffect(() => {
    if (puzzleData?.fen) {
      initializePuzzle(puzzleData.fen, puzzleData.moves);
    }
  }, [puzzleData, date]);

  useEffect(() => {
    if (routerDate) {
      setTimeout(() => setSelected(routerDate), 1000);
    }
  }, [routerDate]);

  const initializePuzzle = (fen: string, moves: string[]) => {
    setMessage("Solving...");
    toast.dismiss();
    setGame(new Chess(fen));
    setValidMoves(moves);
    setSolved(false);
  };

  const onDateChanged = (newDate: Date) => {
    if (newDate) {
      router.push("/?date=" + format(newDate, "yyyy-MM-dd"));
      setSelected(newDate);
      localStorage.setItem("lastPuzzleDate", newDate.toISOString());
      setSolvingMove([]);
    }
  };

  const makeAMove = (move: any) => {
    try {
      const t = new Chess(game.fen());
      const result = t.move(move);
      if (result?.san !== validMoves[0]) return null;
      game.move(move);
      return result;
    } catch {
      return false;
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (!move) {
      handleInvalidMove();
      return false;
    }
    handleValidMove(move);
    return true;
  };

  const onSquareClick = (square: Square) => {
    if (solved) return;

    if (!selectedSquare) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setPossibleMoves(moves.map((m: any) => m.to));
    } else {
      const move = makeAMove({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });
      if (move) {
        handleValidMove(move);
      } else {
        handleInvalidMove();
      }
      setSelectedSquare(null); // Reset selected square after attempting a move
      setPossibleMoves([]); // Clear possible moves after attempting a move
    }
  };

  const handleInvalidMove = () => {
    setMessage("Incorrect move");
    toast.error("Incorrect move! Please try again", { autoClose: 3000 });
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const handleValidMove = (move: any) => {
    const newMoves = [...solvingMoves, move];
    setGame(new Chess(move.after));
    setSolvingMove(newMoves);
    toast.dismiss();
    toast(move.san, { type: "info" });

    const computerMove = validMoves[1];
    const remainingMoves = validMoves.slice(2);

    setValidMoves(validMoves.slice(1));

    if (computerMove) {
      setMessage("Solving...");
      setTimeout(() => {
        const t = new Chess(move.after);
        const result = t.move(computerMove);
        const updatedMoves = [...newMoves, result];
        setGame(new Chess(result.after));
        setSolvingMove(updatedMoves);
        setValidMoves(remainingMoves);
        toast(computerMove, { type: "warning", autoClose: false });
      }, 500);
    } else {
      puzzleHistory.setSolved(date);
      setSolved(true);
      setMessage("Solved");
      toast("Great, You solved it!", { type: "success", autoClose: false });
      setTimeout(() => toast.dismiss(), 5000);
    }
  };

  const currentFen = game.fen();
  const player = puzzleData?.player;

  const renderMoveList = () => {
    return solvingMoves.map((move, index) => (
      <span key={index} className="mr-2">
        {index % 2 === 0 && `${Math.floor(index / 2) + 1}.`}{" "}
        {index % 2 === 1 && player === "black" && "..."}
        {move.san}
      </span>
    ));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10 md:p-5">
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-flow-col grid-cols-2 grid-rows-1 w-full">
          <div className="col-span-9">
            <p className="text-blue-600">{puzzleData?.title}</p>
            <Chessboard
              boardWidth={screen.height - 300}
              position={currentFen}
              onPieceDrop={onDrop}
              onSquareClick={onSquareClick}
              boardOrientation={player?.toLowerCase() as any}
              animationDuration={500}
              customSquareStyles={Object.fromEntries(
                possibleMoves.map((square) => [
                  square,
                  { backgroundColor: "rgba(255, 255, 0, 0.4)" },
                ])
              )}
            />
          </div>
          <div className="col-span-3 items-center flex flex-col">
            <DayPicker
              month={date}
              mode="single"
              selected={date}
              onSelect={onDateChanged as any}
              onMonthChange={onDateChanged}
              disabled={puzzleData?.disabledDays}
              modifiers={{ solved: puzzleHistory.days }}
              modifiersClassNames={{ solved: puzzleHistory.classNames.solved }}
            />
            <p className="text-blue-500 my-5">{player} to play</p>
            <p className="text-blue-600">{message}</p>
            <div className="w-full p-2">
              <div className="flex flex-wrap">{renderMoveList()}</div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer theme="colored" autoClose={false} />
    </main>
  );
}
