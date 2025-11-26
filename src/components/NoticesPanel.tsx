"use client";

import { useState, useEffect, useCallback } from "react";
import type { Notice } from "@/lib/supabase";

export default function NoticesPanel() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchNotices = useCallback(async () => {
    try {
      const response = await fetch("/api/notices");
      if (response.ok) {
        const data = await response.json();
        const fetchedNotices = data.notices || [];
        setNotices(fetchedNotices);
        // Reset index if it's out of bounds
        if (currentIndex >= fetchedNotices.length) {
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  }, [currentIndex]);

  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchNotices]);

  useEffect(() => {
    if (notices.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [notices.length]);

  const getPriorityClass = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high": return "notice-high";
      case "medium": return "notice-medium";
      default: return "notice-low";
    }
  };

  const getPriorityIcon = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "medium":
        return (
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  if (notices.length === 0) {
    return (
      <div className="glass-panel p-4 h-full flex items-center justify-center">
        <p className="text-slate-500 text-sm">No active notices</p>
      </div>
    );
  }

  // Ensure currentIndex is within bounds
  const safeIndex = Math.min(currentIndex, notices.length - 1);
  const currentNotice = notices[safeIndex];

  // Safety check - if notice is undefined, show fallback
  if (!currentNotice) {
    return (
      <div className="glass-panel p-4 h-full flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading notices...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-300">Building Notices</h3>
        </div>
        {notices.length > 1 && (
          <div className="flex gap-1.5">
            {notices.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === safeIndex
                    ? "bg-teal-400 w-5"
                    : "bg-slate-600 w-1.5"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Current Notice */}
      <div className={`flex-1 rounded-xl p-3 ${getPriorityClass(currentNotice.priority)}`}>
        <div className="flex gap-3 h-full">
          {getPriorityIcon(currentNotice.priority)}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white mb-1">
              {currentNotice.title}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {currentNotice.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
