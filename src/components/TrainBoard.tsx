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
    const interval = setInterval(fetchDepartures, 60000); // Refresh every 60 seconds
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

  const getStatusColor = (status: TrainDeparture["status"]) => {
    switch (status) {
      case "on-time":
        return "text-transit-ontime";
      case "delayed":
        return "text-transit-delayed";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-transit-muted";
    }
  };

  const getStatusText = (departure: TrainDeparture) => {
    switch (departure.status) {
      case "on-time":
        return "On Time";
      case "delayed":
        return `+${departure.delayMinutes} min`;
      case "cancelled":
        return "Cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="panel p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-transit-accent/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-transit-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-transit-text">
              Metro-North Trains
            </h2>
            <p className="text-sm text-transit-muted">Mount Vernon West</p>
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
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-transit-muted">
              Loading departures...
            </div>
          </div>
        ) : departures.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-transit-muted">No upcoming departures</div>
          </div>
        ) : (
          <div className="space-y-1">
            {departures.slice(0, 6).map((departure, index) => {
              const minutes = getMinutesUntil(departure.departureTime);
              const isImminent = minutes <= 5;

              return (
                <div
                  key={departure.id}
                  className={`train-row grid grid-cols-12 gap-4 px-4 py-4 rounded-lg items-center ${
                    index === 0 ? "bg-transit-accent/10 glow-accent" : ""
                  } ${departure.status === "cancelled" ? "opacity-50" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Train Number */}
                  <div className="col-span-1">
                    <span className="font-mono text-lg font-bold text-transit-accent">
                      {departure.trainNumber}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="col-span-4">
                    <div className="text-lg font-medium text-transit-text truncate">
                      {departure.destination}
                    </div>
                    <div className="text-xs text-transit-muted">
                      {departure.line}
                    </div>
                  </div>

                  {/* Departure Time */}
                  <div className="col-span-2 text-center">
                    <span className="font-mono text-xl text-transit-text">
                      {formatTime(departure.departureTime)}
                    </span>
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
                      {minutes}
                    </span>
                    <span className="text-sm text-transit-muted ml-1">min</span>
                  </div>

                  {/* Track */}
                  <div className="col-span-1 text-center">
                    <span className="font-mono text-xl font-bold text-transit-accent">
                      {departure.track || "—"}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-right">
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        departure.status
                      )}`}
                    >
                      {getStatusText(departure)}
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

