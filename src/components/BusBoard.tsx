"use client";

import { useState, useEffect, useCallback } from "react";
import type { BusArrival } from "@/lib/bustime";

interface CombinedArrival extends BusArrival {
  stopName: string;
  stopId: string;
}

interface BusApiResponse {
  arrivals: CombinedArrival[];
  error?: string;
  isLive: boolean;
  note?: string;
}

// Bus icon SVG
function BusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
    </svg>
  );
}

export default function BusBoard() {
  const [data, setData] = useState<BusApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchArrivals = useCallback(async () => {
    try {
      const response = await fetch("/api/buses");
      if (response.ok) {
        const result = await response.json();
        setData({
          arrivals: result.arrivals || [],
          error: result.error,
          isLive: result.isLive,
          note: result.note,
        });
        setLastUpdated(new Date());
      } else {
        setData({
          arrivals: [],
          error: "Failed to connect to bus data service.",
          isLive: false,
        });
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
      setData({
        arrivals: [],
        error: "Connection failed. Please check your network.",
        isLive: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArrivals();
    const interval = setInterval(fetchArrivals, 60000);
    return () => clearInterval(interval);
  }, [fetchArrivals]);

  const getStatusDisplay = (arrival: CombinedArrival) => {
    if (arrival.status === "approaching") return { text: "Arriving", className: "status-approaching" };
    if (arrival.status === "at-stop") return { text: "At Stop", className: "status-ontime" };
    return { text: "En Route", className: "" };
  };

  const arrivals = data?.arrivals ?? [];

  return (
    <div className="card-elevated h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon section-icon-bus">
          <BusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Bee-Line Bus</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Westchester County Transit</p>
        </div>
        <div className="flex items-center gap-3">
          {data && !loading && (
            data.isLive ? (
              <div className="live-indicator">
                <div className="live-dot" />
                <span>Live</span>
              </div>
            ) : (
              <span className="status-badge status-delayed">Offline</span>
            )
          )}
          {lastUpdated && (
            <span className="text-xs text-[var(--color-text-muted)] font-mono">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {data?.error && arrivals.length === 0 ? (
        <div className="error-state flex-1">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="error-title">Bus Data Unavailable</div>
          <div className="error-message">{data.error}</div>
        </div>
      ) : (
        <>
          {/* Note about data */}
          {data?.note && (
            <div className="text-xs text-[var(--color-text-muted)] px-5 py-2 italic border-b border-[var(--color-border)]">
              {data.note}
            </div>
          )}

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 table-header">
            <div className="col-span-2">Route</div>
            <div className="col-span-5">Destination</div>
            <div className="col-span-2 text-center">In</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          {/* Arrivals List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                  <div className="loading-spinner" />
                  <span className="text-sm">Loading bus arrivals...</span>
                </div>
              </div>
            ) : arrivals.length === 0 ? (
              <div className="empty-state h-24">
                <span className="text-sm">No buses at this time</span>
              </div>
            ) : (
              arrivals.slice(0, 6).map((arrival, index) => {
                const isImminent = arrival.minutesAway <= 3;
                const isFeatured = index === 0;
                const statusInfo = getStatusDisplay(arrival);

                return (
                  <div
                    key={`${arrival.vehicleId}-${arrival.routeId}-${index}`}
                    className={`table-row grid grid-cols-12 gap-2 animate-fade-in ${
                      isFeatured ? "table-row-featured" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Route */}
                    <div className="col-span-2">
                      <span className="route-badge route-badge-bus">
                        {arrival.routeName}
                      </span>
                    </div>

                    {/* Destination */}
                    <div className="col-span-5">
                      <div className="text-sm font-semibold text-[var(--color-text)] truncate">
                        {arrival.destination}
                      </div>
                      {arrival.stopName && (
                        <div className="text-xs text-[var(--color-text-muted)] truncate">
                          {arrival.stopName}
                        </div>
                      )}
                    </div>

                    {/* Minutes */}
                    <div className="col-span-2 text-center">
                      <span className={`minutes-display text-lg font-bold ${
                        isImminent ? "time-imminent" : "text-[var(--color-text)]"
                      }`}>
                        {arrival.minutesAway}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] ml-1">min</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-3 flex justify-end">
                      {statusInfo.className ? (
                        <span className={`status-badge ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)] font-medium">
                          {statusInfo.text}
                        </span>
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
