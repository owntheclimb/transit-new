import { NextResponse } from "next/server";
import { getActiveNotices, createNotice, type Notice } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notices = await getActiveNotices();
    
    return NextResponse.json({
      notices,
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
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (body.password !== adminPassword) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
        { error: "Failed to create notice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notice });
  } catch (error) {
    console.error("Error creating notice:", error);
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    );
  }
}

