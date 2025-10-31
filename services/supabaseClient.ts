import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jgkiblfvsqippwmwmqtc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna2libGZ2c3FpcHB3bXdtcXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTA2ODIsImV4cCI6MjA3NzQ2NjY4Mn0.LCsdGENQLsckLS5u1mie4lEIPe-9I9oZf_VjHZM5Vo8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
