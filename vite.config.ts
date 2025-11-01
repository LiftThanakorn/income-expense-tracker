import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FIX: Expose the Gemini API key to the client-side code.
  // The Gemini SDK requires the API key to be available via `process.env.API_KEY`.
  // Vite's `define` config performs a static replacement at build time,
  // making the key available as expected and resolving the runtime error.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});