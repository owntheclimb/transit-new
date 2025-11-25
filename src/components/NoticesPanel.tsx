"use client";

import { useState, useEffect } from "react";
import type { Notice } from "@/lib/supabase";

interface NoticesPanelProps {
  initialNotices?: Notice[];
}

export default function NoticesPanel({ initialNotices = [] }: NoticesPanelProps) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/notices");
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Rotate through notices
  useEffect(() => {
    if (notices.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [notices.length]);

  const getPriorityColor = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-transit-delayed bg-transit-delayed/5";
      case "medium":
        return "border-l-transit-warning bg-transit-warning/5";
      default:
        return "border-l-transit-accent bg-transit-accent/5";
    }
  };

  const getPriorityIcon = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <svg className="w-5 h-5 text-transit-delayed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "medium":
        return (
          <svg className="w-5 h-5 text-transit-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-transit-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
    }
  };

  if (notices.length === 0) {
    return (
      <div className="panel p-4 h-full flex items-center justify-center">
        <p className="text-transit-muted text-sm">No active notices</p>
      </div>
    );
  }

  const currentNotice = notices[currentIndex];

  return (
    <div className="panel p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-transit-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h3 className="text-lg font-semibold text-transit-text">
            Building Notices
          </h3>
        </div>
        {notices.length > 1 && (
          <div className="flex gap-1">
            {notices.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex
                    ? "bg-transit-accent"
                    : "bg-transit-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Current Notice */}
      <div
        className={`flex-1 rounded-lg border-l-4 p-4 transition-all duration-500 ${getPriorityColor(
          currentNotice.priority
        )}`}
      >
        <div className="flex items-start gap-3">
          {getPriorityIcon(currentNotice.priority)}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-transit-text mb-2">
              {currentNotice.title}
            </h4>
            <p className="text-transit-muted leading-relaxed">
              {currentNotice.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

