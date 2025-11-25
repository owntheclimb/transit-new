// MTA Bus Time API Client
// NOTE: Mount Vernon is in Westchester County and uses Bee-Line buses
// The MTA Bus Time API only covers NYC buses
// To get real bus data, you need:
// 1. A valid MTA Bus Time API key (different from Metro-North key)
// 2. OR use Westchester Bee-Line data if available

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

// Check if we're in the NYC bus service area
function isInNYCServiceArea(lat: number, lon: number): boolean {
  // Approximate NYC bus service area
  // Mount Vernon is in Westchester County, outside this area
  return lat >= 40.5 && lat <= 40.92 && lon >= -74.26 && lon <= -73.7;
}

// Find bus stops near a location
export async function getNearbyStops(
  lat: number,
  lon: number,
  radius: number = 0.005
): Promise<BusStop[]> {
  // Mount Vernon uses Bee-Line buses (Westchester County), not MTA NYC buses
  if (!isInNYCServiceArea(lat, lon)) {
    console.log("Location is outside NYC bus service area (likely Westchester)");
    return [];
  }

  try {
    const url = `${BASE_URL}/api/where/stops-for-location.json?lat=${lat}&lon=${lon}&latSpan=${radius}&lonSpan=${radius}&key=${API_KEY}`;
    
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.data?.list) {
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
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check for API key errors
    const error = data.Siri?.ServiceDelivery?.VehicleMonitoringDelivery?.[0]?.ErrorCondition;
    if (error) {
      console.error("Bus API error:", error.Description);
      return [];
    }
    
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
  
  const promises = stopIds.slice(0, 5).map(async (stopId) => {
    const arrivals = await getStopArrivals(stopId);
    results.set(stopId, arrivals);
  });

  await Promise.all(promises);
  return results;
}
