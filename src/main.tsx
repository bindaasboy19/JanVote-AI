import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error catcher for production debugging
window.onerror = function(msg, url, line, col, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h1 style="font-size: 20px;">Frontend Crash Detected</h1>
        <pre style="background: #fff5f5; padding: 10px; border-radius: 8px; overflow: auto;">${msg}\n${error?.stack || ''}</pre>
        <p style="color: #666; font-size: 12px;">This usually happens due to missing environment variables (Firebase/Gemini) during build.</p>
      </div>
    `;
  }
  return false;
};

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (e: any) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red;"><h1>Mount Error</h1><pre>${e.message}</pre></div>`;
  }
}
