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
    // Refresh notices every 5 minutes
    const interval = setInterval(fetchNotices, 300000);
    return () => clearInterval(interval);
  }, [fetchNotices]);

  const getPriorityIcon = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case "medium":
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getPriorityClass = (priority: Notice["priority"]) => {
    switch (priority) {
      case "high": return "notice-card-high";
      case "medium": return "notice-card-medium";
      default: return "notice-card-low";
    }
  };

  if (notices.length === 0) {
    return null;
  }

  const noticeCards = notices.map((notice, i) => (
    <div 
      key={`${notice.id}-${i}`} 
      className={`notice-card ${getPriorityClass(notice.priority)}`}
    >
      {getPriorityIcon(notice.priority)}
      <span className="notice-card-title">{notice.title}</span>
      <span className="notice-card-content">{notice.content}</span>
    </div>
  ));

  return (
    <div className="notice-widget">
      {/* Widget Header */}
      <div className="notice-widget-header">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
        </svg>
        <h3>Building Notices</h3>
        <span className="notice-widget-count">
          {notices.length} {notices.length === 1 ? 'notice' : 'notices'}
        </span>
      </div>
      
      {/* Scrolling Content */}
      <div className="notice-widget-content">
        <div className="notice-ticker-scroll">
          {noticeCards}
          {/* Duplicate for seamless loop */}
          {notices.map((notice, i) => (
            <div 
              key={`${notice.id}-dup-${i}`} 
              className={`notice-card ${getPriorityClass(notice.priority)}`}
            >
              {getPriorityIcon(notice.priority)}
              <span className="notice-card-title">{notice.title}</span>
              <span className="notice-card-content">{notice.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
