import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Admin password - set via environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gavperlman";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.password === ADMIN_PASSWORD) {
      return NextResponse.json({ valid: true });
    }
    
    return NextResponse.json(
      { valid: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

