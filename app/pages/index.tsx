// import Image from "next/image";
import { Inter } from "next/font/google";
import { useData } from "@/hooks/useData";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Chessboard } from "react-chessboard";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [date, setSelected] = useState<Date>(new Date());
  const { data } = useData(date);
  const player = data?.parsed?.fen?.includes(" w ") ? "White" : "Black";
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-flow-col grid-cols-2 grid-rows-1 w-full">
          <div className="col-span-9">
            <p className="text-blue-600">{data?.title}</p>
            <p className="text-blue-500 my-5">{player} to play</p>

            <Chessboard
              position={data?.parsed?.fen}
              boardOrientation={player.toLocaleLowerCase() as any}
            />
            {/* <img src={data?.viewerUrl} alt="image" /> */}
          </div>
          <div className="col-span-3 items-center flex">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setSelected as any}
              onMonthChange={setSelected}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
