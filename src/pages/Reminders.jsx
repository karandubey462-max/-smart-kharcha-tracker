import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function Reminders() {
  const navigate = useNavigate();
  const { reminders, markReminderRead, dismissReminder } = useStore();

  const sorted = [...reminders].sort((a, b) => (a.isRead ? 1 : -1));
  const unread = reminders.filter(r => !r.isRead).length;

  const typeIcon = {
    lend: '↗️', borrow: '↙️', budget: '📊', recurring: '🔄', custom: '📌'
  };
  const typeBg = {
    lend: 'rgba(251,191,36,0.08)', borrow: 'rgba(96,165,250,0.08)',
    budget: 'rgba(108,99,255,0.08)', recurring: 'rgba(16,185,129,0.08)', custom: 'rgba(156,163,175,0.08)'
  };
  const typeBorder = {
    lend: 'rgba(251,191,36,0.2)', borrow: 'rgba(96,165,250,0.2)',
    budget: 'rgba(108,99,255,0.2)', recurring: 'rgba(16,185,129,0.2)', custom: 'rgba(156,163,175,0.2)'
  };

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Reminders</h2>
        {unread > 0 && (
          <span style={{ background: 'var(--color-expense)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{unread}</span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>All clear!</h3>
          <p>No pending reminders. Great job staying on top of things.</p>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(rem => (
            <div key={rem.id} style={{
              background: rem.isRead ? 'var(--bg-secondary)' : typeBg[rem.type] || 'var(--bg-secondary)',
              border: `1px solid ${rem.isRead ? 'var(--border-subtle)' : typeBorder[rem.type] || 'var(--border-default)'}`,
              borderRadius: 14, padding: 14, opacity: rem.isRead ? 0.7 : 1,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{typeIcon[rem.type] || '🔔'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{rem.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rem.message}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(rem.dueDate)}</p>
                </div>
                {!rem.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {!rem.isRead && (
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => markReminderRead(rem.id)}>
                    Mark as Read
                  </button>
                )}
                {rem.type === 'lend' && (
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { markReminderRead(rem.id); navigate('/lend-borrow'); }}>
                    Send Reminder
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => dismissReminder(rem.id)}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
