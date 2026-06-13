import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import api from '../utils/api';

export default function Login() {
  const { isAuthenticated, isPinVerified, user, login, fetchUserData, showToast } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate(user?.pinEnabled && !isPinVerified ? '/pin' : '/', { replace: true });
  }, [isAuthenticated, isPinVerified, navigate, user?.pinEnabled]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let authToken;
      if (tab === 'login') {
        const res = await api.post('/auth/login', {
          email: form.email,
          password: form.password,
        });
        authToken = res.data.token;
        login(res.data.user, res.data.token);
        showToast('Welcome back! 🎉');
      } else {
        const res = await api.post('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        });
        authToken = res.data.token;
        login(res.data.user, res.data.token);
        showToast('Account created successfully! 🚀');
      }
      
      // Fetch user data from server
      await fetchUserData(authToken);
      navigate('/');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => {
      login();
      showToast('Demo mode loaded with sample data ✨');
      navigate('/');
      setLoading(false);
    }, 700);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: 'max(calc(env(safe-area-inset-top) + 16px), 40px) 28px 32px',
        background: 'linear-gradient(180deg, rgba(108,99,255,0.08) 0%, transparent 100%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>₹</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Smart Kharcha</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your personal finance companion</p>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 24px' }}>
        <div className="type-selector" style={{ marginBottom: 24 }}>
          <button className={`type-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Log In</button>
          <button className={`type-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Karan Sharma" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email or Phone</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          {tab === 'login' && (
            <div style={{ textAlign: 'right' }}>
              <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Forgot Password?
              </button>
            </div>
          )}
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}
            style={{ marginTop: 8 }}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <button className="btn btn-secondary btn-full" onClick={handleDemo} disabled={loading}>
          🎮 Try Demo Mode
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 28, lineHeight: 1.7 }}>
          By continuing, you agree to our{' '}
          <span style={{ color: 'var(--accent-primary)' }}>Terms of Service</span> and{' '}
          <span style={{ color: 'var(--accent-primary)' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
