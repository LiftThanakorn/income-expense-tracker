import { createClient } from '@supabase/supabase-js';

// Reads the Supabase URL and anonymous key from environment variables.
// Switched from import.meta.env to process.env for better compatibility with Vercel's build process.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration error: VITE_SUPABASE_URL or VITE_SUPABASE_KEY environment variables are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);