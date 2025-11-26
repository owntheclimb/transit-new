import { NextResponse } from "next/server";
import { getBeeLineRealtime } from "@/lib/bustime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use the real-time Bee-Line GTFS-RT feed
    const result = await getBeeLineRealtime();
    
    return NextResponse.json({
      arrivals: result.arrivals,
      error: result.error,
      isLive: result.isLive,
      note: result.note,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching bus arrivals:", error);
    return NextResponse.json({
      arrivals: [],
      error: "System error. Contact Alex at owntheclimb.com",
      isLive: false,
      timestamp: new Date().toISOString(),
    });
  }
}
