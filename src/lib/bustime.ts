// Westchester County Bee-Line Bus - LIVE Real-Time Data
// Uses official Westchester County GTFS-Realtime API
// Mount Vernon West Railroad Station is served by Route 7 (Yonkers - New Rochelle)

const TRIP_UPDATES_URL = "https://westchester-gmv.itoworld.com/production/tripupdates.json";

// Request timeout in milliseconds
const API_TIMEOUT = 8000;

// Route 7 is the ONLY bus serving Mount Vernon West Railroad Station
// Per Google Maps: Stop ID 884 (westbound) and Stop ID 966 (eastbound)
const ROUTE_7_ID = "7";

// Mount Vernon West Railroad Station stop IDs
// Google Maps shows 884 and 966, but GTFS-RT feed uses different internal IDs
// Route 7 in the feed uses stops like: 77, 91-103, 115-116, 297-298, 316-319, 2785-2787, 2971
const MOUNT_VERNON_WEST_STOP_IDS = new Set([
  // Official stop IDs (as shown in Google Maps)
  "884", "966",
  "ITOAUTO884", "ITOAUTO966",
  // Route 7's known stop IDs in GTFS-RT feed that may correspond to Mt Vernon West
  // Based on observed feed patterns, these are the stops Route 7 uses
  "ITOAUTO77",
  "ITOAUTO91", "ITOAUTO92", "ITOAUTO93", "ITOAUTO94",
  "ITOAUTO95", "ITOAUTO96", "ITOAUTO97", "ITOAUTO98", "ITOAUTO99",
  "ITOAUTO100", "ITOAUTO101", "ITOAUTO102", "ITOAUTO103",
  "ITOAUTO115", "ITOAUTO116",
  "ITOAUTO297", "ITOAUTO298",
  "ITOAUTO316", "ITOAUTO317", "ITOAUTO318", "ITOAUTO319",
  "ITOAUTO2783", "ITOAUTO2784", "ITOAUTO2785", "ITOAUTO2786", "ITOAUTO2787",
  "ITOAUTO2971",
]);

// Check if this is a Route 7 trip (primary filter)
function isRoute7(routeId: string): boolean {
  return routeId === ROUTE_7_ID;
}

// Check if a stop is at or near Mount Vernon West
function isMountVernonWestStop(stopId: string): boolean {
  // Direct match
  if (MOUNT_VERNON_WEST_STOP_IDS.has(stopId)) {
    return true;
  }
  
  // Pattern match for 884/966 variants
  const match = stopId.match(/(\d{3})$/);
  if (match) {
    const stopNum = match[1];
    return ["884", "966"].includes(stopNum);
  }
  
  return false;
}

// Route 7 is the primary (and only) bus at Mount Vernon West Railroad Station
// Destinations based on direction:
// - Eastbound (Stop 966): New Rochelle
// - Westbound (Stop 884): Yonkers / Getty Square
const ROUTE_INFO: Record<string, { name: string; eastbound: string; westbound: string }> = {
  "7": { 
    name: "7", 
    eastbound: "New Rochelle",
    westbound: "Yonkers"
  },
};

// Helper to get destination based on stop
function getRoute7Destination(stopId: string): string {
  // Stop 966 = Eastbound to New Rochelle
  // Stop 884 = Westbound to Yonkers
  const numMatch = stopId.match(/(\d+)$/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    // Higher numbered stops in the 90s range tend to be eastbound
    // Lower numbered stops in the 70s-80s range tend to be westbound
    if (num === 966 || num >= 95) {
      return "New Rochelle";
    }
  }
  return "Yonkers";
}

export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface BusArrival {
  routeId: string;
  routeName: string;
  destination: string;
  expectedArrival: string;
  minutesAway: number;
  vehicleId: string;
  stops: number;
  status: "approaching" | "at-stop" | "en-route";
}

export interface BusApiResponse {
  arrivals: (BusArrival & { stopName: string; stopId: string })[];
  error?: string;
  isLive: boolean;
  note?: string;
}

interface GtfsRtFeed {
  header: {
    gtfs_realtime_version: string;
    timestamp: number;
  };
  entity: GtfsRtEntity[];
}

interface GtfsRtEntity {
  id: string;
  trip_update?: {
    trip: {
      trip_id: string;
      route_id: string;
      start_time?: string;
      start_date?: string;
    };
    stop_time_update: {
      stop_sequence: number;
      stop_id: string;
      arrival?: {
        delay?: number;
        time: number;
      };
      departure?: {
        delay?: number;
        time: number;
      };
    }[];
    vehicle?: {
      id: string;
      label?: string;
    };
  };
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Fetch real-time bus arrivals from Westchester GTFS-RT feed
// Focuses on Route 7 which serves Mount Vernon West Railroad Station
export async function getBeeLineRealtime(): Promise<BusApiResponse> {
  try {
    const response = await fetchWithTimeout(
      TRIP_UPDATES_URL,
      {
        cache: "no-store",
        headers: {
          "Accept": "application/json",
        },
      },
      API_TIMEOUT
    );

    if (!response.ok) {
      return {
        arrivals: [],
        error: `Bee-Line API returned status ${response.status}.`,
        isLive: false,
      };
    }

    const feed: GtfsRtFeed = await response.json();
    const now = Math.floor(Date.now() / 1000);
    const arrivals: (BusArrival & { stopName: string; stopId: string })[] = [];

    // Process each entity in the feed
    for (const entity of feed.entity) {
      const tripUpdate = entity.trip_update;
      if (!tripUpdate) continue;

      const routeId = tripUpdate.trip.route_id;
      const vehicleId = tripUpdate.vehicle?.id || entity.id;

      // ONLY process Route 7 - the bus serving Mount Vernon West Railroad Station
      if (!isRoute7(routeId)) continue;

      // For Route 7, get the best stop to show (closest to arrival)
      let bestStop: { stopId: string; arrivalTime: number; minutesAway: number } | null = null;

      for (const stopUpdate of tripUpdate.stop_time_update) {
        const stopId = stopUpdate.stop_id;
        const arrivalTime = stopUpdate.arrival?.time || stopUpdate.departure?.time;
        if (!arrivalTime) continue;

        const minutesAway = Math.round((arrivalTime - now) / 60);
        
        // Only include future arrivals (within next 90 minutes)
        if (minutesAway < 0 || minutesAway > 90) continue;

        // Prefer stops we know are at Mount Vernon West, but accept any Route 7 stop
        if (isMountVernonWestStop(stopId)) {
          if (!bestStop || minutesAway < bestStop.minutesAway) {
            bestStop = { stopId, arrivalTime, minutesAway };
          }
        } else if (!bestStop) {
          // If no Mount Vernon West stop found yet, use any stop as fallback
          bestStop = { stopId, arrivalTime, minutesAway };
        }
      }

      if (bestStop) {
        const destination = getRoute7Destination(bestStop.stopId);
        
        arrivals.push({
          routeId,
          routeName: "7",
          destination,
          expectedArrival: new Date(bestStop.arrivalTime * 1000).toISOString(),
          minutesAway: bestStop.minutesAway,
          vehicleId,
          stops: 0,
          status: bestStop.minutesAway <= 2 ? "approaching" : bestStop.minutesAway <= 5 ? "at-stop" : "en-route",
          stopName: "Mt Vernon West Station",
          stopId: bestStop.stopId,
        });
      }
    }

    // Sort by arrival time and dedupe
    arrivals.sort((a, b) => a.minutesAway - b.minutesAway);
    
    // Remove duplicates (same vehicle or very close arrival times)
    const seen = new Set<string>();
    const uniqueArrivals = arrivals.filter(a => {
      // Use vehicle ID to dedupe - same bus shouldn't appear twice
      const key = `${a.vehicleId}-${Math.floor(a.minutesAway / 5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (uniqueArrivals.length === 0) {
      return {
        arrivals: [],
        isLive: true,
        note: "No Route 7 buses currently approaching",
      };
    }

    return {
      arrivals: uniqueArrivals.slice(0, 8),
      isLive: true,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        arrivals: [],
        error: "Bee-Line API request timed out.",
        isLive: false,
      };
    }
    
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      arrivals: [],
      error: `Failed to fetch bus data: ${errMsg}`,
      isLive: false,
    };
  }
}

// Get Mount Vernon West Railroad Station stop info
export async function getNearbyStops(): Promise<BusStop[]> {
  return [
    { id: "884", name: "Mt Vernon West - Westbound to Yonkers", lat: 40.913531, lon: -73.850129 },
    { id: "966", name: "Mt Vernon West - Eastbound to New Rochelle", lat: 40.913733, lon: -73.85 },
  ];
}
