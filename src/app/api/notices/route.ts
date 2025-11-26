import { NextResponse } from "next/server";
import { getActiveNotices, createNotice, supabase, type Notice } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Admin password - set via environment variable, with secure default
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gavperlman";

// In-memory notices for when Supabase isn't configured
// Note: On Vercel serverless, this may not persist across requests
let inMemoryNotices: Notice[] = [];

export async function GET() {
  try {
    // If Supabase is configured, use it
    if (supabase) {
      const notices = await getActiveNotices();
      return NextResponse.json({
        notices,
        timestamp: new Date().toISOString(),
        storage: "supabase",
      });
    }

    // Otherwise return in-memory notices + demo notices
    const demoNotices: Notice[] = [
      {
        id: "demo-1",
        title: "Welcome",
        content: "Welcome to 22 Southwest Street Transit Display",
        priority: "low",
        active: true,
        created_at: new Date().toISOString(),
        expires_at: null,
      },
      {
        id: "demo-2",
        title: "Building Hours",
        content: "Lobby hours: 6:00 AM - 11:00 PM daily",
        priority: "medium",
        active: true,
        created_at: new Date().toISOString(),
        expires_at: null,
      },
    ];

    const allNotices = [...inMemoryNotices, ...demoNotices];
    
    return NextResponse.json({
      notices: allNotices,
      timestamp: new Date().toISOString(),
      storage: "memory",
    });
  } catch (error) {
    console.error("Error fetching notices:", error);
    return NextResponse.json(
      { error: "Failed to fetch notices", notices: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check admin password
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized - incorrect password" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // If Supabase is configured, use it
    if (supabase) {
      const noticeData: Omit<Notice, "id" | "created_at"> = {
        title: body.title,
        content: body.content,
        priority: body.priority || "low",
        active: true,
        expires_at: body.expires_at || null,
      };

      const notice = await createNotice(noticeData);
      
      if (!notice) {
        return NextResponse.json(
          { error: "Failed to create notice in database" },
          { status: 500 }
        );
      }

      return NextResponse.json({ notice, storage: "supabase" });
    }

    // Otherwise store in memory
    const newNotice: Notice = {
      id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: body.title,
      content: body.content,
      priority: body.priority || "low",
      active: true,
      created_at: new Date().toISOString(),
      expires_at: body.expires_at || null,
    };

    inMemoryNotices.unshift(newNotice);

    return NextResponse.json({ 
      notice: newNotice,
      storage: "memory",
      message: "Notice created (stored in memory - will reset on server restart)"
    });
  } catch (error) {
    console.error("Error creating notice:", error);
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    );
  }
}

