"use client";

import { useState, useEffect } from "react";
import type { Notice } from "@/lib/supabase";

export default function AdminPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    if (isAuthenticated) fetchNotices();
  }, [isAuthenticated]);

  // Verify password against server
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      // Verify password by attempting to create a test request
      // The server will validate the password
      const response = await fetch("/api/notices/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (response.ok && data.valid) {
        setIsAuthenticated(true);
        setError("");
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("Failed to verify password");
    } finally {
      setAuthLoading(false);
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
        body: JSON.stringify({ password, title, content, priority }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");

      setTitle("");
      setContent("");
      setPriority("low");
      setSuccess("Notice created!");
      fetchNotices();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        fetchNotices();
        setSuccess("Notice deleted!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete");
      }
    } catch (err) {
      setError("Failed to delete notice");
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-slate-900/80 border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              placeholder="Password"
              required
              disabled={authLoading}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button 
              disabled={authLoading}
              className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 disabled:opacity-50"
            >
              {authLoading ? "Verifying..." : "Login"}
            </button>
          </form>
          <a href="/" className="block text-center text-white/40 text-sm mt-6 hover:text-white/60">
            ← Back to Display
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <div className="flex gap-3">
            <a href="/" target="_blank" className="px-4 py-2 border border-white/10 rounded-lg text-white/60 hover:text-white text-sm">
              View Display
            </a>
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 border border-white/10 rounded-lg text-white/40 hover:text-white/60 text-sm">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Form */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">New Notice</h2>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                placeholder="Title"
                required
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
                placeholder="Content"
                rows={3}
                required
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Notice["priority"])}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-400 text-sm">{success}</p>}
              <button disabled={loading} className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 disabled:opacity-50">
                {loading ? "Creating..." : "Create Notice"}
              </button>
            </form>
          </div>

          {/* Notices List */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Active Notices ({notices.length})</h2>
            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
              {notices.length === 0 ? (
                <p className="text-white/40 text-center py-8">No notices</p>
              ) : (
                notices.map((n) => (
                  <div key={n.id} className="p-4 bg-black/30 border border-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{n.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          n.priority === "high" ? "bg-red-500/20 text-red-400" :
                          n.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>
                          {n.priority}
                        </span>
                      </div>
                      {!n.id.startsWith("demo-") && (
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="text-red-400/60 hover:text-red-400 text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-white/50">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-3">Setup</h2>
          <p className="text-sm text-white/50 mb-3">
            Notices are stored in memory. For persistent storage, connect Supabase:
          </p>
          <pre className="bg-black/40 p-4 rounded-lg text-xs text-white/40 overflow-x-auto">
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
        </div>
      </div>
    </main>
  );
}
