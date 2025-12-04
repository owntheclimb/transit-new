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

  // Form state for create/edit
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Notice["priority"]>("low");
  
  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
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

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPriority("low");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        // Update existing notice
        const response = await fetch(`/api/notices/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, title, content, priority }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update");

        setSuccess("Notice updated!");
      } else {
        // Create new notice
        const response = await fetch("/api/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, title, content, priority }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create");

        setSuccess("Notice created!");
      }

      resetForm();
      fetchNotices();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setPriority(notice.priority);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    resetForm();
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

  const handleToggleActive = async (notice: Notice) => {
    try {
      const response = await fetch(`/api/notices/${notice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, active: !notice.active }),
      });

      if (response.ok) {
        fetchNotices();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to toggle");
      }
    } catch (err) {
      setError("Failed to toggle notice");
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white border border-[#e0e0e0] rounded-2xl p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-[#1e3a5a] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">22</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#343a40] text-center mb-2">Admin Login</h1>
          <p className="text-sm text-[#6c757d] text-center mb-6">22 Southwest Street Transit Display</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e0e0e0] rounded-lg text-[#343a40] placeholder-[#adb5bd] focus:outline-none focus:border-[#1e3a5a] focus:ring-2 focus:ring-[#1e3a5a]/20 transition-all"
              placeholder="Password"
              required
              disabled={authLoading}
            />
            {error && (
              <p className="text-[#dc3545] text-sm bg-[#dc3545]/10 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button 
              disabled={authLoading}
              className="w-full py-3 bg-[#1e3a5a] text-white font-semibold rounded-lg hover:bg-[#2d4a6a] disabled:opacity-50 transition-colors"
            >
              {authLoading ? "Verifying..." : "Login"}
            </button>
          </form>
          <a href="/" className="block text-center text-[#6c757d] text-sm mt-6 hover:text-[#1e3a5a] transition-colors">
            ← Back to Display
          </a>
        </div>
      </main>
    );
  }

  // Admin Dashboard
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto p-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white border border-[#e0e0e0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#1e3a5a] flex items-center justify-center">
              <span className="text-lg font-bold text-white">22</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#343a40]">Admin Panel</h1>
              <p className="text-sm text-[#6c757d]">Manage Building Notices</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a 
              href="/" 
              target="_blank" 
              className="px-4 py-2 border border-[#e0e0e0] rounded-lg text-[#6c757d] hover:text-[#343a40] hover:border-[#1e3a5a] text-sm font-medium transition-colors"
            >
              View Display
            </a>
            <button 
              onClick={() => setIsAuthenticated(false)} 
              className="px-4 py-2 border border-[#e0e0e0] rounded-lg text-[#6c757d] hover:text-[#dc3545] hover:border-[#dc3545] text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[#dc3545]/10 border border-[#dc3545]/20 rounded-lg text-[#dc3545] text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-[#28a745]/10 border border-[#28a745]/20 rounded-lg text-[#28a745] text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Create/Edit Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-lg font-semibold text-[#343a40] mb-4 flex items-center gap-2">
                {editingId ? (
                  <>
                    <svg className="w-5 h-5 text-[#007bff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Notice
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-[#28a745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Notice
                  </>
                )}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6c757d] mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e0e0e0] rounded-lg text-[#343a40] placeholder-[#adb5bd] focus:outline-none focus:border-[#1e3a5a] focus:ring-2 focus:ring-[#1e3a5a]/20 transition-all"
                    placeholder="Notice title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6c757d] mb-1">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e0e0e0] rounded-lg text-[#343a40] placeholder-[#adb5bd] focus:outline-none focus:border-[#1e3a5a] focus:ring-2 focus:ring-[#1e3a5a]/20 transition-all resize-none"
                    placeholder="Notice content"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6c757d] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Notice["priority"])}
                    className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e0e0e0] rounded-lg text-[#343a40] focus:outline-none focus:border-[#1e3a5a] focus:ring-2 focus:ring-[#1e3a5a]/20 transition-all"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 py-3 border border-[#e0e0e0] text-[#6c757d] font-semibold rounded-lg hover:bg-[#f8f9fa] transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    disabled={loading} 
                    className={`${editingId ? 'flex-1' : 'w-full'} py-3 bg-[#1e3a5a] text-white font-semibold rounded-lg hover:bg-[#2d4a6a] disabled:opacity-50 transition-colors`}
                  >
                    {loading ? "Saving..." : editingId ? "Update Notice" : "Create Notice"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Notices List - Right Side */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#343a40] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Active Notices
                <span className="ml-auto text-sm font-normal text-[#6c757d]">{notices.length} total</span>
              </h2>
              
              <div className="space-y-3">
                {notices.length === 0 ? (
                  <div className="text-center py-12 text-[#6c757d]">
                    <svg className="w-12 h-12 mx-auto mb-3 text-[#e0e0e0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="font-medium">No notices yet</p>
                    <p className="text-sm">Create your first notice to get started</p>
                  </div>
                ) : (
                  notices.map((notice) => (
                    <div 
                      key={notice.id} 
                      className={`p-4 border rounded-lg transition-all ${
                        editingId === notice.id 
                          ? 'border-[#007bff] bg-[#007bff]/5' 
                          : 'border-[#e0e0e0] hover:border-[#1e3a5a]/30'
                      } ${!notice.active ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-[#343a40] truncate">{notice.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              notice.priority === "high" 
                                ? "bg-[#dc3545]/10 text-[#dc3545]" 
                                : notice.priority === "medium" 
                                  ? "bg-[#ffc107]/20 text-[#856404]" 
                                  : "bg-[#28a745]/10 text-[#28a745]"
                            }`}>
                              {notice.priority}
                            </span>
                            {!notice.active && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#6c757d]/10 text-[#6c757d]">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#6c757d] line-clamp-2">{notice.content}</p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleToggleActive(notice)}
                            className={`p-2 rounded-lg transition-colors ${
                              notice.active 
                                ? 'text-[#28a745] hover:bg-[#28a745]/10' 
                                : 'text-[#6c757d] hover:bg-[#6c757d]/10'
                            }`}
                            title={notice.active ? "Deactivate" : "Activate"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {notice.active ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              )}
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleEdit(notice)}
                            className="p-2 text-[#007bff] hover:bg-[#007bff]/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="p-2 text-[#dc3545] hover:bg-[#dc3545]/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
