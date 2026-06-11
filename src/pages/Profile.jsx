import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Profile() {
  const navigate = useNavigate();
  const { user, showToast } = useStore();

  const stats = [
    { label: 'Member Since', value: 'June 2026' },
    { label: 'Transactions', value: '30+' },
    { label: 'Goals', value: '4' },
  ];

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Profile & Security</h2>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), #A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, color: 'white',
            boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
          }}>{user?.name?.[0] || 'K'}</div>
          <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Change Photo
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 10, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-primary)' }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="card">
          {[
            { label: 'Full Name', value: user?.name || 'Karan Sharma', icon: '👤' },
            { label: 'Email', value: user?.email || 'karan@example.com', icon: '📧' },
            { label: 'Phone', value: user?.phone || '+91 9876543210', icon: '📱' },
            { label: 'Currency', value: '₹ Indian Rupee (INR)', icon: '💱' },
            { label: 'Language', value: 'English', icon: '🌐' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
              <span style={{ fontSize: 20 }}>{row.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{row.value}</p>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>›</span>
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="card">
          {[
            { icon: '🔐', label: 'Change PIN', sub: '4-digit security PIN' },
            { icon: '🫆', label: 'Biometric', sub: 'Fingerprint / Face ID' },
            { icon: '🔒', label: 'App Lock', sub: 'Lock on background' },
          ].map((item, i) => (
            <div key={i} className="settings-row" onClick={() => showToast('Coming soon')}>
              <div className="settings-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>{item.icon}</div>
              <div className="settings-text">
                <p className="settings-title">{item.label}</p>
                <p className="settings-subtitle">{item.sub}</p>
              </div>
              <span>›</span>
            </div>
          ))}
        </div>

        <button className="btn btn-danger btn-full" onClick={() => showToast('Coming soon')}>
          ⚠️ Delete Account
        </button>
      </div>
    </div>
  );
}
