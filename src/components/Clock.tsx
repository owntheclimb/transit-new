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
      <div className="clock-display text-6xl font-bold text-transit-text">
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
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center">
      <div className="clock-display text-7xl font-bold text-transit-text tracking-wide">
        {hour12}:{minutes}
        <span className="text-4xl text-transit-muted ml-2">{seconds}</span>
        <span className="text-3xl text-transit-accent ml-3">{ampm}</span>
      </div>
      <div className="text-xl text-transit-muted mt-2 font-light tracking-wide">
        {dateStr}
      </div>
    </div>
  );
}

