import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme, logout, showToast, user } = useStore();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Profile & Security', sub: user?.name || 'Karan Sharma', action: () => navigate('/profile'), bg: '#6C63FF22', color: '#6C63FF' },
        { icon: '🏦', label: 'Accounts & Wallets', sub: 'Manage bank, UPI, cash accounts', action: () => showToast('Coming soon'), bg: '#3B82F622', color: '#3B82F6' },
        { icon: '📂', label: 'Categories', sub: 'Add or edit expense categories', action: () => showToast('Coming soon'), bg: '#A855F722', color: '#A855F7' },
      ]
    },
    {
      title: 'Data',
      items: [
        { icon: '📱', label: 'SMS Auto-Import', sub: 'Read PhonePe SMS automatically', action: () => navigate('/sms-import'), bg: '#6C63FF22', color: '#6C63FF' },
        { icon: '📥', label: 'Import Statement', sub: 'PhonePe CSV / bank statement', action: () => navigate('/import'), bg: '#10B98122', color: '#10B981' },
        { icon: '📤', label: 'Export Report', sub: 'Download PDF or CSV', action: () => showToast('Generating report...'), bg: '#F59E0B22', color: '#F59E0B' },
        { icon: '🔄', label: 'Backup & Restore', sub: 'Cloud backup coming soon', action: () => showToast('Coming soon'), bg: '#14B8A622', color: '#14B8A6' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: theme === 'dark' ? '☀️' : '🌙', label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', sub: `Currently: ${theme} mode`, action: toggleTheme, bg: '#FBBF2422', color: '#FBBF24' },
        { icon: '🌐', label: 'Language', sub: 'English / हिंदी', action: () => showToast('Hindi support coming soon'), bg: '#EC489922', color: '#EC4899' },
        { icon: '🔔', label: 'Notifications', sub: 'Manage reminders & alerts', action: () => navigate('/reminders'), bg: '#6C63FF22', color: '#6C63FF' },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: '🔐', label: 'Change PIN', sub: 'Update your 4-digit PIN', action: () => showToast('Coming soon'), bg: '#EF444422', color: '#EF4444' },
        { icon: '🫆', label: 'Biometric Lock', sub: 'Face ID / Fingerprint', action: () => showToast('Coming soon'), bg: '#10B98122', color: '#10B981' },
      ]
    },
    {
      title: 'More',
      items: [
        { icon: '❓', label: 'Help & Support', sub: 'FAQs and contact', action: () => showToast('Coming soon'), bg: '#94A3B822', color: '#94A3B8' },
        { icon: 'ℹ️', label: 'About Smart Kharcha', sub: 'Version 1.0.0 — Built for India', action: () => showToast('Smart Kharcha Tracker v1.0'), bg: '#6C63FF22', color: '#6C63FF' },
        { icon: '🚪', label: 'Sign Out', sub: 'Log out of your account', action: () => { logout(); navigate('/login'); }, bg: '#EF444422', color: '#EF4444', danger: true },
      ]
    },
  ];

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Settings</h2>
      </div>

      {/* Profile card */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(167,139,250,0.08))',
          border: '1px solid var(--border-accent)',
          borderRadius: 16, padding: 16,
          display: 'flex', alignItems: 'center', gap: 14,
          cursor: 'pointer',
        }} onClick={() => navigate('/profile')}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), #A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'white',
          }}>{user?.name?.[0] || 'K'}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{user?.name || 'Karan Sharma'}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email || 'karan@example.com'}</p>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</span>
        </div>
      </div>

      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.8, padding: '8px 20px 4px', textTransform: 'uppercase' }}>
            {section.title}
          </p>
          <div className="card" style={{ margin: '0 16px' }}>
            {section.items.map((item, ii) => (
              <div key={ii} className="settings-row" onClick={item.action}>
                <div className="settings-icon" style={{ background: item.bg }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                </div>
                <div className="settings-text">
                  <p className="settings-title" style={{ color: item.danger ? 'var(--color-expense)' : undefined }}>{item.label}</p>
                  <p className="settings-subtitle">{item.sub}</p>
                </div>
                <span className="settings-chevron">›</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Smart Kharcha Tracker v1.0</p>
        <p style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 4 }}>Made with ❤️ for India</p>
      </div>
    </div>
  );
}
