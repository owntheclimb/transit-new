import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only create client if both URL and key are provided
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export async function getActiveNotices(): Promise<Notice[]> {
  // If Supabase is not configured, return demo notices
  if (!supabase) {
    return [
      {
        id: "demo-1",
        title: "Welcome",
        content: "Welcome to 22 Southwest Transit Display",
        priority: "low",
        active: true,
        created_at: new Date().toISOString(),
        expires_at: null,
      },
      {
        id: "demo-2",
        title: "Building Notice",
        content: "Lobby hours: 6 AM - 11 PM daily",
        priority: "medium",
        active: true,
        created_at: new Date().toISOString(),
        expires_at: null,
      },
    ];
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notices:", error);
    return [];
  }

  return data || [];
}

export async function createNotice(
  notice: Omit<Notice, "id" | "created_at">
): Promise<Notice | null> {
  if (!supabase) {
    console.error("Supabase not configured");
    return null;
  }
  
  const { data, error } = await supabase
    .from("notices")
    .insert([notice])
    .select()
    .single();

  if (error) {
    console.error("Error creating notice:", error);
    return null;
  }

  return data;
}

export async function updateNotice(
  id: string,
  updates: Partial<Notice>
): Promise<Notice | null> {
  if (!supabase) {
    console.error("Supabase not configured");
    return null;
  }
  
  const { data, error } = await supabase
    .from("notices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating notice:", error);
    return null;
  }

  return data;
}

export async function deleteNotice(id: string): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase not configured");
    return false;
  }
  
  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) {
    console.error("Error deleting notice:", error);
    return false;
  }

  return true;
}

