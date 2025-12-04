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
      {/* Header */}
      <div className="section-header">
        <div className="section-icon">
          <TrainIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Metro-North Railroad</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Mount Vernon West • Harlem Line</p>
        </div>
        <div className="flex items-center gap-3">
          {data?.isLive ? (
            <div className="live-indicator">
              <div className="live-dot" />
              <span>Live</span>
            </div>
          ) : data && !loading ? (
            <span className="status-badge status-delayed">Offline</span>
          ) : null}
          {lastUpdated && (
            <span className="text-xs text-[var(--color-text-muted)] font-mono">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {data?.error && departures.length === 0 ? (
        <div className="error-state flex-1">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="error-title">Train Data Unavailable</div>
          <div className="error-message">{data.error}</div>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 table-header">
            <div className="col-span-1">Train</div>
            <div className="col-span-4">Destination</div>
            <div className="col-span-2 text-center">Scheduled</div>
            <div className="col-span-2 text-center">In</div>
            <div className="col-span-1 text-center">Track</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Departures List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                  <div className="loading-spinner" />
                  <span className="text-sm">Loading train departures...</span>
                </div>
              </div>
            ) : departures.length === 0 ? (
              <div className="empty-state h-32">
                <span className="text-sm">No upcoming departures</span>
              </div>
            ) : (
              departures.slice(0, 8).map((departure, index) => {
                const minutes = getMinutesUntil(departure.departureTime);
                const isImminent = minutes <= 5;
                const isFeatured = index === 0;

                return (
                  <div
                    key={departure.id}
                    className={`table-row grid grid-cols-12 gap-2 animate-fade-in ${
                      isFeatured ? "table-row-featured" : ""
                    } ${departure.status === "cancelled" ? "opacity-50" : ""}`}
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
                      <div className="text-base font-semibold text-[var(--color-text)] truncate">
                        {departure.destination}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {departure.line} Line
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div className="col-span-2 text-center">
                      <span className="time-display text-sm text-[var(--color-text-secondary)]">
                        {formatTime(departure.scheduledTime)}
                      </span>
                    </div>

                    {/* Minutes Until Departure */}
                    <div className="col-span-2 text-center">
                      <span className={`minutes-display text-xl font-bold ${
                        isImminent ? "time-imminent" : "text-[var(--color-text)]"
                      }`}>
                        {minutes}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] ml-1">min</span>
                    </div>

                    {/* Track */}
                    <div className="col-span-1 flex justify-center">
                      {departure.track ? (
                        <span className="track-badge">{departure.track}</span>
                      ) : (
                        <span className="text-[var(--color-text-muted)] text-sm">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-end">
                      {departure.status === "on-time" ? (
                        <span className="status-badge status-ontime">
                          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          On Time
                        </span>
                      ) : departure.status === "delayed" && departure.delayMinutes > 0 ? (
                        <span className="status-badge status-delayed">
                          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          +{departure.delayMinutes} min
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--color-text-muted)]">—</span>
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
