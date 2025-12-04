"use client";

import { useState, useEffect, useCallback } from "react";
import type { Notice } from "@/lib/supabase";

export default function NoticesPanel() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const fetchNotices = useCallback(async () => {
    try {
      const response = await fetch("/api/notices");
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 300000);
    return () => clearInterval(interval);
  }, [fetchNotices]);

  const getPriorityIcon = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case "medium":
        return (
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-600";
      case "medium": return "text-amber-600 bg-amber-600";
      default: return "text-blue-600 bg-blue-600";
    }
  };

  if (notices.length === 0) {
    return null;
  }

  return (
    <div className="card-elevated">
      <div className="flex items-center gap-6 px-5 py-3">
        {/* Left: Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-bold text-[var(--color-text)]">Notices</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--color-border)]" />

        {/* Notices - horizontal layout */}
        <div className="flex-1 flex items-center gap-4 overflow-x-auto">
          {notices.slice(0, 4).map((notice) => {
            const colorClass = getPriorityColor(notice.priority);
            return (
              <div 
                key={notice.id}
                className="flex items-center gap-3 flex-shrink-0"
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${colorClass.split(' ')[1]} bg-opacity-10`}>
                  <span className={colorClass.split(' ')[0]}>
                    {getPriorityIcon(notice.priority)}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm text-[var(--color-text)]">
                    {notice.title}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {notice.content.length > 60 ? notice.content.slice(0, 60) + '...' : notice.content}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
