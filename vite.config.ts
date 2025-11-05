import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configure server to run on port 3000 and be accessible from the network.
    // This is crucial for the Supabase OAuth callback to work correctly.
    host: '0.0.0.0',
    port: 3000,
  },
  // FIX: Expose the Gemini API key to the client-side code.
  // The Gemini SDK requires the API key to be available via `process.env.API_KEY`.
  // Vite's `define` config performs a static replacement at build time,
  // making the key available as expected and resolving the runtime error.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
