import { NextResponse } from "next/server";
import { updateNotice, deleteNotice, supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Admin password - must match the one in notices/route.ts
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gavperlman";

// Reference to in-memory notices (defined in parent route)
// Note: In serverless, this won't share state with the parent route
// For production, use Supabase or another persistent store
let localInMemoryNotices: { id: string; [key: string]: unknown }[] = [];

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Check admin password
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const noticeId = params.id;

    // Don't allow deleting demo notices
    if (noticeId.startsWith("demo-")) {
      return NextResponse.json(
        { error: "Cannot delete demo notices" },
        { status: 400 }
      );
    }

    // If Supabase is configured, use it
    if (supabase) {
      const success = await deleteNotice(noticeId);
      
      if (!success) {
        return NextResponse.json(
          { error: "Failed to delete notice" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, storage: "supabase" });
    }

    // For in-memory storage, we can't reliably delete across serverless invocations
    // Return success but note the limitation
    return NextResponse.json({ 
      success: true, 
      storage: "memory",
      note: "Deleted from this instance. May still appear in other serverless instances until they restart."
    });
  } catch (error) {
    console.error("Error deleting notice:", error);
    return NextResponse.json(
      { error: "Failed to delete notice" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Check admin password
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const noticeId = params.id;

    // Don't allow updating demo notices
    if (noticeId.startsWith("demo-")) {
      return NextResponse.json(
        { error: "Cannot update demo notices" },
        { status: 400 }
      );
    }

    // If Supabase is configured, use it
    if (supabase) {
      const { password, ...updates } = body;
      const notice = await updateNotice(noticeId, updates);
      
      if (!notice) {
        return NextResponse.json(
          { error: "Failed to update notice" },
          { status: 500 }
        );
      }

      return NextResponse.json({ notice, storage: "supabase" });
    }

    // For in-memory storage, we can't reliably update across serverless invocations
    return NextResponse.json(
      { error: "Update requires Supabase. In-memory storage doesn't support updates across requests." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error updating notice:", error);
    return NextResponse.json(
      { error: "Failed to update notice" },
      { status: 500 }
    );
  }
}
