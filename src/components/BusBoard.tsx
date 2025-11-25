"use client";

import { useState, useEffect } from "react";
import type { BusArrival } from "@/lib/bustime";

interface CombinedArrival extends BusArrival {
  stopName: string;
  stopId: string;
}

export default function BusBoard() {
  const [arrivals, setArrivals] = useState<CombinedArrival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArrivals = async () => {
      try {
        const response = await fetch("/api/buses");
        if (response.ok) {
          const data = await response.json();
          setArrivals(data.arrivals || []);
        }
      } catch (error) {
        console.error("Error fetching buses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArrivals();
    const interval = setInterval(fetchArrivals, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="clean-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/5">
        <h2 className="text-lg font-semibold text-white">Bee-Line Bus</h2>
        <p className="text-xs text-white/40">Westchester County</p>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-5 py-2 border-b border-white/5 table-header">
        <div className="col-span-2">Route</div>
        <div className="col-span-7">Destination</div>
        <div className="col-span-3 text-right">Time</div>
      </div>

      {/* Arrivals */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && arrivals.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-white/40 text-sm">
            Loading...
          </div>
        ) : arrivals.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-white/40 text-sm">
            No upcoming buses
          </div>
        ) : (
          arrivals.slice(0, 5).map((arr, i) => {
            const isUrgent = arr.minutesAway <= 3;
            const isNext = i === 0;

            return (
              <div
                key={`${arr.vehicleId}-${i}`}
                className={`departure-row grid grid-cols-12 gap-3 items-center ${isNext ? "next-departure" : ""}`}
              >
                <div className="col-span-2">
                  <span className="bus-badge">{arr.routeName}</span>
                </div>
                <div className="col-span-7 text-white/90 text-sm truncate">
                  {arr.destination}
                </div>
                <div className="col-span-3 text-right">
                  <span className={`text-lg font-bold tabular-nums ${isUrgent ? "minutes-urgent" : "text-white"}`}>
                    {arr.minutesAway}
                  </span>
                  <span className="text-xs text-white/40 ml-1">min</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
