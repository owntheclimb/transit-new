"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="text-4xl font-semibold text-white">--:--</div>;

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="text-right">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-semibold text-white tabular-nums">
          {hour12}:{minutes}
        </span>
        <span className="text-lg text-white/50">{ampm}</span>
      </div>
      <div className="text-sm text-white/40 mt-0.5">{dateStr}</div>
    </div>
  );
}
