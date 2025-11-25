"use client";

import { useState, useEffect } from "react";
import type { TrainDeparture } from "@/lib/trains";

export default function TrainBoard() {
  const [departures, setDepartures] = useState<TrainDeparture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        const response = await fetch("/api/trains");
        if (response.ok) {
          const data = await response.json();
          setDepartures(data.departures || []);
        }
      } catch (error) {
        console.error("Error fetching trains:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartures();
    const interval = setInterval(fetchDepartures, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMinutesUntil = (isoString: string) => {
    const diff = Math.round((new Date(isoString).getTime() - Date.now()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="clean-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Metro-North</h2>
            <p className="text-xs text-white/40 mt-0.5">Mount Vernon West · Hudson Line</p>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-white/5 table-header">
        <div className="col-span-1">Train</div>
        <div className="col-span-4">Destination</div>
        <div className="col-span-2 text-center">Departs</div>
        <div className="col-span-2 text-center">Minutes</div>
        <div className="col-span-1 text-center">Track</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {/* Departures */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && departures.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-white/40">
            Loading...
          </div>
        ) : departures.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-white/40">
            No upcoming departures
          </div>
        ) : (
          departures.slice(0, 6).map((dep, i) => {
            const mins = getMinutesUntil(dep.departureTime);
            const isNext = i === 0;
            const isUrgent = mins <= 5;

            return (
              <div
                key={dep.id}
                className={`departure-row grid grid-cols-12 gap-3 items-center ${isNext ? "next-departure" : ""}`}
              >
                <div className="col-span-1">
                  <span className="train-badge">{dep.trainNumber}</span>
                </div>
                <div className="col-span-4 text-white font-medium truncate">
                  {dep.destination}
                </div>
                <div className="col-span-2 text-center text-white/60 tabular-nums">
                  {formatTime(dep.departureTime)}
                </div>
                <div className="col-span-2 text-center">
                  <span className={`text-2xl font-bold tabular-nums ${isUrgent ? "minutes-urgent" : "text-white"}`}>
                    {mins}
                  </span>
                  <span className="text-xs text-white/40 ml-1">min</span>
                </div>
                <div className="col-span-1 text-center text-white font-semibold">
                  {dep.track || "—"}
                </div>
                <div className="col-span-2 text-right">
                  {dep.status === "on-time" ? (
                    <span className="text-sm font-medium status-on-time">On Time</span>
                  ) : dep.status === "delayed" ? (
                    <span className="text-sm font-medium status-delayed">+{dep.delayMinutes}m Late</span>
                  ) : (
                    <span className="text-sm text-white/40">—</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
