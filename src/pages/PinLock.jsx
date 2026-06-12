import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import api from '../utils/api';

export default function PinLock() {
  const { verifyPin, isDemo } = useStore();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKey = async (key) => {
    if (key === 'del') { setPin(p => p.slice(0, -1)); setError(false); return; }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) {
      if (isDemo) {
        setTimeout(() => {
          if (next === '1234') { verifyPin(); navigate('/'); }
          else { setError(true); setTimeout(() => { setPin(''); setError(false); }, 700); }
        }, 150);
      } else {
        try {
          await api.post('/auth/verify-pin', { pin: next });
          verifyPin();
          navigate('/');
        } catch (err) {
          setError(true);
          setTimeout(() => { setPin(''); setError(false); }, 700);
        }
      }
    }
  };

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)', maxWidth: 430, margin: '0 auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Enter PIN</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>Demo PIN: 1234</p>

      {/* PIN dots */}
      <div className="pin-dots" style={{ marginBottom: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}
            style={error ? { background: 'var(--color-expense)', borderColor: 'var(--color-expense)' } : {}} />
        ))}
      </div>
      {error && <p style={{ color: 'var(--color-expense)', fontSize: 13, marginBottom: 16 }}>Wrong PIN. Try again.</p>}

      {/* Keypad */}
      <div className="pin-keypad" style={{ width: '100%', maxWidth: 300, marginTop: 24 }}>
        {keys.map((k, i) => k === '' ? (
          <div key={i} />
        ) : (
          <button key={i} className="pin-key" onClick={() => handleKey(k)}>
            {k === 'del' ? '⌫' : k}
          </button>
        ))}
      </div>

      <button style={{ marginTop: 32, background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        Use Biometric Instead
      </button>
    </div>
  );
}
