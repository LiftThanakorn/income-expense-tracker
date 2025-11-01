import { createClient } from '@supabase/supabase-js';

// The Supabase URL and Key are now retrieved from environment variables.
// This is a more secure and standard practice.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase configuration error: SUPABASE_URL environment variable is missing or invalid.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase configuration error: SUPABASE_KEY (anon public) environment variable is missing.");
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
