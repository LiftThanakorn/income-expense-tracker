
// FIX: Added a triple-slash directive to bring in Vite's client types which include definitions for `import.meta.env`. This resolves the TypeScript error.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// FIX: The original content of this file was placeholder text and not valid code.
// This has been replaced with the standard Supabase client initialization.
// It reads the Supabase URL and anonymous key from Vite's environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anonymous key are required in .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);