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

  // Cycle through notices every 6 seconds if there are multiple
  useEffect(() => {
    if (notices.length <= 1) return;
    
    const cycleInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 6000);

    return () => clearInterval(cycleInterval);
  }, [notices.length]);

  if (notices.length === 0) {
    return null;
  }

  const currentNotice = notices[currentIndex];

  return (
    <div className="notice-board">
      {/* Header with notice icon */}
      <div className="notice-board-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
        </svg>
        <span>Notices</span>
        {notices.length > 1 && (
          <span className="notice-board-counter">
            {currentIndex + 1} / {notices.length}
          </span>
        )}
      </div>

      {/* Notice content - large and filling */}
      <div className="notice-board-content">
        <div className="notice-board-text">
          <span className="notice-board-title">{currentNotice.title}</span>
          {currentNotice.content && (
            <>
              <span className="notice-board-separator">—</span>
              <span className="notice-board-body">{currentNotice.content}</span>
            </>
          )}
        </div>
      </div>

      {/* Dot indicators for multiple notices */}
      {notices.length > 1 && (
        <div className="notice-board-dots">
          {notices.map((_, i) => (
            <button
              key={i}
              className={`notice-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to notice ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
