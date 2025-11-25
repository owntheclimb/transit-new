"use client";

import { useState, useEffect } from "react";
import type { Notice } from "@/lib/supabase";

export default function NoticesPanel() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
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
      <div className="clean-panel h-full flex items-center justify-center">
        <p className="text-white/30 text-sm">No notices</p>
      </div>
    );
  }

  const notice = notices[currentIndex];

  return (
    <div className="clean-panel h-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Notice</span>
        {notices.length > 1 && (
          <div className="flex gap-1">
            {notices.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === currentIndex ? "w-4 bg-white/50" : "w-1 bg-white/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className={`flex-1 px-4 py-3 ${getPriorityClass(notice.priority)}`}>
        <h4 className="text-sm font-semibold text-white mb-1">{notice.title}</h4>
        <p className="text-xs text-white/60 leading-relaxed">{notice.content}</p>
      </div>
    </div>
  );
}
