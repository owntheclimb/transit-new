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
      <div className="clock-display text-5xl text-stone-300">
        --:--
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-right">
      <div className="flex items-baseline gap-3">
        <span className="clock-display text-5xl text-stone-200">
          {hour12}:{minutes}
        </span>
        <span className="text-xl text-stone-500">{ampm}</span>
      </div>
      <div className="text-sm text-stone-500 mt-1">
        {dateStr}
      </div>
    </div>
  );
}
