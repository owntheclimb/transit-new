"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrainDeparture } from "@/lib/trains";

interface TrainApiResponse {
  departures: TrainDeparture[];
  error?: string;
  isLive: boolean;
  dataSource?: string;
}

// Metro-North train icon SVG
function TrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8 2 4 2.5 4 6v9.5c0 1.93 1.57 3.5 3.5 3.5L6 21v1h2l2-2h4l2 2h2v-1l-1.5-2c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  );
}

export default function TrainBoard() {
  const [data, setData] = useState<TrainApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDepartures = useCallback(async () => {
    try {
      const response = await fetch("/api/trains");
      if (response.ok) {
        const result = await response.json();
        setData({
          departures: result.departures || [],
          error: result.error,
          isLive: result.isLive,
          dataSource: result.dataSource,
        });
        setLastUpdated(new Date());
      } else {
        setData({
          departures: [],
          error: "Failed to connect to train data service.",
          isLive: false,
        });
      }
    } catch (error) {
      console.error("Error fetching trains:", error);
      setData({
        departures: [],
        error: "Connection failed. Please check your network.",
        isLive: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartures();
    const interval = setInterval(fetchDepartures, 60000);
    return () => clearInterval(interval);
  }, [fetchDepartures]);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "--:--";
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "--:--";
    }
  };

  const getMinutesUntil = (isoString: string) => {
    try {
      const now = new Date();
      const departure = new Date(isoString);
      if (isNaN(departure.getTime())) return 0;
      const diff = Math.round((departure.getTime() - now.getTime()) / 60000);
      return Math.max(0, diff);
    } catch {
      return 0;
    }
  };

  const departures = data?.departures ?? [];

  return (
    <div className="card-elevated h-full flex flex-col overflow-hidden">
      {/* Header - Compact */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
          <TrainIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-[var(--color-text)] leading-tight">Metro-North Railroad</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">Mount Vernon West • Harlem Line</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {data?.isLive ? (
            <div className="live-indicator">
              <div className="live-dot" />
              <span>Live</span>
            </div>
          ) : data && !loading ? (
            <span className="status-badge status-delayed">Offline</span>
          ) : null}
        </div>
      </div>

      {/* Error State */}
      {data?.error && departures.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-[var(--color-accent-red)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="text-sm font-semibold text-[var(--color-text)]">Train Data Unavailable</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{data.error}</div>
        </div>
      ) : (
        <>
          {/* Table Header - Compact */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="col-span-2">Train</div>
            <div className="col-span-4">Destination</div>
            <div className="col-span-2 text-center">Departs</div>
            <div className="col-span-2 text-center">In</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Departures List - Compact rows, max 6 */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <div className="loading-spinner" />
                  <span className="text-xs">Loading...</span>
                </div>
              </div>
            ) : departures.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-xs text-[var(--color-text-muted)]">
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
                    className={`grid grid-cols-12 gap-2 items-center px-4 py-2.5 border-b border-[var(--color-border)] last:border-b-0 ${
                      isFeatured ? "bg-[var(--color-primary)]/[0.03]" : ""
                    } ${departure.status === "cancelled" ? "opacity-50" : ""}`}
                  >
                    {/* Train Number */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[var(--color-primary)] text-white text-xs font-bold min-w-[44px]">
                        {departure.trainNumber}
                      </span>
                    </div>

                    {/* Destination */}
                    <div className="col-span-4">
                      <div className="text-sm font-semibold text-[var(--color-text)] truncate">
                        {departure.destination}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">
                        {departure.line} Line
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div className="col-span-2 text-center">
                      <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                        {formatTime(departure.scheduledTime)}
                      </span>
                    </div>

                    {/* Minutes Until Departure */}
                    <div className="col-span-2 text-center">
                      <span className={`font-mono text-lg font-bold ${
                        isImminent ? "text-[var(--color-accent-orange)]" : "text-[var(--color-text)]"
                      }`}>
                        {minutes}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] ml-0.5">min</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-end">
                      {departure.status === "on-time" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-200">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          On Time
                        </span>
                      ) : departure.status === "delayed" && departure.delayMinutes > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200">
                          +{departure.delayMinutes}m
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
