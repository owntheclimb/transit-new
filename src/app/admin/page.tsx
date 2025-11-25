"use client";

import { useState, useEffect } from "react";
import type { Notice } from "@/lib/supabase";

export default function AdminPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Notice["priority"]>("low");

  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/notices");
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices || []);
      }
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotices();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 4) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Password must be at least 4 characters");
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          title,
          content,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create notice");
      }

      // Reset form
      setTitle("");
      setContent("");
      setPriority("low");
      setSuccess("Notice created successfully!");
      
      // Refresh notices
      fetchNotices();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (p: Notice["priority"]) => {
    const colors = {
      high: "bg-red-500/10 text-red-400 border-red-500/20",
      medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      low: "bg-stone-500/10 text-stone-400 border-stone-500/20",
    };
    return colors[p];
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="elegant-panel p-8">
            <div className="text-center mb-8">
              <h1 className="section-title text-2xl text-stone-200 mb-2">
                Admin Login
              </h1>
              <p className="text-sm text-stone-500">
                22 Southwest Street
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-stone-800 rounded text-stone-200 focus:outline-none focus:border-stone-600 transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-stone-200 text-stone-900 font-medium rounded hover:bg-stone-300 transition-colors"
              >
                Login
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-stone-500 hover:text-stone-300 text-sm transition-colors">
                ← Back to Display
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title text-3xl text-stone-200">
              Admin Panel
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Manage building notices
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/"
              target="_blank"
              className="px-4 py-2 border border-stone-800 rounded text-stone-400 hover:text-stone-200 hover:border-stone-600 transition-colors text-sm"
            >
              View Display
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 border border-stone-800 rounded text-stone-500 hover:text-stone-300 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Notice Form */}
          <div className="elegant-panel p-6">
            <h2 className="text-lg font-medium text-stone-200 mb-6">
              Create New Notice
            </h2>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-stone-800 rounded text-stone-200 focus:outline-none focus:border-stone-600 transition-colors"
                  placeholder="Notice title"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-stone-800 rounded text-stone-200 focus:outline-none focus:border-stone-600 transition-colors resize-none"
                  placeholder="Notice content"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Notice["priority"])}
                  className="w-full px-4 py-3 bg-black/30 border border-stone-800 rounded text-stone-200 focus:outline-none focus:border-stone-600 transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded p-3">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-200 text-stone-900 font-medium rounded hover:bg-stone-300 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Notice"}
              </button>
            </form>
          </div>

          {/* Existing Notices */}
          <div className="elegant-panel p-6">
            <h2 className="text-lg font-medium text-stone-200 mb-6">
              Active Notices ({notices.length})
            </h2>

            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {notices.length === 0 ? (
                <div className="text-center text-stone-500 py-8">
                  No notices yet
                </div>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-black/20 border border-stone-800 rounded p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-stone-200 truncate">
                            {notice.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityBadge(notice.priority)}`}>
                            {notice.priority}
                          </span>
                        </div>
                        <p className="text-sm text-stone-400 line-clamp-2">
                          {notice.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="elegant-panel p-6 mt-6">
          <h2 className="text-lg font-medium text-stone-200 mb-4">
            Setup Instructions
          </h2>
          <div className="text-sm text-stone-400 space-y-4">
            <p>
              Currently running with demo notices. To enable persistent notices with a database:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-stone-500">
              <li>Create a free account at <a href="https://supabase.com" target="_blank" className="text-stone-300 hover:underline">supabase.com</a></li>
              <li>Create a new project</li>
              <li>Run this SQL in the SQL Editor:</li>
            </ol>
            <pre className="bg-black/40 p-4 rounded text-xs overflow-x-auto text-stone-400">
{`CREATE TABLE notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'low',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);`}
            </pre>
            <p className="text-stone-500">
              Then add your Supabase URL and anon key to the Vercel environment variables.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
