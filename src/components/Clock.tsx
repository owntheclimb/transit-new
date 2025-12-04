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
      <div className="text-right">
        <div className="clock-time">--:--</div>
      </div>
    );
  }

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
      <div className="flex items-baseline gap-1">
        <span className="clock-time">
          {hour12}:{minutes}
        </span>
        <span className="text-lg font-semibold text-[var(--color-primary)]">{ampm}</span>
      </div>
      <div className="clock-date">
        {dateStr}
      </div>
    </div>
  );
}
