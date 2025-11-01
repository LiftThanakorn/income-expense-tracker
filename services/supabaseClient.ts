import { createClient } from '@supabase/supabase-js';

// FIX: The hardcoded credentials are correct, but the validation logic was
// flawed, comparing the key against itself and always throwing an error.
// This faulty check has been removed to allow the application to start correctly.
const supabaseUrl = "https://jgkiblfvsqippwmwmqtc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna2libGZ2c3FpcHB3bXdtcXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTA2ODIsImV4cCI6MjA3NzQ2NjY4Mn0.LCsdGENQLsckLS5u1mie4lEIPe-9I9oZf_VjHZM5Vo8";

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration error: Supabase URL or key is missing.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
