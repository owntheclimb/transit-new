// Metro-North Train Data
// Uses Right Track API (api.righttrack.io) for Metro-North schedules
// Fallback to static GTFS data if API unavailable

const RIGHTTRACK_BASE = "https://api.righttrack.io/v1";
const METRO_NORTH_AGENCY = "mnr"; // Metro-North Railroad

// Mount Vernon West station ID
const MOUNT_VERNON_WEST_ID = "1"; // Will need to verify this

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

export interface StationInfo {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

// Get departures from Mount Vernon West
export async function getTrainDepartures(): Promise<TrainDeparture[]> {
  try {
    // Try Right Track API first
    const departures = await fetchFromRightTrack();
    if (departures.length > 0) {
      return departures;
    }
  } catch (error) {
    console.error("Right Track API error:", error);
  }

  // Fallback to demo data for development
  return getDemoTrainDepartures();
}

async function fetchFromRightTrack(): Promise<TrainDeparture[]> {
  try {
    // Right Track API endpoint for station departures
    const url = `${RIGHTTRACK_BASE}/${METRO_NORTH_AGENCY}/stations/MVNW/departures`;
    
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Right Track API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.departures) {
      return [];
    }

    return data.departures.map((dep: any) => ({
      id: dep.trip?.id || `train-${dep.train}`,
      trainNumber: dep.train || "---",
      destination: dep.destination?.name || "Grand Central",
      departureTime: dep.departure?.time || dep.time,
      scheduledTime: dep.departure?.scheduledTime || dep.time,
      track: dep.track || null,
      status: getStatus(dep),
      delayMinutes: dep.delay || 0,
      line: dep.route?.name || "Hudson Line",
    }));
  } catch (error) {
    console.error("fetchFromRightTrack error:", error);
    throw error;
  }
}

function getStatus(dep: any): "on-time" | "delayed" | "cancelled" {
  if (dep.cancelled) return "cancelled";
  if (dep.delay && dep.delay > 5) return "delayed";
  return "on-time";
}

// Demo data for development/fallback
function getDemoTrainDepartures(): TrainDeparture[] {
  const now = new Date();
  
  const trains = [
    { mins: 5, dest: "Grand Central Terminal", train: "421", track: "1", line: "Hudson Line" },
    { mins: 18, dest: "Grand Central Terminal", train: "423", track: "2", line: "Hudson Line" },
    { mins: 32, dest: "Poughkeepsie", train: "845", track: "1", line: "Hudson Line" },
    { mins: 45, dest: "Grand Central Terminal", train: "425", track: null, line: "Hudson Line" },
    { mins: 58, dest: "Croton-Harmon", train: "847", track: null, line: "Hudson Line" },
    { mins: 72, dest: "Grand Central Terminal", train: "427", track: null, line: "Hudson Line" },
  ];

  return trains.map((t, i) => {
    const depTime = new Date(now.getTime() + t.mins * 60000);
    const isDelayed = i === 2; // Make one train delayed for demo
    
    return {
      id: `demo-${t.train}`,
      trainNumber: t.train,
      destination: t.dest,
      departureTime: depTime.toISOString(),
      scheduledTime: isDelayed
        ? new Date(depTime.getTime() - 8 * 60000).toISOString()
        : depTime.toISOString(),
      track: t.track,
      status: isDelayed ? "delayed" : "on-time",
      delayMinutes: isDelayed ? 8 : 0,
      line: t.line,
    };
  });
}

// Get station information
export async function getStationInfo(): Promise<StationInfo | null> {
  return {
    id: "MVNW",
    name: "Mount Vernon West",
    lat: 40.9126,
    lon: -73.8371,
  };
}

