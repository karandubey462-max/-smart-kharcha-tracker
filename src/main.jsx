import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import './index.css';
import './App.css';

// Apply persisted theme before first render
const stored = JSON.parse(localStorage.getItem('kharcha-store') || '{}');
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
