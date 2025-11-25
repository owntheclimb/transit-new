import { NextResponse } from "next/server";
import { getTrainDepartures } from "@/lib/trains";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const departures = await getTrainDepartures();
    
    return NextResponse.json({
      departures,
      timestamp: new Date().toISOString(),
      station: "Mount Vernon West",
    });
  } catch (error) {
    console.error("Error fetching train departures:", error);
    return NextResponse.json(
      { error: "Failed to fetch train departures" },
      { status: 500 }
    );
  }
}

