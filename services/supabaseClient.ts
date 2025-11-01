// FIX: Replaced the triple-slash directive with a manual global type definition for ImportMeta.
// This resolves TypeScript errors related to `import.meta.env` in environments where the `vite/client`
// type definitions cannot be automatically resolved.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_KEY: string;
    };
  }
}

import { createClient } from '@supabase/supabase-js';

// FIX: The original content of this file was placeholder text and not valid code.
// This has been replaced with the standard Supabase client initialization.
// It reads the Supabase URL and anonymous key from Vite's environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration error: VITE_SUPABASE_URL or VITE_SUPABASE_KEY environment variables are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);