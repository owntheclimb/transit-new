import { NextResponse } from "next/server";
import { getActiveNotices, createNotice, supabase, type Notice } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// In-memory notices for when Supabase isn't configured
let inMemoryNotices: Notice[] = [];

export async function GET() {
  try {
    // If Supabase is configured, use it
    if (supabase) {
      const notices = await getActiveNotices();
      return NextResponse.json({
        notices,
        timestamp: new Date().toISOString(),
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
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (body.password !== adminPassword) {
      return NextResponse.json(
        { error: "Unauthorized - incorrect password" },
        { status: 401 }
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

      return NextResponse.json({ notice });
    }

    // Otherwise store in memory (will persist until server restart)
    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
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
