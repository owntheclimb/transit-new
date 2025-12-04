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

  // Cycle through notices every 8 seconds if there are multiple
  useEffect(() => {
    if (notices.length <= 1) return;
    
    const cycleInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 8000);

    return () => clearInterval(cycleInterval);
  }, [notices.length]);

  if (notices.length === 0) {
    return null;
  }

  const currentNotice = notices[currentIndex];

  return (
    <div className="announcement-box">
      {/* Just the content - large and filling the box */}
      <div className="announcement-content" key={currentIndex}>
        <span className="announcement-title">{currentNotice.title}</span>
        {currentNotice.content && (
          <>
            <span className="announcement-dash">—</span>
            <span className="announcement-body">{currentNotice.content}</span>
          </>
        )}
      </div>

      {/* Small dot indicators only if multiple notices */}
      {notices.length > 1 && (
        <div className="announcement-dots">
          {notices.map((_, i) => (
            <span
              key={i}
              className={`announcement-dot ${i === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
