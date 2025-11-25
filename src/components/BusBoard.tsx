"use client";

import { useState, useEffect } from "react";
import type { BusArrival, BusStop } from "@/lib/bustime";

interface BusBoardProps {
  initialStops?: BusStop[];
  initialArrivals?: Map<string, BusArrival[]>;
}

interface CombinedArrival extends BusArrival {
  stopName: string;
  stopId: string;
}

export default function BusBoard({ initialStops = [] }: BusBoardProps) {
  const [arrivals, setArrivals] = useState<CombinedArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchArrivals = async () => {
    try {
      const response = await fetch("/api/buses");
      if (response.ok) {
        const data = await response.json();
        setArrivals(data.arrivals || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
    const interval = setInterval(fetchArrivals, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: BusArrival["status"]) => {
    switch (status) {
      case "approaching":
        return "text-transit-warning";
      case "at-stop":
        return "text-transit-accent";
      default:
        return "text-transit-text";
    }
  };

  const getStatusText = (arrival: BusArrival) => {
    if (arrival.status === "at-stop") return "At Stop";
    if (arrival.status === "approaching") return "Approaching";
    if (arrival.stops === 1) return "1 stop away";
    if (arrival.stops > 1) return `${arrival.stops} stops away`;
    return "";
  };

  return (
    <div className="panel p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h8m-8 4h8m-8 4h4m-4 4h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-transit-text">
              Bee-Line Bus
            </h2>
            <p className="text-sm text-transit-muted">Westchester County</p>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-xs text-transit-muted">
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-transit-border/30 rounded-lg mb-2 text-sm font-medium text-transit-muted uppercase tracking-wider">
        <div className="col-span-2">Route</div>
        <div className="col-span-4">Destination</div>
        <div className="col-span-2 text-center">Minutes</div>
        <div className="col-span-4 text-right">Status</div>
      </div>

      {/* Arrivals List */}
      <div className="flex-1 overflow-hidden">
        {loading && arrivals.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-transit-muted">
              Loading bus arrivals...
            </div>
          </div>
        ) : arrivals.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-transit-muted">No upcoming bus arrivals</div>
          </div>
        ) : (
          <div className="space-y-1">
            {arrivals.slice(0, 8).map((arrival, index) => {
              const isImminent = arrival.minutesAway <= 3;

              return (
                <div
                  key={`${arrival.vehicleId}-${index}`}
                  className={`train-row grid grid-cols-12 gap-4 px-4 py-3 rounded-lg items-center ${
                    index === 0 ? "bg-blue-500/10" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Route */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-500/20 font-mono text-lg font-bold text-blue-400">
                      {arrival.routeName}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="col-span-4">
                    <div className="text-lg font-medium text-transit-text truncate">
                      {arrival.destination}
                    </div>
                    {arrival.stopName && (
                      <div className="text-xs text-transit-muted truncate">
                        at {arrival.stopName}
                      </div>
                    )}
                  </div>

                  {/* Minutes */}
                  <div className="col-span-2 text-center">
                    <span
                      className={`font-mono text-2xl font-bold ${
                        isImminent
                          ? "text-transit-warning animate-pulse"
                          : "text-transit-text"
                      }`}
                    >
                      {arrival.minutesAway}
                    </span>
                    <span className="text-sm text-transit-muted ml-1">min</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-4 text-right">
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        arrival.status
                      )}`}
                    >
                      {getStatusText(arrival)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

