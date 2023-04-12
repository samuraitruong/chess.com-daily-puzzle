// import Image from "next/image";
import { Inter } from "next/font/google";
import { useData } from "@/hooks/useData";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [date, setSelected] = useState<Date>(new Date());
  const { data } = useData(date);
  const player = data?.parsed?.fen?.includes(" w ") ? "White" : "Black";
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-cols-1 gap-4">
          <p className="text-blue-600">{data?.title}</p>
          <p className="text-blue-500">{player} to play</p>
          <img src={data?.viewerUrl} alt="image" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={setSelected as any}
            onMonthChange={setSelected}
          />
        </div>
      </div>
    </main>
  );
}
