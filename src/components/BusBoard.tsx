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

  useEffect(() => {
    fetchArrivals();
    const interval = setInterval(fetchArrivals, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="elegant-panel h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="section-title text-xl text-stone-200">
          Bee-Line Bus
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Westchester County Transit
        </p>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-6 py-2 text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-white/5">
        <div className="col-span-2">Route</div>
        <div className="col-span-6">Destination</div>
        <div className="col-span-4 text-right">Time</div>
      </div>

      {/* Arrivals List */}
      <div className="flex-1 overflow-hidden">
        {loading && arrivals.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-stone-500 text-sm">
            Loading...
          </div>
        ) : arrivals.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-stone-500 text-sm">
            No upcoming buses
          </div>
        ) : (
          arrivals.slice(0, 5).map((arrival, index) => {
            const isImminent = arrival.minutesAway <= 3;

            return (
              <div
                key={`${arrival.vehicleId}-${index}`}
                className={`departure-row grid grid-cols-12 gap-3 items-center animate-fade-in ${
                  index === 0 ? "featured" : ""
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
                <div className="col-span-6">
                  <div className="text-sm text-stone-300 truncate">
                    {arrival.destination}
                  </div>
                </div>

                {/* Minutes */}
                <div className="col-span-4 text-right">
                  <span className={`minutes-display ${
                    isImminent ? "minutes-imminent" : "text-stone-300"
                  }`}>
                    {arrival.minutesAway}
                  </span>
                  <span className="text-xs text-stone-500 ml-1">min</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
