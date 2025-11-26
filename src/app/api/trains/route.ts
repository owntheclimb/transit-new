import { NextResponse } from "next/server";
import { getTrainDepartures } from "@/lib/trains";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getTrainDepartures();
    
    return NextResponse.json({
      departures: result.departures,
      error: result.error,
      isLive: result.isLive,
      timestamp: new Date().toISOString(),
      station: "Mount Vernon West",
    });
  } catch (error) {
    console.error("Error fetching train departures:", error);
    return NextResponse.json({
      departures: [],
      error: "System error. Please contact Alex at owntheclimb.com",
      isLive: false,
      timestamp: new Date().toISOString(),
    });
  }
}
