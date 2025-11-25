"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="clock-time text-5xl font-semibold">
        --:--
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="text-right">
      <div className="flex items-baseline gap-2">
        <span className="clock-time text-5xl font-semibold tracking-tight">
          {hour12}:{minutes}
        </span>
        <span className="text-xl text-slate-500 font-mono">{seconds}</span>
        <span className="text-lg font-semibold text-teal-400 ml-1">{ampm}</span>
      </div>
      <div className="text-sm text-slate-500 font-medium mt-1">
        {dateStr}
      </div>
    </div>
  );
}
