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
    if (arrival.status === "approaching") return { text: "Arriving", isApproaching: true };
    if (arrival.status === "at-stop") return { text: "At Stop", isAtStop: true };
    return { text: "En Route", isApproaching: false, isAtStop: false };
  };

  const arrivals = data?.arrivals ?? [];

  return (
    <div className="card-elevated h-full flex flex-col overflow-hidden">
      {/* Header - Compact */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-blue)] flex items-center justify-center flex-shrink-0">
          <BusIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-[var(--color-text)] leading-tight">Bee-Line Bus</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">Westchester County Transit</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {data && !loading && (
            data.isLive ? (
              <div className="live-indicator">
                <div className="live-dot" />
                <span>Live</span>
              </div>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200">
                Offline
              </span>
            )
          )}
        </div>
      </div>

      {/* Error State */}
      {data?.error && arrivals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-[var(--color-accent-red)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div className="text-sm font-semibold text-[var(--color-text)]">Bus Data Unavailable</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{data.error}</div>
        </div>
      ) : (
        <>
          {/* Table Header - Compact */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="col-span-2">Route</div>
            <div className="col-span-5">Destination</div>
            <div className="col-span-2 text-center">In</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          {/* Arrivals List - Compact rows, max 6 */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <div className="loading-spinner" />
                  <span className="text-xs">Loading...</span>
                </div>
              </div>
            ) : arrivals.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-xs text-[var(--color-text-muted)]">
                {data?.note || "No buses at this time"}
              </div>
            ) : (
              arrivals.slice(0, 6).map((arrival, index) => {
                const isImminent = arrival.minutesAway <= 3;
                const isFeatured = index === 0;
                const statusInfo = getStatusDisplay(arrival);

                return (
                  <div
                    key={`${arrival.vehicleId}-${arrival.routeId}-${index}`}
                    className={`grid grid-cols-12 gap-2 items-center px-4 py-2.5 border-b border-[var(--color-border)] last:border-b-0 ${
                      isFeatured ? "bg-[var(--color-accent-blue)]/[0.03]" : ""
                    }`}
                  >
                    {/* Route */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[var(--color-accent-blue)] text-white text-xs font-bold min-w-[40px]">
                        {arrival.routeName}
                      </span>
                    </div>

                    {/* Destination */}
                    <div className="col-span-5">
                      <div className="text-sm font-semibold text-[var(--color-text)] truncate">
                        {arrival.destination}
                      </div>
                      {arrival.stopName && (
                        <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {arrival.stopName}
                        </div>
                      )}
                    </div>

                    {/* Minutes */}
                    <div className="col-span-2 text-center">
                      <span className={`font-mono text-lg font-bold ${
                        isImminent ? "text-[var(--color-accent-orange)]" : "text-[var(--color-text)]"
                      }`}>
                        {arrival.minutesAway}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] ml-0.5">min</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-3 flex justify-end">
                      {statusInfo.isApproaching ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                          Arriving
                        </span>
                      ) : statusInfo.isAtStop ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-200">
                          At Stop
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                          En Route
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
