"use client";

import { useState, useEffect } from "react";
import type { Notice } from "@/lib/supabase";

export default function NoticesPanel() {
  const [notices, setNotices] = useState<Notice[]>([]);
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
    const interval = setInterval(fetchNotices, 300000);
    return () => clearInterval(interval);
  }, []);

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

  if (notices.length === 0) {
    return (
      <div className="elegant-panel h-full flex items-center justify-center">
        <p className="text-stone-600 text-sm">No active notices</p>
      </div>
    );
  }

  const currentNotice = notices[currentIndex];

  return (
    <div className="elegant-panel h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs text-stone-500 uppercase tracking-wider">
          Building Notice
        </span>
        {notices.length > 1 && (
          <div className="flex gap-1">
            {notices.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-all ${
                  i === currentIndex ? "bg-stone-400 w-3" : "bg-stone-700"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notice Content */}
      <div className={`flex-1 px-5 py-4 ${getPriorityClass(currentNotice.priority)}`}>
        <h4 className="text-sm font-medium text-stone-200 mb-1">
          {currentNotice.title}
        </h4>
        <p className="text-xs text-stone-400 leading-relaxed">
          {currentNotice.content}
        </p>
      </div>
    </div>
  );
}
