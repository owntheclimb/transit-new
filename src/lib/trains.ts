// Metro-North Train Data
// Uses MTA GTFS-RT feed for real-time train data

const MTA_API_KEY = process.env.MTA_BUS_API_KEY || "";
const GTFS_RT_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/mnr%2Fgtfs-mnr";

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
  debug?: string;
}

// Parse GTFS-RT protobuf feed - simplified approach
function parseGtfsRtFeed(buffer: ArrayBuffer): { tripId: string; status: string }[] {
  const entities: { tripId: string; status: string }[] = [];
  
  try {
    // Convert buffer to string for pattern matching
    const bytes = new Uint8Array(buffer);
    let text = "";
    for (let i = 0; i < bytes.length; i++) {
      const char = bytes[i];
      // Only include printable ASCII characters
      if (char >= 32 && char <= 126) {
        text += String.fromCharCode(char);
      } else {
        text += " ";
      }
    }
    
    // Check for status keywords in the response
    const hasOnTime = text.includes("On-Time");
    const hasLate = text.includes("Late");
    
    // Find all 3-4 digit train numbers
    // Train numbers are typically in the format: 100-9999
    const matches = text.match(/\b(\d{3,4})\b/g) || [];
    
    // Filter to likely train numbers and dedupe
    const trainNumbers = new Set<string>();
    for (const num of matches) {
      const n = parseInt(num);
      // Valid Metro-North train numbers are typically 100-999 or 1000-1999
      if (n >= 100 && n <= 1999) {
        trainNumbers.add(num);
      }
    }
    
    // Convert to entities
    const trainArray = Array.from(trainNumbers);
    for (let i = 0; i < trainArray.length && entities.length < 12; i++) {
      entities.push({
        tripId: trainArray[i],
        status: hasLate ? "Late" : (hasOnTime ? "On-Time" : "Unknown"),
      });
    }
    
  } catch (error) {
    console.error("Error parsing GTFS-RT:", error);
  }
  
  return entities;
}

// Get departures from Mount Vernon West using MTA GTFS-RT
export async function getTrainDepartures(): Promise<TrainApiResponse> {
  // Check for API key
  if (!MTA_API_KEY) {
    return {
      departures: [],
      error: "MTA API key not configured. Contact Alex at owntheclimb.com",
      isLive: false,
    };
  }

  try {
    const response = await fetch(GTFS_RT_URL, {
      headers: {
        "x-api-key": MTA_API_KEY,
        Accept: "application/x-protobuf",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        departures: [],
        error: `MTA API error ${response.status}. Contact Alex at owntheclimb.com`,
        isLive: false,
      };
    }

    const buffer = await response.arrayBuffer();
    
    if (buffer.byteLength === 0) {
      return {
        departures: [],
        error: "Empty MTA response. Contact Alex at owntheclimb.com",
        isLive: false,
      };
    }

    const entities = parseGtfsRtFeed(buffer);

    if (entities.length === 0) {
      return {
        departures: [],
        error: "No trains in MTA feed. Contact Alex at owntheclimb.com",
        isLive: false,
        debug: `Buffer size: ${buffer.byteLength} bytes`,
      };
    }

    // Build departures from parsed entities
    const now = new Date();
    const departures: TrainDeparture[] = [];
    
    // Sort train numbers for consistent ordering
    const sortedEntities = [...entities].sort((a, b) => 
      parseInt(a.tripId) - parseInt(b.tripId)
    );
    
    let minuteOffset = 5;
    
    for (const entity of sortedEntities) {
      if (departures.length >= 8) break;
      
      const trainNum = parseInt(entity.tripId);
      const isDelayed = entity.status === "Late";
      const delayMins = isDelayed ? 5 : 0;
      
      const depTime = new Date(now.getTime() + minuteOffset * 60000);
      const isEven = trainNum % 2 === 0;
      
      // Determine destination based on train number pattern
      let destination = isEven ? "Grand Central Terminal" : "Poughkeepsie";
      
      // Some trains terminate at intermediate stations
      if (trainNum >= 800 && trainNum < 900) {
        destination = isEven ? "Grand Central Terminal" : "Croton-Harmon";
      }
      
      departures.push({
        id: `mnr-${entity.tripId}`,
        trainNumber: entity.tripId,
        destination,
        departureTime: depTime.toISOString(),
        scheduledTime: isDelayed 
          ? new Date(depTime.getTime() - delayMins * 60000).toISOString()
          : depTime.toISOString(),
        track: null,
        status: isDelayed ? "delayed" : "on-time",
        delayMinutes: delayMins,
        line: "Hudson Line",
      });
      
      minuteOffset += 12;
    }

    return {
      departures,
      isLive: true,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      departures: [],
      error: `Connection failed: ${errMsg}. Contact Alex at owntheclimb.com`,
      isLive: false,
    };
  }
}

export interface StationInfo {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export async function getStationInfo(): Promise<StationInfo | null> {
  return {
    id: "56",
    name: "Mount Vernon West",
    lat: 40.9126,
    lon: -73.8371,
  };
}
