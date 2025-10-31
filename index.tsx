import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Vercel Environment Variable Bridge ---
// Vercel exposes client-side environment variables via `import.meta.env`
// and requires them to be prefixed with `VITE_`. However, the Gemini library
// expects the key in `process.env.API_KEY`. This code bridges the gap by
// reading the Vercel variable and assigning it to the location the library
// expects, before the app starts.
if (typeof process === 'undefined') {
  // @ts-ignore
  window.process = { env: {} };
}
// @ts-ignore
process.env.API_KEY = (import.meta as any).env.VITE_API_KEY;
// --- End of Bridge ---


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);