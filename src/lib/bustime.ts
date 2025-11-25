// MTA Bus Time API Client
// Documentation: https://bustime.mta.info/wiki/Developers/Index

const API_KEY = process.env.MTA_BUS_API_KEY || "";
const BASE_URL = "https://bustime.mta.info";

export interface BusStop {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
  direction: string;
  routes: string[];
}

export interface BusArrival {
  routeId: string;
  routeName: string;
  destination: string;
  expectedArrival: string;
  minutesAway: number;
  vehicleId: string;
  stops: number;
  status: "approaching" | "en-route" | "at-stop";
}

export interface NearbyStopsResponse {
  stops: BusStop[];
}

export interface StopMonitoringResponse {
  arrivals: BusArrival[];
}

// Find bus stops near a location
export async function getNearbyStops(
  lat: number,
  lon: number,
  radius: number = 0.005
): Promise<BusStop[]> {
  try {
    const url = `${BASE_URL}/api/where/stops-for-location.json?lat=${lat}&lon=${lon}&latSpan=${radius}&lonSpan=${radius}&key=${API_KEY}`;
    
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data?.list) {
      return [];
    }

    return data.data.list.map((stop: any) => ({
      id: stop.id,
      code: stop.code,
      name: stop.name,
      lat: stop.lat,
      lon: stop.lon,
      direction: stop.direction || "",
      routes: stop.routes?.map((r: any) => r.shortName || r.id) || [],
    }));
  } catch (error) {
    console.error("Error fetching nearby stops:", error);
    return [];
  }
}

// Get real-time arrivals for a stop
export async function getStopArrivals(stopId: string): Promise<BusArrival[]> {
  try {
    const url = `${BASE_URL}/api/siri/stop-monitoring.json?key=${API_KEY}&MonitoringRef=${stopId}&MaximumStopVisits=10`;
    
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    const visits =
      data.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit || [];

    return visits.map((visit: any) => {
      const journey = visit.MonitoredVehicleJourney;
      const call = journey.MonitoredCall;
      
      const expectedTime = call?.ExpectedArrivalTime || call?.ExpectedDepartureTime;
      const now = new Date();
      const arrival = expectedTime ? new Date(expectedTime) : now;
      const minutesAway = Math.max(0, Math.round((arrival.getTime() - now.getTime()) / 60000));

      let status: "approaching" | "en-route" | "at-stop" = "en-route";
      if (minutesAway <= 1) {
        status = "approaching";
      }
      if (call?.ArrivalProximityText === "at stop") {
        status = "at-stop";
      }

      return {
        routeId: journey.LineRef,
        routeName: journey.PublishedLineName || journey.LineRef,
        destination: journey.DestinationName || "Unknown",
        expectedArrival: arrival.toISOString(),
        minutesAway,
        vehicleId: journey.VehicleRef || "",
        stops: call?.NumberOfStopsAway || 0,
        status,
      };
    });
  } catch (error) {
    console.error("Error fetching stop arrivals:", error);
    return [];
  }
}

// Get arrivals for multiple stops at once
export async function getMultipleStopArrivals(
  stopIds: string[]
): Promise<Map<string, BusArrival[]>> {
  const results = new Map<string, BusArrival[]>();
  
  // Fetch in parallel, but limit concurrency
  const promises = stopIds.slice(0, 5).map(async (stopId) => {
    const arrivals = await getStopArrivals(stopId);
    results.set(stopId, arrivals);
  });

  await Promise.all(promises);
  return results;
}

