"use client";

import { useState, useEffect } from "react";
import type { TrainDeparture } from "@/lib/trains";

interface TrainBoardProps {
  initialDepartures?: TrainDeparture[];
}

export default function TrainBoard({ initialDepartures = [] }: TrainBoardProps) {
  const [departures, setDepartures] = useState<TrainDeparture[]>(initialDepartures);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDepartures = async () => {
    try {
      const response = await fetch("/api/trains");
      if (response.ok) {
        const data = await response.json();
        setDepartures(data.departures || []);
        setLastUpdated(new Date());
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
    <div className="glass-panel p-6 h-full flex flex-col">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon">
          <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Metro-North Railroad</h2>
          <p className="text-sm text-slate-400">Mount Vernon West • Hudson Line</p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-slate-500 font-mono">
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/5">
        <div className="col-span-1">Train</div>
        <div className="col-span-4">Destination</div>
        <div className="col-span-2 text-center">Departs</div>
        <div className="col-span-2 text-center">Time</div>
        <div className="col-span-1 text-center">Track</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {/* Departures List */}
      <div className="flex-1 overflow-hidden space-y-2">
        {loading && departures.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-3 text-slate-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading departures...
            </div>
          </div>
        ) : departures.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
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
                className={`departure-row grid grid-cols-12 gap-3 items-center animate-slide-in ${
                  isFeatured ? "featured" : ""
                } ${departure.status === "cancelled" ? "opacity-40" : ""}`}
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
                  <div className="text-base font-semibold text-white truncate">
                    {departure.destination}
                  </div>
                  <div className="text-xs text-slate-500">{departure.line}</div>
                </div>

                {/* Departure Time */}
                <div className="col-span-2 text-center">
                  <span className="font-mono text-base text-slate-300">
                    {formatTime(departure.departureTime)}
                  </span>
                </div>

                {/* Minutes */}
                <div className="col-span-2 text-center">
                  <span className={`minutes-display text-2xl font-bold ${
                    isImminent ? "minutes-imminent" : "text-white"
                  }`}>
                    {minutes}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">min</span>
                </div>

                {/* Track */}
                <div className="col-span-1 flex justify-center">
                  {departure.track ? (
                    <span className="track-display">{departure.track}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2 flex justify-end">
                  {departure.status === "on-time" ? (
                    <span className="status-badge status-ontime">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      On Time
                    </span>
                  ) : departure.status === "delayed" ? (
                    <span className="status-badge status-delayed">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      +{departure.delayMinutes}m
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500">—</span>
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
