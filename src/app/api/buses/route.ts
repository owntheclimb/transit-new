import { NextResponse } from "next/server";
import { getBeeLineScheduleEstimates } from "@/lib/bustime";

export const dynamic = "force-dynamic";

const LOCATION_LAT = parseFloat(process.env.LOCATION_LAT || "40.9126");
const LOCATION_LON = parseFloat(process.env.LOCATION_LON || "-73.8371");

export async function GET() {
  try {
    // Bee-Line buses (Westchester County) do not have a real-time API
    // We provide schedule-based estimates for routes serving Mount Vernon
    const result = getBeeLineScheduleEstimates();
    
    return NextResponse.json({
      arrivals: result.arrivals,
      error: result.error,
      isLive: result.isLive,
      note: result.note,
      timestamp: new Date().toISOString(),
      location: { lat: LOCATION_LAT, lon: LOCATION_LON },
    });
  } catch (error) {
    console.error("Error fetching bus arrivals:", error);
    return NextResponse.json({
      arrivals: [],
      error: "System error. Please contact Alex at owntheclimb.com",
      isLive: false,
      timestamp: new Date().toISOString(),
    });
  }
}
