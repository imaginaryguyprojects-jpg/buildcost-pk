import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://wxcgpunqnxbezysulkdp.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_GXaFn5Ooa8X5okJXgKGTKg__gs6mmoh";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
