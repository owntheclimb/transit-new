// Metro-North Train Data - Mount Vernon West (Harlem Line)
// Uses MTA GTFS-RT feed - NO MOCK DATA EVER

import * as protobuf from "protobufjs";

const MTA_API_KEY = process.env.MTA_API_KEY || "";
const GTFS_RT_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/mnr%2Fgtfs-mnr";

// Request timeout in milliseconds
const API_TIMEOUT = 10000;

// Mount Vernon West is stop_id 62 on the Harlem Line (stop_code: 1MW)
const MOUNT_VERNON_WEST_STOP_ID = "62";

// Harlem Line station mapping for destinations
const HARLEM_LINE_STATIONS: Record<string, string> = {
  "1": "Grand Central",
  "4": "Harlem-125 St",
  "54": "Melrose",
  "55": "Tremont",
  "56": "Fordham",
  "57": "Botanical Garden",
  "58": "Williams Bridge",
  "59": "Woodlawn",
  "61": "Wakefield",
  "62": "Mt Vernon West",
  "64": "Fleetwood",
  "65": "Bronxville",
  "66": "Tuckahoe",
  "68": "Crestwood",
  "71": "Scarsdale",
  "72": "Hartsdale",
  "74": "White Plains",
  "76": "North White Plains",
  "78": "Valhalla",
  "79": "Mt Pleasant",
  "80": "Hawthorne",
  "81": "Pleasantville",
  "83": "Chappaqua",
  "84": "Mt Kisco",
  "85": "Bedford Hills",
  "86": "Katonah",
  "88": "Goldens Bridge",
  "89": "Purdy's",
  "90": "Croton Falls",
  "91": "Brewster",
  "94": "Southeast",
  "97": "Patterson",
  "98": "Pawling",
  "99": "Appalachian Trail",
  "100": "Harlem Valley-Wingdale",
  "101": "Dover Plains",
  "177": "Wassaic",
};

export interface TrainDeparture {
  id: string;
  trainNumber: string;
  destination: string;
  departureTime: string;
  scheduledTime: string;
  track: string | null;
  status: "on-time" | "delayed" | "cancelled";
  delayMinutes: number;
  line: string;
}

export interface TrainApiResponse {
  departures: TrainDeparture[];
  error?: string;
  isLive: boolean;
  dataSource?: string;
}

// GTFS-RT proto definition
const gtfsRealtimeProto = {
  nested: {
    transit_realtime: {
      nested: {
        FeedMessage: {
          fields: {
            header: { type: "FeedHeader", id: 1 },
            entity: { rule: "repeated", type: "FeedEntity", id: 2 }
          }
        },
        FeedHeader: {
          fields: {
            gtfsRealtimeVersion: { type: "string", id: 1 },
            timestamp: { type: "uint64", id: 3 }
          }
        },
        FeedEntity: {
          fields: {
            id: { type: "string", id: 1 },
            tripUpdate: { type: "TripUpdate", id: 3 }
          }
        },
        TripUpdate: {
          fields: {
            trip: { type: "TripDescriptor", id: 1 },
            stopTimeUpdate: { rule: "repeated", type: "StopTimeUpdate", id: 2 },
            timestamp: { type: "uint64", id: 4 }
          }
        },
        TripDescriptor: {
          fields: {
            tripId: { type: "string", id: 1 },
            routeId: { type: "string", id: 5 },
            startTime: { type: "string", id: 2 },
            startDate: { type: "string", id: 3 }
          }
        },
        StopTimeUpdate: {
          fields: {
            stopSequence: { type: "uint32", id: 1 },
            stopId: { type: "string", id: 4 },
            arrival: { type: "StopTimeEvent", id: 2 },
            departure: { type: "StopTimeEvent", id: 3 }
          }
        },
        StopTimeEvent: {
          fields: {
            delay: { type: "int32", id: 1 },
            time: { type: "int64", id: 2 }
          }
        }
      }
    }
  }
};

// Cache the protobuf root
let protoRoot: protobuf.Root | null = null;

async function getProtoRoot(): Promise<protobuf.Root> {
  if (protoRoot) return protoRoot;
  protoRoot = protobuf.Root.fromJSON(gtfsRealtimeProto);
  return protoRoot;
}

interface StopTimeUpdate {
  stopId: string;
  stopSequence: number;
  arrivalTime: number | null;
  departureTime: number | null;
  delay: number;
}

interface TripData {
  tripId: string;
  routeId: string;
  stopTimeUpdates: StopTimeUpdate[];
}

// Parse GTFS-RT protobuf feed
async function parseGtfsRtFeed(buffer: ArrayBuffer): Promise<TripData[]> {
  const trips: TripData[] = [];
  
  try {
    const root = await getProtoRoot();
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    
    const message = FeedMessage.decode(new Uint8Array(buffer));
    const feed = FeedMessage.toObject(message, {
      longs: Number,
      defaults: true,
    });
    
    if (!feed.entity) return trips;
    
    for (const entity of feed.entity) {
      const tripUpdate = entity.tripUpdate;
      if (!tripUpdate) continue;
      
      const tripId = tripUpdate.trip?.tripId || "";
      const routeId = tripUpdate.trip?.routeId || "";
      
      if (!tripUpdate.stopTimeUpdate) continue;
      
      const stopTimeUpdates: StopTimeUpdate[] = [];
      
      for (const stu of tripUpdate.stopTimeUpdate) {
        const stopId = stu.stopId || "";
        const arrival = stu.arrival || {};
        const departure = stu.departure || {};
        
        stopTimeUpdates.push({
          stopId,
          stopSequence: stu.stopSequence || 0,
          arrivalTime: arrival.time || null,
          departureTime: departure.time || null,
          delay: arrival.delay || departure.delay || 0,
        });
      }
      
      trips.push({
        tripId,
        routeId,
        stopTimeUpdates,
      });
    }
  } catch (error) {
    console.error("Error parsing GTFS-RT protobuf:", error);
    throw error; // Don't silently fail - propagate the error
  }
  
  return trips;
}

// Determine destination based on the final stop in the trip
function getTrainDestination(trip: TripData, ourStopSequence: number): string {
  // Find the last stop in the trip (highest stopSequence after our stop)
  const futureStops = trip.stopTimeUpdates
    .filter(stu => stu.stopSequence > ourStopSequence)
    .sort((a, b) => b.stopSequence - a.stopSequence);
  
  if (futureStops.length > 0) {
    const finalStopId = futureStops[0].stopId;
    return HARLEM_LINE_STATIONS[finalStopId] || `Station ${finalStopId}`;
  }
  
  // If no future stops, train might be terminating at our station
  // or heading to Grand Central
  return "Grand Central";
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

// Get departures from Mount Vernon West using MTA GTFS-RT
export async function getTrainDepartures(): Promise<TrainApiResponse> {
  // Check for API key
  if (!MTA_API_KEY) {
    return {
      departures: [],
      error: "MTA API key not configured. Please add MTA_API_KEY to environment variables.",
      isLive: false,
    };
  }

  try {
    const response = await fetchWithTimeout(
      GTFS_RT_URL,
      {
        headers: {
          "x-api-key": MTA_API_KEY,
          Accept: "application/x-protobuf",
        },
        cache: "no-store",
      },
      API_TIMEOUT
    );

    if (!response.ok) {
      return {
        departures: [],
        error: `MTA API returned status ${response.status}. Please check API key.`,
        isLive: false,
      };
    }

    const buffer = await response.arrayBuffer();
    
    if (buffer.byteLength === 0) {
      return {
        departures: [],
        error: "MTA API returned empty response.",
        isLive: false,
      };
    }

    const trips = await parseGtfsRtFeed(buffer);

    if (trips.length === 0) {
      return {
        departures: [],
        error: "No trip data available from MTA feed.",
        isLive: false,
      };
    }

    // Find trips that stop at Mount Vernon West (stop_id 62)
    const now = Math.floor(Date.now() / 1000);
    const departures: TrainDeparture[] = [];

    for (const trip of trips) {
      // Find Mount Vernon West stop in this trip
      const mvwStop = trip.stopTimeUpdates.find(
        stu => stu.stopId === MOUNT_VERNON_WEST_STOP_ID
      );
      
      if (!mvwStop) continue;
      
      const depTimeUnix = mvwStop.departureTime || mvwStop.arrivalTime;
      if (!depTimeUnix) continue;
      
      // Only include future departures (within next 2 hours)
      if (depTimeUnix <= now || depTimeUnix > now + 7200) continue;
      
      const depTime = new Date(depTimeUnix * 1000);
      const delaySeconds = mvwStop.delay || 0;
      const delayMinutes = Math.round(delaySeconds / 60);
      const isDelayed = delayMinutes >= 2;
      
      const scheduledTimeUnix = depTimeUnix - delaySeconds;
      const scheduledTime = new Date(scheduledTimeUnix * 1000);
      
      const destination = getTrainDestination(trip, mvwStop.stopSequence);
      
      departures.push({
        id: `mnr-${trip.tripId}-${depTimeUnix}`,
        trainNumber: trip.tripId,
        destination,
        departureTime: depTime.toISOString(),
        scheduledTime: scheduledTime.toISOString(),
        track: null, // MTA GTFS-RT doesn't provide track info for Metro-North
        status: isDelayed ? "delayed" : "on-time",
        delayMinutes: Math.max(0, delayMinutes),
        line: "Harlem",
      });
    }

    // Sort by departure time
    departures.sort((a, b) => 
      new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    );

    if (departures.length === 0) {
      return {
        departures: [],
        isLive: true,
        dataSource: "MTA GTFS-RT",
        error: "No upcoming trains at Mount Vernon West.",
      };
    }

    return {
      departures: departures.slice(0, 10),
      isLive: true,
      dataSource: "MTA GTFS-RT",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        departures: [],
        error: "MTA API request timed out.",
        isLive: false,
      };
    }
    
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Train API error:", errMsg);
    return {
      departures: [],
      error: `Failed to fetch train data: ${errMsg}`,
      isLive: false,
    };
  }
}

export interface StationInfo {
  id: string;
  name: string;
  lat: number;
  lon: number;
  line: string;
}

export async function getStationInfo(): Promise<StationInfo> {
  return {
    id: "62",
    name: "Mount Vernon West",
    lat: 40.912142,
    lon: -73.851129,
    line: "Harlem Line",
  };
}
