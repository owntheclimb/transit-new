// Westchester County Bee-Line Bus - LIVE Real-Time Data
// Uses official Westchester County GTFS-Realtime API

const TRIP_UPDATES_URL = "https://westchester-gmv.itoworld.com/production/tripupdates.json";

// Stop IDs for Mount Vernon West Railroad Station area
const TARGET_STOP_IDS = new Set([
  "884",   // Mount Vernon West Railroad Station
  "966",   // Mount Vernon West Railroad Station (alternate)
  "885",   // Mount Vernon Ave @ N Terrace Ave
  "887",   // Mount Vernon Ave @ S Bond St
  "964",   // Mount Vernon Ave @ N Bond St
  "965",   // Mount Vernon Ave @ N High St
]);

// Route information for display names
const ROUTE_INFO: Record<string, { name: string; destination: string }> = {
  "24064": { name: "7", destination: "Yonkers - New Rochelle" },
  "24080": { name: "26", destination: "The Bronx - Yonkers" },
  "24089": { name: "40", destination: "White Plains" },
  "24090": { name: "41", destination: "White Plains" },
  "24091": { name: "42", destination: "New Rochelle" },
  "24092": { name: "43", destination: "Westchester MC" },
  "24094": { name: "52", destination: "Bronxville" },
  "24095": { name: "53", destination: "Chester Heights" },
  "24096": { name: "54", destination: "Mt Vernon Local" },
  // Fallback patterns for route IDs that might be different
  "7": { name: "7", destination: "Yonkers - New Rochelle" },
  "26": { name: "26", destination: "The Bronx - Yonkers" },
  "40": { name: "40", destination: "White Plains" },
  "41": { name: "41", destination: "White Plains" },
  "42": { name: "42", destination: "New Rochelle" },
  "43": { name: "43", destination: "Westchester MC" },
  "52": { name: "52", destination: "Bronxville" },
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

// Fetch real-time bus arrivals from Westchester GTFS-RT feed
export async function getBeeLineRealtime(): Promise<BusApiResponse> {
  try {
    const response = await fetch(TRIP_UPDATES_URL, {
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      },
    });

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
        // Match by exact ID or by numeric portion
        const stopIdNumeric = stopId.replace(/\D/g, '');
        const isTargetStop = TARGET_STOP_IDS.has(stopId) || 
                            TARGET_STOP_IDS.has(stopIdNumeric) ||
                            stopId.includes("884") || 
                            stopId.includes("966");

        if (!isTargetStop) continue;

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
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      arrivals: [],
      error: `Connection failed: ${errMsg}. Contact Alex at owntheclimb.com`,
      isLive: false,
    };
  }
}

// Legacy exports for compatibility
export async function getNearbyStops(lat: number, lon: number, radius: number): Promise<BusStop[]> {
  return [
    { id: "884", name: "Mount Vernon West Railroad Station", lat: 40.913531, lon: -73.850129 },
    { id: "966", name: "Mount Vernon West Railroad Station", lat: 40.913733, lon: -73.85 },
  ];
}

export async function getStopArrivals(stopId: string): Promise<BusArrival[]> {
  return [];
}

// For backward compatibility
export function getBeeLineScheduleEstimates(): BusApiResponse {
  // This is now just a wrapper - actual implementation uses realtime
  return {
    arrivals: [],
    isLive: false,
    note: "Use getBeeLineRealtime() for live data",
  };
}
