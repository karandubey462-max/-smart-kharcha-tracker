import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

const NAV_ITEMS = [
  { path: '/',             icon: '🏠', label: 'Home'    },
  { path: '/transactions', icon: '📋', label: 'History' },
  { path: null,            icon: '+',  label: 'Add',  isCenter: true },
  { path: '/lend-borrow',  icon: '🤝', label: 'Lends'  },
  { path: '/reports',      icon: '📊', label: 'Reports' },
];

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reminders } = useStore();
  const unread = reminders.filter(r => !r.isRead).length;

  return (
    <div className="app-shell">
      <main className="page-content">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item, i) => {
          if (item.isCenter) {
            return (
              <button
                key="add"
                className="nav-item"
                onClick={() => navigate('/add-transaction')}
                style={{ flex: 1 }}
              >
                <div style={{
                  width: 50, height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), #A78BFA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, color: 'white', fontWeight: 300,
                  boxShadow: '0 4px 20px rgba(108,99,255,0.5)',
                  marginTop: -20,
                  flexShrink: 0,
                }}>+</div>
              </button>
            );
          }
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon" style={{ position: 'relative' }}>
                {item.icon}
                {item.label === 'Home' && unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    background: 'var(--color-expense)', color: 'white',
                    fontSize: 9, fontWeight: 700,
                    width: 16, height: 16, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unread > 9 ? '9+' : unread}</span>
                )}
              </span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-dot" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
