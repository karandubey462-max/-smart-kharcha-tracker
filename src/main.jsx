import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import { storage } from './utils/storage';
import './index.css';
import './App.css';

function Root() {
  const [splashDone, setSplashDone] = useState(false);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    // Apply persisted theme before first render
    const initTheme = async () => {
      try {
        const storedData = await storage.getItem('kharcha-store');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          const theme = parsed?.state?.theme || 'dark';
          document.documentElement.setAttribute('data-theme', theme);
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } catch (err) {
        console.error('Failed to read saved theme - using dark mode', err);
        document.documentElement.setAttribute('data-theme', 'dark');
      } finally {
        setThemeReady(true);
      }
    };
    initTheme();
  }, []);

  if (!themeReady) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#0A0E1A' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
        </div>
      </div>
    );
  }

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
