// Westchester County Bee-Line Bus - LIVE Real-Time Data
// Uses official Westchester County GTFS-Realtime API

const TRIP_UPDATES_URL = "https://westchester-gmv.itoworld.com/production/tripupdates.json";

// Request timeout in milliseconds
const API_TIMEOUT = 8000;

// Exact stop IDs for Mount Vernon West Railroad Station area
// Using exact matches to avoid false positives
const TARGET_STOP_IDS = new Set([
  // Mount Vernon West Railroad Station stops
  "884",
  "966",
  "ITOAUTO884",
  "ITOAUTO966",
  "ITOAUTO1884",
  "ITOAUTO2884",
  "ITOAUTO1966",
  "ITOAUTO2966",
  // Nearby stops on Mount Vernon Ave
  "885",
  "887",
  "964",
  "965",
  "ITOAUTO885",
  "ITOAUTO887",
  "ITOAUTO964",
  "ITOAUTO965",
  "ITOAUTO1885",
  "ITOAUTO1887",
  "ITOAUTO1964",
  "ITOAUTO1965",
]);

// Check if a stop ID matches our target stops
// Uses exact match first, then pattern match as fallback
function isTargetStop(stopId: string): boolean {
  // Direct match
  if (TARGET_STOP_IDS.has(stopId)) {
    return true;
  }
  
  // Extract numeric portion and check if it's one of our target stop numbers
  const match = stopId.match(/(\d{3})$/);
  if (match) {
    const stopNum = match[1];
    return ["884", "966", "885", "887", "964", "965"].includes(stopNum);
  }
  
  return false;
}

// Route information for display names
const ROUTE_INFO: Record<string, { name: string; destination: string }> = {
  // Main routes serving Mount Vernon West area
  "5": { name: "5", destination: "Yonkers - White Plains" },
  "7": { name: "7", destination: "Yonkers - New Rochelle" },
  "8": { name: "8", destination: "Yonkers - Tuckahoe" },
  "10": { name: "10", destination: "Croton Commuter" },
  "18": { name: "18", destination: "Peekskill Commuter" },
  "20": { name: "20", destination: "The Bronx - White Plains" },
  "21": { name: "21", destination: "The Bronx - White Plains" },
  "26": { name: "26", destination: "The Bronx - Yonkers" },
  "40": { name: "40", destination: "White Plains" },
  "41": { name: "41", destination: "White Plains" },
  "42": { name: "42", destination: "New Rochelle" },
  "43": { name: "43", destination: "Westchester MC" },
  "52": { name: "52", destination: "Bronxville" },
  "53": { name: "53", destination: "Chester Heights" },
  "54": { name: "54", destination: "Mt Vernon Local" },
  "55": { name: "55", destination: "The Bronx - Yonkers" },
  "60": { name: "60", destination: "White Plains - Yonkers" },
  "61": { name: "61", destination: "Getty Square" },
  "232": { name: "BxM4C", destination: "Manhattan Express" },
};

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
        error: `Bee-Line API error ${response.status}. Contact Alex at owntheclimb.com`,
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

      // Check each stop time update
      for (const stopUpdate of tripUpdate.stop_time_update) {
        const stopId = stopUpdate.stop_id;
        
        // Check if this stop is one we're interested in
        if (!isTargetStop(stopId)) continue;

        const arrivalTime = stopUpdate.arrival?.time || stopUpdate.departure?.time;
        if (!arrivalTime) continue;

        // Only include future arrivals (within next 90 minutes)
        const minutesAway = Math.round((arrivalTime - now) / 60);
        if (minutesAway < 0 || minutesAway > 90) continue;

        // Get route info
        const routeInfo = ROUTE_INFO[routeId] || { 
          name: routeId.replace(/^0+/, ''), 
          destination: "Mount Vernon" 
        };

        arrivals.push({
          routeId,
          routeName: routeInfo.name,
          destination: routeInfo.destination,
          expectedArrival: new Date(arrivalTime * 1000).toISOString(),
          minutesAway,
          vehicleId,
          stops: 0, // Not available in basic GTFS-RT
          status: minutesAway <= 2 ? "approaching" : minutesAway <= 5 ? "at-stop" : "en-route",
          stopName: "Mount Vernon West Station",
          stopId,
        });
      }
    }

    // Sort by arrival time and dedupe
    arrivals.sort((a, b) => a.minutesAway - b.minutesAway);
    
    // Remove duplicates (same route arriving at similar times)
    const seen = new Set<string>();
    const uniqueArrivals = arrivals.filter(a => {
      const key = `${a.routeName}-${Math.floor(a.minutesAway / 3)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (uniqueArrivals.length === 0) {
      // No buses at our stops right now - might be off-hours or between runs
      return {
        arrivals: [],
        isLive: true,
        note: "No buses currently approaching Mount Vernon West",
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
        error: "Bee-Line API timeout. Contact Alex at owntheclimb.com",
        isLive: false,
      };
    }
    
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      arrivals: [],
      error: `Connection failed: ${errMsg}. Contact Alex at owntheclimb.com`,
      isLive: false,
    };
  }
}

// Get nearby stops info
export async function getNearbyStops(): Promise<BusStop[]> {
  return [
    { id: "884", name: "Mount Vernon West Railroad Station", lat: 40.913531, lon: -73.850129 },
    { id: "966", name: "Mount Vernon West Railroad Station", lat: 40.913733, lon: -73.85 },
    { id: "885", name: "Mount Vernon Ave @ N Terrace Ave", lat: 40.912336, lon: -73.847979 },
    { id: "887", name: "Mount Vernon Ave @ S Bond St", lat: 40.911194, lon: -73.84558 },
  ];
}
