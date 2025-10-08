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
import { addDays, format, subDays, isSameDay } from "date-fns";
import useScreenSize from "@/hooks/useScreenSize";
import { motion } from "framer-motion";
 

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
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [timer, setTimer] = useState(0);
  const [showSolvedModal, setShowSolvedModal] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0); // Track failed attempts
  const [disabledDays, setDisabledDays] = useState<Date[]>([]); // State to hold disabled days

  const [promotionSquare, setPromotionSquare] = useState<Square | undefined>(); // State to hold disabled days
  const [showPromotionDialog, setShowPromotionDialog] = useState(false); // State to hold disabled days
  const { data: puzzleData } = useDailyPuzzleData(date);

  const routerDate = useMemo(
    () => (router.query.date ? new Date(router.query.date as string) : null),
    [router.query?.date]
  );

  useEffect(() => {
    if (puzzleData?.fen) {
      initializePuzzle(puzzleData.fen, puzzleData.moves);
    }
  }, [puzzleData, date]);

  useEffect(() => {
    if (routerDate && !isSameDay(routerDate, date)) {
      setSelected(routerDate);
    }
  }, [routerDate, date]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
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
    setGame(new Chess(fen));
    setValidMoves(moves);
    setSolved(false);
  };

  const onDateChanged = (newDate: Date) => {
    if (newDate) {
      router.push("/?date=" + format(newDate, "yyyy-MM-dd"));
      setSelected(newDate);
      localStorage.setItem("lastPuzzleDate", newDate.toISOString());
      // provide immediate visual feedback
      setSolvingMove([]);
      setValidMoves([]);
      setGame(new Chess());
      setSolved(false);
      setMessage("Loading...");
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
      toast.error("Invalid move: source and target are the same.", { autoClose: 2500 });
      return false;
    }
    const move = makeAMove({
      from: sourceSquare || selectedSquare,
      to: targetSquare,
      promotion: piece[1]?.toLocaleLowerCase() ?? "q",
    });
    if (!move) {
      handleInvalidMove();
      setShowPromotionDialog(false);
      setPromotionSquare(undefined);
      return false;
    }
    handleValidMove(move);
    setShowPromotionDialog(false);
    setPromotionSquare(undefined);
    return true;
  };

  const onSquareClick = (square: Square, piece: Piece | undefined) => {
    if (solved) return;

    const moves = game.moves({ square, verbose: true });
    const promotionMove = moves.find((m) => m.san.includes("="));
    if (promotionMove) {
      setPromotionSquare(promotionMove.to);
    } else {
      //setPromotionSquare(undefined);
      setShowPromotionDialog(false);
    }
    if (!selectedSquare) {
      setSelectedSquare(square);
      setPossibleMoves(moves);
    } else {
      if (selectedSquare === square) {
        return;
      }
      if (square === promotionSquare) {
        setShowPromotionDialog(true);
        return;
      }
      const piceString = piece?.toString();
      const move = makeAMove({
        from: selectedSquare,
        to: square,
        promotion: piceString?.[1].toLocaleLowerCase() ?? "q",
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
    toast.error("Incorrect move! Please try again.", { autoClose: 2500 });
    setSelectedSquare(null);
    setPossibleMoves([]);
    setFailedAttempts((prev) => prev + 1); // Increment failed attempts
  };

  const handleValidMove = (move: any) => {
    const newMoves = [...solvingMoves, move];
    setGame(new Chess(move.after));
    setSolvingMove(newMoves);
    // no toast; moves appear in the right panel

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
      }, 500);
    } else {
      puzzleHistory.setSolved(date);
      setSolved(true);
      setMessage("Solved");
      setShowSolvedModal(true);
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
  const isErrorStatus = message.toLowerCase().includes("incorrect");

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

  // solved modal will be controlled explicitly

  const handleHintClick = () => {
    if (validMoves.length > 0) {
      const firstMove = validMoves[0];
      const tempGame = new Chess(game.fen()); // Create a temporary game instance
      const moveResult = tempGame.move(firstMove); // Get the move result

      if (moveResult) {
        setSelectedSquare(moveResult.from); // Select the beginning square of the first valid move
        const moves = game.moves({ square: moveResult.from, verbose: true });
        setPossibleMoves(moves); // Highlight possible moves from the selected square
      }
    }
  };

  const isDateDisabled = (d: Date) =>
    disabledDays.some((dd) => isSameDay(dd, d));

  const gotoPrevDate = () => {
    let d = subDays(date, 1);
    // Skip disabled days if provided
    let guard = 0;
    while (isDateDisabled(d) && guard < 366) {
      d = subDays(d, 1);
      guard++;
    }
    onDateChanged(d);
  };

  const gotoNextDate = () => {
    let d = addDays(date, 1);
    let guard = 0;
    while (isDateDisabled(d) && guard < 366) {
      d = addDays(d, 1);
      guard++;
    }
    onDateChanged(d);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-2 md:px-4 lg:px-6 py-2 md:py-4">
        <header className="mb-2 md:mb-4">
          <div className="flex items-center justify-center">
            <h1 className="text-center text-xl md:text-2xl font-semibold tracking-tight">
              Sharpen your tactics. One puzzle a day.
            </h1>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9 xl:col-span-9">
            <div className="relative rounded-xl border border-slate-800/60 bg-slate-900/60 shadow-2xl">
              <div className="p-3 md:p-3 border-b border-slate-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base font-medium text-amber-300/90 truncate">
                    {puzzleData?.title || "Puzzle"}
                  </span>
                </div>
              </div>
              <div className="p-3 md:p-3">
                <div className="flex w-full items-center justify-center">
                  <Chessboard
                    promotionToSquare={promotionSquare}
                    showPromotionDialog={showPromotionDialog}
                    showBoardNotation={true}
                    customBoardStyle={{ overflow: "visible" }}
                    boardWidth={
                      screen.width <= 768 ? Math.max(260, screen.width - 40) : Math.min(720, screen.height - 140)
                    }
                    position={currentFen}
                    onPieceDrop={onDrop}
                    onSquareClick={onSquareClick as any}
                    boardOrientation={player?.toLowerCase() as any}
                    animationDuration={500}
                    customSquareStyles={Object.fromEntries(
                      possibleMoves.map((move) => [
                        move.to,
                        { backgroundColor: "rgba(251, 191, 36, 0.45)" },
                      ])
                    )}
                  />
                </div>
              </div>
              <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-slate-800/60" />
            </div>
          </div>

          <aside className="lg:col-span-3 xl:col-span-3 space-y-6">
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur shadow-xl">
              <div className="p-4 md:p-5 border-b border-slate-800/60">
                <div className="flex items-center justify-between gap-1 w-full">
                    <button
                      aria-label="Previous date"
                      onClick={gotoPrevDate}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800"
                    >
                      <svg className="h-4 w-4 text-slate-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.78 15.53a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 1 1 1.06 1.06L8.56 10l4.22 4.22a.75.75 0 0 1 0 1.06z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      aria-label="Select date"
                      onClick={() => setShowSolvedModal(true)}
                      className="px-2 md:px-3 h-8 inline-flex flex-1 items-center justify-center rounded-md border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 text-xs md:text-sm font-medium text-slate-200 mx-1"
                    >
                      {format(date, "yyyy-MM-dd")}
                    </button>
                    <button
                      aria-label="Next date"
                      onClick={gotoNextDate}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800"
                    >
                      <svg className="h-4 w-4 text-slate-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.22 4.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.44 10 7.22 5.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>
                </div>
              </div>
              <div className="p-3 md:p-5 space-y-3">
                <div className="text-sm font-medium text-amber-300/90">
                  {player ? `${player.charAt(0).toUpperCase()}${player.slice(1)} to play` : ''}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Timer</span>
                  <span className="text-slate-200 font-medium">{Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className={isErrorStatus ? "font-medium text-red-400" : "text-slate-200 font-medium"}>
                    {message || (solved ? "Solved" : "Solving...")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {solvingMoves.length === 0 ? (
                    <span className="text-sm text-slate-500">Your moves will appear here.</span>
                  ) : (
                    renderMoveList()
                  )}
                </div>
                {failedAttempts >= 3 && (
                  <button
                    onClick={handleHintClick}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  >
                    Hint
                  </button>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
      <ToastContainer theme="colored" autoClose={false} position="top-right" />
      {showSolvedModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={animationVariants}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">{solved ? '🎉 Puzzle Solved!' : 'Select a date'}</h3>
            <p className="text-slate-300 mb-4">{solved ? 'Pick another date to try a different daily puzzle.' : 'Choose a date to jump to that daily puzzle.'}</p>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3 md:p-4 mb-4">
              <DayPicker
                className="rdp-dark"
                month={date}
                mode="single"
                selected={date}
                onSelect={(d: any) => {
                  if (!d) return;
                  onDateChanged(d);
                  setShowSolvedModal(false);
                }}
                onMonthChange={(m) => onDateChanged(m)}
                disabled={disabledDays}
                modifiers={{ solved: puzzleHistory.days }}
                modifiersClassNames={{ solved: puzzleHistory.classNames.solved }}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowSolvedModal(false)} className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-sm hover:bg-slate-800">Close</button>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
