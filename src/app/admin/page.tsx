"use client";

import { useState, useEffect } from "react";
import type { Notice } from "@/lib/supabase";

export default function AdminPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Notice["priority"]>("low");
  const [expiresAt, setExpiresAt] = useState("");

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
    // Simple client-side check - real auth happens on API calls
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

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          title,
          content,
          priority,
          expires_at: expiresAt || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create notice");
      }

      // Reset form
      setTitle("");
      setContent("");
      setPriority("low");
      setExpiresAt("");

      // Refresh notices
      fetchNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        fetchNotices();
      }
    } catch (err) {
      console.error("Error deleting notice:", err);
    }
  };

  const getPriorityBadge = (p: Notice["priority"]) => {
    const colors = {
      high: "bg-red-500/20 text-red-400 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[p];
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-transit-dark flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="panel p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-transit-accent to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-transit-accent/20">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-transit-text">
                Admin Login
              </h1>
              <p className="text-transit-muted mt-2">
                22 Southwest Transit Display
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-transit-muted mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-transit-dark border border-transit-border rounded-lg text-transit-text focus:outline-none focus:border-transit-accent transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-transit-accent text-transit-dark font-semibold rounded-lg hover:bg-transit-accent/90 transition-colors"
              >
                Login
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-transit-muted hover:text-transit-accent text-sm transition-colors"
              >
                ← Back to Display
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transit-dark p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-transit-accent to-teal-600 flex items-center justify-center shadow-lg shadow-transit-accent/20">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transit-text">
                Admin Panel
              </h1>
              <p className="text-sm text-transit-muted">
                Manage building notices
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="/"
              target="_blank"
              className="px-4 py-2 bg-transit-panel border border-transit-border rounded-lg text-transit-text hover:bg-transit-border/50 transition-colors"
            >
              View Display →
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-transit-panel border border-transit-border rounded-lg text-transit-muted hover:text-transit-text transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Notice Form */}
          <div className="panel p-6">
            <h2 className="text-xl font-semibold text-transit-text mb-6">
              Create New Notice
            </h2>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-transit-muted mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-transit-dark border border-transit-border rounded-lg text-transit-text focus:outline-none focus:border-transit-accent transition-colors"
                  placeholder="Notice title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-transit-muted mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-transit-dark border border-transit-border rounded-lg text-transit-text focus:outline-none focus:border-transit-accent transition-colors resize-none"
                  placeholder="Notice content"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-transit-muted mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as Notice["priority"])
                    }
                    className="w-full px-4 py-3 bg-transit-dark border border-transit-border rounded-lg text-transit-text focus:outline-none focus:border-transit-accent transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-transit-muted mb-2">
                    Expires At (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 bg-transit-dark border border-transit-border rounded-lg text-transit-text focus:outline-none focus:border-transit-accent transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-transit-accent text-transit-dark font-semibold rounded-lg hover:bg-transit-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Notice"}
              </button>
            </form>
          </div>

          {/* Existing Notices */}
          <div className="panel p-6">
            <h2 className="text-xl font-semibold text-transit-text mb-6">
              Active Notices ({notices.length})
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {notices.length === 0 ? (
                <div className="text-center text-transit-muted py-8">
                  No notices yet. Create one to get started.
                </div>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-transit-dark border border-transit-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-transit-text truncate">
                            {notice.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityBadge(
                              notice.priority
                            )}`}
                          >
                            {notice.priority}
                          </span>
                        </div>
                        <p className="text-sm text-transit-muted line-clamp-2">
                          {notice.content}
                        </p>
                        <p className="text-xs text-transit-muted mt-2">
                          Created:{" "}
                          {new Date(notice.created_at).toLocaleDateString()}
                          {notice.expires_at && (
                            <span className="ml-3">
                              Expires:{" "}
                              {new Date(notice.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-2 text-transit-muted hover:text-red-400 transition-colors"
                        title="Delete notice"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="panel p-6 mt-6">
          <h2 className="text-xl font-semibold text-transit-text mb-4">
            Setup Instructions
          </h2>
          <div className="text-transit-muted space-y-3">
            <p>
              <strong className="text-transit-text">
                To connect to Supabase:
              </strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Create a free account at{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  className="text-transit-accent hover:underline"
                >
                  supabase.com
                </a>
              </li>
              <li>Create a new project</li>
              <li>
                Run this SQL in the SQL Editor to create the notices table:
              </li>
            </ol>
            <pre className="bg-transit-dark p-4 rounded-lg text-sm overflow-x-auto mt-2">
              {`CREATE TABLE notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON notices FOR SELECT USING (true);

-- Allow authenticated insert/update/delete (or use anon key with caution)
CREATE POLICY "Allow all operations" ON notices FOR ALL USING (true);`}
            </pre>
            <p className="mt-4">
              Then update your <code className="text-transit-accent">.env.local</code> file with your Supabase URL and
              anon key from the project settings.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

