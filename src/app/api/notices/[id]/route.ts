import { NextResponse } from "next/server";
import { updateNotice, deleteNotice } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const success = await deleteNotice(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete notice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
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
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (body.password !== adminPassword) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { password, ...updates } = body;
    const notice = await updateNotice(params.id, updates);
    
    if (!notice) {
      return NextResponse.json(
        { error: "Failed to update notice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notice });
  } catch (error) {
    console.error("Error updating notice:", error);
    return NextResponse.json(
      { error: "Failed to update notice" },
      { status: 500 }
    );
  }
}

