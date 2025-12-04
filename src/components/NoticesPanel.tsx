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
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case "medium":
        return (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getPriorityStyles = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high": 
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-500",
          title: "text-red-700"
        };
      case "medium": 
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: "text-amber-500",
          title: "text-amber-700"
        };
      default: 
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "text-blue-500",
          title: "text-blue-700"
        };
    }
  };

  if (notices.length === 0) {
    return null;
  }

  return (
    <div className="card-elevated h-full flex flex-col">
      {/* Header - matching train/bus style */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Building Notices</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">22 Southwest Street</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
          {notices.length} {notices.length === 1 ? 'NOTICE' : 'NOTICES'}
        </span>
      </div>

      {/* Notices List */}
      <div className="flex-1 overflow-auto">
        {notices.slice(0, 5).map((notice) => {
          const styles = getPriorityStyles(notice.priority);
          return (
            <div 
              key={notice.id}
              className={`flex items-start gap-4 px-5 py-4 border-b border-[var(--color-border)] last:border-b-0 ${styles.bg}`}
            >
              <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
                {getPriorityIcon(notice.priority)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-base ${styles.title}`}>
                  {notice.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                  {notice.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
