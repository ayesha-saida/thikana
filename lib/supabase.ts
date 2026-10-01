import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

// Anon client — Supabase Auth sessions attach automatically,
// so the same client handles both public reads and RLS-protected writes.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
