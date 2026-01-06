import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// All Supabase projects to keep alive (comma-separated URLs from env)
const SUPABASE_URLS = (process.env.SUPABASE_KEEPALIVE_URLS || "").split(",").filter(Boolean);

// Fallback to current project's Supabase URL if no list provided
const CURRENT_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function GET() {
  const urlsToCheck = SUPABASE_URLS.length > 0 
    ? SUPABASE_URLS 
    : CURRENT_PROJECT_URL 
      ? [CURRENT_PROJECT_URL] 
      : [];

  if (urlsToCheck.length === 0) {
    return NextResponse.json({ 
      error: "No Supabase URLs configured",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }

  const results = await Promise.all(
    urlsToCheck.map(async (url) => {
      const projectId = url.replace("https://", "").replace(".supabase.co", "");
      try {
        // Simple health check - just hit the root endpoint
        const res = await fetch(`${url}/rest/v1/`, {
          method: "HEAD",
          headers: {
            "Accept": "application/json",
          },
        });
        return { 
          project: projectId, 
          status: res.status,
          alive: res.status < 500
        };
      } catch (error) {
        return { 
          project: projectId, 
          error: error instanceof Error ? error.message : "Unknown error",
          alive: false
        };
      }
    })
  );

  const allAlive = results.every(r => r.alive);

  return NextResponse.json({
    success: allAlive,
    pinged: results.length,
    results,
    timestamp: new Date().toISOString(),
  }, { status: allAlive ? 200 : 207 });
}

