import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import './index.css';
import './App.css';

// Apply persisted theme before first render
let stored = {};
try {
  stored = JSON.parse(localStorage.getItem('kharcha-store') || '{}');
} catch (err) {
  console.error('Failed to read saved app state', err);
  localStorage.removeItem('kharcha-store');
}
const theme = stored?.state?.theme || 'dark';
document.documentElement.setAttribute('data-theme', theme);

function Root() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// Register service worker for PWA installation
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('✅ Service Worker registered successfully!', reg.scope))
      .catch((err) => console.error('❌ Service Worker registration failed:', err));
  });
}
