import { Inter } from "next/font/google";
import { useDailyPuzzleData } from "@/hooks/useDailyPuzzleData";
import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { Chessboard } from "react-chessboard";
import { Chess, Move, Piece, Square } from "chess.js";
import { ToastContainer, toast } from "react-toastify";
import "react-day-picker/dist/style.css";
import "react-toastify/dist/ReactToastify.css";
import { usePuzzleHistory } from "@/hooks/usePuzzleHistory";
import { useRouter } from "next/router";
import { format } from "date-fns";
import useScreenSize from "@/hooks/useScreenSize";
import { motion } from "framer-motion";

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
  const [timer, setTimer] = useState(0);
  const [showAnimation, setShowAnimation] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0); // Track failed attempts
  const [disabledDays, setDisabledDays] = useState<Date[]>([]); // State to hold disabled days

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!solved) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [solved]);

  useEffect(() => {
    setTimer(0); // Reset timer when a new puzzle is selected
  }, [date]);

  useEffect(() => {
    if (puzzleData?.disabledDays) {
      setDisabledDays(puzzleData.disabledDays);
    }
  }, [puzzleData]);

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

  const onDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ) => {
    if (sourceSquare === targetSquare) {
      toast.error("Invalid move: Source and target squares are the same.", {
        autoClose: 3000,
      });
      return false;
    }
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1]?.toLocaleLowerCase() ?? "q",
    });
    console.log("move", move);
    if (!move) {
      handleInvalidMove();
      return false;
    }
    handleValidMove(move);
    return true;
  };

  const onSquareClick = (square: Square, piece: string) => {
    console.log("square", square, selectedSquare);

    if (solved) return;

    if (!selectedSquare) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setPossibleMoves(moves.map((m: any) => m.to));
    } else {
      if (selectedSquare === square) {
        return;
      }
      console.log("piece", piece);
      const move = makeAMove({
        from: selectedSquare,
        to: square,
        promotion: piece?.[1].toLocaleLowerCase() ?? "q",
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
    setFailedAttempts((prev) => prev + 1); // Increment failed attempts
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
    setFailedAttempts(0); // Reset failed attempts on a valid move
    setPossibleMoves([]);
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

  const handleMoveHover = (fen: string) => {
    setGame(new Chess(fen));
  };

  const handleMoveMouseOut = () => {
    if (solvingMoves.length > 0) {
      const lastMove = solvingMoves[solvingMoves.length - 1];
      setGame(new Chess(lastMove.after));
    } else {
      setGame(new Chess(currentFen));
    }
  };

  const currentFen = game.fen();
  const player = puzzleData?.player;

  const renderMoveList = () => {
    return solvingMoves.map((move, index) => (
      <span
        key={index}
        className="mr-2 text-yellow-400 hover:cursor-pointer"
        onMouseEnter={() => handleMoveHover(move.after)}
        onMouseLeave={handleMoveMouseOut}
      >
        {index % 2 === 0 && `${Math.floor(index / 2) + 1}.`}{" "}
        {index % 2 === 1 && player === "black" && "..."}
        {move.san}
      </span>
    ));
  };

  const animationVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
  };

  useEffect(() => {
    if (solved) {
      const timer = setTimeout(() => setShowAnimation(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [solved]);

  const handleHintClick = () => {
    if (validMoves.length > 0) {
      const firstMove = validMoves[0];
      const tempGame = new Chess(game.fen()); // Create a temporary game instance
      const moveResult = tempGame.move(firstMove); // Get the move result

      if (moveResult) {
        setSelectedSquare(moveResult.from); // Select the beginning square of the first valid move
        const moves = game.moves({ square: moveResult.from, verbose: true });
        setPossibleMoves(moves.map((m: any) => m.to)); // Highlight possible moves from the selected square
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10 md:p-5 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm lg:flex flex-col">
        <div className="grid grid-flow-row md:grid-flow-col grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1 w-full">
          <div className="col-span-9 border-r border-gray-800 border-opacity-80 pr-4">
            <p className="text-yellow-400">{puzzleData?.title}</p>
            <Chessboard
              promotionToSquare={selectedSquare}
              showPromotionDialog={true}
              showBoardNotation={false}
              boardWidth={
                screen.width <= 768 ? screen.width - 50 : screen.height - 100
              }
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
              className="bg-white text-black shadow-lg rounded-lg p-4"
              month={date}
              mode="single"
              selected={date}
              onSelect={onDateChanged as any}
              onMonthChange={onDateChanged}
              disabled={disabledDays} // Use the disabledDays state here
              modifiers={{ solved: puzzleHistory.days }}
              modifiersClassNames={{ solved: puzzleHistory.classNames.solved }}
            />
            <p className="text-yellow-400 my-5">{player} to play</p>
            <p className="text-yellow-500">
              {message} ({Math.floor(timer / 60)}:
              {timer % 60 < 10 ? `0${timer % 60}` : timer % 60})
            </p>
            <div className="w-full p-2">
              <div className="flex flex-wrap">{renderMoveList()}</div>
            </div>
            {failedAttempts >= 3 && (
              <button
                onClick={handleHintClick}
                className="mt-4 bg-yellow-500 text-black rounded p-2"
              >
                Hint
              </button>
            )}
          </div>
        </div>
      </div>
      <ToastContainer
        theme="colored"
        autoClose={false}
        position={screen.width <= 768 ? "bottom-center" : "top-right"}
      />
      {solved && showAnimation && (
        <motion.div
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={animationVariants}
          transition={{ duration: 0.5 }}
          onClick={() => {
            setShowAnimation(false);
          }}
        >
          <div className="text-white text-4xl font-bold">
            🎉 Puzzle Solved! 🎉
          </div>
        </motion.div>
      )}
    </main>
  );
}
