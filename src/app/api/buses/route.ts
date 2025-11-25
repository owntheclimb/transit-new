import { NextResponse } from "next/server";
import { getNearbyStops, getStopArrivals, type BusArrival } from "@/lib/bustime";

export const dynamic = "force-dynamic";

const LOCATION_LAT = parseFloat(process.env.LOCATION_LAT || "40.9126");
const LOCATION_LON = parseFloat(process.env.LOCATION_LON || "-73.8371");

interface CombinedArrival extends BusArrival {
  stopName: string;
  stopId: string;
}

export async function GET() {
  try {
    // Get nearby stops
    const stops = await getNearbyStops(LOCATION_LAT, LOCATION_LON, 0.005);
    
    if (stops.length === 0) {
      // Return demo data if no stops found or API not configured
      return NextResponse.json({
        arrivals: getDemoArrivals(),
        timestamp: new Date().toISOString(),
        location: { lat: LOCATION_LAT, lon: LOCATION_LON },
      });
    }

    // Get arrivals for top 3 stops
    const topStops = stops.slice(0, 3);
    const allArrivals: CombinedArrival[] = [];

    for (const stop of topStops) {
      const arrivals = await getStopArrivals(stop.id);
      arrivals.forEach((arrival) => {
        allArrivals.push({
          ...arrival,
          stopName: stop.name,
          stopId: stop.id,
        });
      });
    }

    // Sort by minutes away and take top 10
    allArrivals.sort((a, b) => a.minutesAway - b.minutesAway);
    const topArrivals = allArrivals.slice(0, 10);

    return NextResponse.json({
      arrivals: topArrivals,
      stops: topStops,
      timestamp: new Date().toISOString(),
      location: { lat: LOCATION_LAT, lon: LOCATION_LON },
    });
  } catch (error) {
    console.error("Error fetching bus arrivals:", error);
    return NextResponse.json({
      arrivals: getDemoArrivals(),
      timestamp: new Date().toISOString(),
      error: "Using demo data",
    });
  }
}

function getDemoArrivals(): CombinedArrival[] {
  const now = new Date();
  
  return [
    {
      routeId: "BxM4C",
      routeName: "BxM4C",
      destination: "Midtown via Madison Av",
      expectedArrival: new Date(now.getTime() + 3 * 60000).toISOString(),
      minutesAway: 3,
      vehicleId: "demo-1",
      stops: 1,
      status: "approaching",
      stopName: "Southwest St & 4th Av",
      stopId: "demo-stop-1",
    },
    {
      routeId: "Bx31",
      routeName: "Bx31",
      destination: "Westchester Sq",
      expectedArrival: new Date(now.getTime() + 8 * 60000).toISOString(),
      minutesAway: 8,
      vehicleId: "demo-2",
      stops: 4,
      status: "en-route",
      stopName: "Southwest St & 4th Av",
      stopId: "demo-stop-1",
    },
    {
      routeId: "60",
      routeName: "60",
      destination: "White Plains",
      expectedArrival: new Date(now.getTime() + 12 * 60000).toISOString(),
      minutesAway: 12,
      vehicleId: "demo-3",
      stops: 6,
      status: "en-route",
      stopName: "4th Ave & Southwest St",
      stopId: "demo-stop-2",
    },
    {
      routeId: "BxM4C",
      routeName: "BxM4C",
      destination: "Midtown via Madison Av",
      expectedArrival: new Date(now.getTime() + 18 * 60000).toISOString(),
      minutesAway: 18,
      vehicleId: "demo-4",
      stops: 9,
      status: "en-route",
      stopName: "Southwest St & 4th Av",
      stopId: "demo-stop-1",
    },
    {
      routeId: "Bx31",
      routeName: "Bx31",
      destination: "Riverdale",
      expectedArrival: new Date(now.getTime() + 24 * 60000).toISOString(),
      minutesAway: 24,
      vehicleId: "demo-5",
      stops: 12,
      status: "en-route",
      stopName: "Southwest St & 4th Av",
      stopId: "demo-stop-1",
    },
  ];
}

