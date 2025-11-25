"use client";

import { useState, useEffect } from "react";
import type { TrainDeparture } from "@/lib/trains";

export default function TrainBoard() {
  const [departures, setDepartures] = useState<TrainDeparture[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDepartures();
    const interval = setInterval(fetchDepartures, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMinutesUntil = (isoString: string) => {
    const now = new Date();
    const departure = new Date(isoString);
    const diff = Math.round((departure.getTime() - now.getTime()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="elegant-panel h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title text-2xl text-stone-200">
              Metro-North Railroad
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Departures from Mount Vernon West
            </p>
          </div>
          <div className="text-xs text-stone-600 uppercase tracking-wider">
            Hudson Line
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-white/5">
        <div className="col-span-1">Train</div>
        <div className="col-span-4">Destination</div>
        <div className="col-span-2 text-center">Departs</div>
        <div className="col-span-2 text-center">Minutes</div>
        <div className="col-span-1 text-center">Track</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {/* Departures List */}
      <div className="flex-1 overflow-hidden">
        {loading && departures.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-stone-500">
            Loading departures...
          </div>
        ) : departures.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-stone-500">
            No upcoming departures
          </div>
        ) : (
          departures.slice(0, 6).map((departure, index) => {
            const minutes = getMinutesUntil(departure.departureTime);
            const isImminent = minutes <= 5;
            const isFeatured = index === 0;

            return (
              <div
                key={departure.id}
                className={`departure-row grid grid-cols-12 gap-4 items-center animate-fade-in ${
                  isFeatured ? "featured" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Train Number */}
                <div className="col-span-1">
                  <span className="route-badge route-badge-train">
                    {departure.trainNumber}
                  </span>
                </div>

                {/* Destination */}
                <div className="col-span-4">
                  <div className="text-stone-200 font-medium">
                    {departure.destination}
                  </div>
                </div>

                {/* Departure Time */}
                <div className="col-span-2 text-center text-stone-400">
                  {formatTime(departure.departureTime)}
                </div>

                {/* Minutes */}
                <div className="col-span-2 text-center">
                  <span className={`minutes-display text-xl ${
                    isImminent ? "minutes-imminent" : "text-stone-200"
                  }`}>
                    {minutes}
                  </span>
                  <span className="text-xs text-stone-500 ml-1">min</span>
                </div>

                {/* Track */}
                <div className="col-span-1 text-center">
                  <span className="text-stone-300 font-medium">
                    {departure.track || "—"}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 text-right">
                  {departure.status === "on-time" ? (
                    <span className="text-sm status-ontime">On Time</span>
                  ) : departure.status === "delayed" ? (
                    <span className="text-sm status-delayed">
                      +{departure.delayMinutes} min
                    </span>
                  ) : (
                    <span className="text-sm text-stone-500">—</span>
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
