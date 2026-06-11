import { useState, useEffect } from 'react';

// Animated rupee splash screen shown for ~1.2s on first load
export default function SplashScreen({ onDone }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 900);
    const t2 = setTimeout(() => onDone(), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.4s ease',
      opacity: fade ? 0 : 1,
      pointerEvents: 'none',
    }}>
      {/* Logo ring */}
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, color: 'white', fontWeight: 900,
        boxShadow: '0 0 60px rgba(108,99,255,0.5)',
        animation: 'numberPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        marginBottom: 20,
      }}>₹</div>

      {/* App name */}
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s 0.2s ease both' }}>
        <h1 style={{
          fontSize: 22, fontWeight: 900,
          background: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: 4,
        }}>Smart Kharcha</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1.5, fontWeight: 600 }}>
          TRACKER
        </p>
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 40, animation: 'fadeIn 0.4s 0.4s ease both' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent-primary)',
            animation: `pulse 1s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
