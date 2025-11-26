"use client";

import { useState, useEffect } from "react";
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

export default function BusBoard() {
  const [data, setData] = useState<BusApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchArrivals = async () => {
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
          error: "Failed to connect. Please contact Alex at owntheclimb.com",
          isLive: false,
        });
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
      setData({
        arrivals: [],
        error: "Connection failed. Please contact Alex at owntheclimb.com",
        isLive: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
    const interval = setInterval(fetchArrivals, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusText = (arrival: CombinedArrival) => {
    if (arrival.status === "at-stop") return "At Stop";
    if (arrival.status === "approaching") return "Arriving";
    if (arrival.stops === 1) return "1 stop";
    if (arrival.stops > 1) return `${arrival.stops} stops`;
    return "";
  };

  return (
    <div className="glass-panel p-5 h-full flex flex-col">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon section-icon-blue">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-8 4h4m-4 4h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Bee-Line Bus</h2>
          <p className="text-sm text-slate-400">Westchester County Transit</p>
        </div>
        <div className="flex items-center gap-2">
          {data && !loading && (
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
              SCHEDULE
            </span>
          )}
          {lastUpdated && (
            <span className="text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {data?.error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 font-semibold text-sm mb-1">Bus Data Unavailable</p>
            <p className="text-slate-400 text-xs">{data.error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Note about schedule-based data */}
          {data?.note && (
            <div className="text-xs text-slate-500 mb-2 px-1 italic">
              {data.note}
            </div>
          )}

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 mb-1 table-header border-b border-white/5">
            <div className="col-span-2">Route</div>
            <div className="col-span-5">To</div>
            <div className="col-span-2 text-center">Time</div>
            <div className="col-span-3 text-right">Info</div>
          </div>

          {/* Arrivals List */}
          <div className="flex-1 overflow-hidden space-y-1">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="flex items-center gap-3 text-slate-400">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm">Loading...</span>
                </div>
              </div>
            ) : data?.arrivals.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-slate-500 text-sm">
                No buses at this time
              </div>
            ) : (
              data?.arrivals.slice(0, 5).map((arrival, index) => {
                const isImminent = arrival.minutesAway <= 3;
                const isFeatured = index === 0;

                return (
                  <div
                    key={`${arrival.vehicleId}-${index}`}
                    className={`departure-row grid grid-cols-12 gap-3 items-center animate-slide-in ${
                      isFeatured ? "featured" : ""
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
                      <div className="text-sm font-semibold text-white truncate">
                        {arrival.destination}
                      </div>
                      {arrival.stopName && (
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {arrival.stopName}
                        </div>
                      )}
                    </div>

                    {/* Minutes */}
                    <div className="col-span-2 text-center">
                      <span className={`minutes-display text-lg font-bold ${
                        isImminent ? "minutes-imminent" : "text-white"
                      }`}>
                        {arrival.minutesAway}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">min</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-3 text-right">
                      <span className={`text-xs font-medium ${
                        arrival.status === "approaching" ? "text-amber-400" :
                        arrival.status === "at-stop" ? "text-teal-400" :
                        "text-slate-500"
                      }`}>
                        {getStatusText(arrival)}
                      </span>
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
