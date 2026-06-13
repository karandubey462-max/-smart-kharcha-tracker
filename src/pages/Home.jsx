import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../store/useStore';
import AnimatedAmount from '../components/AnimatedAmount';
import { formatCurrency, formatDate, getTxnColor, getTxnSign, getBudgetStatus } from '../utils/helpers';
import { CATEGORIES, getCategoryById, getMonthTransactions, getTodayTransactions, calculateSpending, getDailySpending } from '../data/demoData';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export default function Home() {
  const navigate = useNavigate();
  const { user, transactions, lendBorrow, budget, reminders } = useStore();

  const monthTxns  = getMonthTransactions(transactions);
  const todayTxns  = getTodayTransactions(transactions);
  const monthSpend = calculateSpending(monthTxns);
  const todaySpend = calculateSpending(todayTxns);
  const monthIncome = monthTxns.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);

  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const ydStr = yesterday.toISOString().split('T')[0];
  const yestSpend = calculateSpending(transactions.filter(t => t.date === ydStr));

  const totalLent     = lendBorrow.filter(l => l.type === 'lent'     && l.status !== 'paid').reduce((s,l) => s + l.balanceRemaining, 0);
  const totalBorrowed = lendBorrow.filter(l => l.type === 'borrowed' && l.status !== 'paid').reduce((s,l) => s + l.balanceRemaining, 0);
  const unreadCount   = reminders.filter(r => !r.isRead).length;

  const budgetStatus = getBudgetStatus(monthSpend, budget.totalBudget);
  const remaining    = Math.max(budget.totalBudget - monthSpend, 0);

  // Category spending for pie
  const catSpend = {};
  monthTxns.filter(t => t.type === 'expense').forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(catSpend).map(([catId, value]) => {
    const cat = getCategoryById(catId);
    return { name: cat?.name || 'Other', value, color: cat?.color || '#9CA3AF' };
  }).sort((a,b) => b.value - a.value).slice(0, 5);

  // Daily spending for line chart
  const dailyData = getDailySpending(transactions, 7);

  const recentTxns = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* ── Header ── */}
      <div style={{
        padding: 'max(calc(env(safe-area-inset-top) + 12px), 24px) 20px 20px',
        background: 'linear-gradient(180deg, rgba(108,99,255,0.08) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{getGreeting()},</p>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{user?.name?.split(' ')[0] || 'Karan'} 👋</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-icon" onClick={() => navigate('/reminders')} style={{ background: 'var(--bg-secondary)', position: 'relative' }}>
              🔔
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-expense)' }} />
              )}
            </button>
            <button className="btn btn-icon" onClick={() => navigate('/settings')} style={{ background: 'var(--bg-secondary)' }}>⚙️</button>
          </div>
        </div>

        {/* ── Hero Balance Card ── */}
        <div className="hero-card" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4, position: 'relative', zIndex: 1 }}>
            THIS MONTH'S SPENDING
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, position: 'relative', zIndex: 1 }}>
            <AnimatedAmount
              value={monthSpend}
              style={{ fontSize: 38, fontWeight: 800, color: 'white' }}
            />
          </div>
          {budget.totalBudget > 0 ? (
            <>
              <div style={{ marginTop: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Budget used</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>{budgetStatus.pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999 }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${Math.min(budgetStatus.pct, 100)}%`,
                    background: budgetStatus.pct >= 80 ? 'linear-gradient(90deg, #F87171, #FC8181)' : 'linear-gradient(90deg, #6C63FF, #A78BFA)',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, position: 'relative', zIndex: 1 }}>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Remaining</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: budgetStatus.pct >= 80 ? '#FCA5A5' : '#A3E4B5' }}>{formatCurrency(remaining)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Income</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#6EE7B7' }}>{formatCurrency(monthIncome)}</p>
                </div>
              </div>
            </>
          ) : (
            <button onClick={() => navigate('/budget')} style={{
              marginTop: 16, width: '100%', background: 'rgba(255,255,255,0.12)',
              border: '1px dashed rgba(255,255,255,0.3)', borderRadius: 12,
              padding: '10px 16px', color: 'rgba(255,255,255,0.8)', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              🎯 Tap to set your monthly budget
            </button>
          )}
        </div>

        {/* ── Quick Import Buttons ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => navigate('/sms-import')}>
            📱 SMS Auto-Import
          </button>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1, border: '1px solid var(--border-default)' }} onClick={() => navigate('/import')}>
            📄 Upload CSV
          </button>
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 16px' }}>
        {[
          { label: 'Today',     value: todaySpend, icon: '📅', bg: 'var(--color-expense-dim)',  color: 'var(--color-expense)'  },
          { label: 'Yesterday', value: yestSpend,  icon: '📆', bg: 'rgba(148,163,184,0.12)',   color: 'var(--text-secondary)' },
          { label: 'Lent Out',  value: totalLent,     icon: '↗️', bg: 'var(--color-lent-dim)',  color: 'var(--color-lent)',    onClick: () => navigate('/lend-borrow') },
          { label: 'I Owe',     value: totalBorrowed, icon: '↙️', bg: 'var(--color-borrow-dim)',color: 'var(--color-borrow)',  onClick: () => navigate('/lend-borrow') },
        ].map((s, i) => (
          <div key={i} className="stat-card" onClick={s.onClick} style={{ cursor: s.onClick ? 'pointer' : 'default' }}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <span>{s.icon}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(s.value, true)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Pie Chart */}
          <div className="card" style={{ padding: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>CATEGORIES</p>
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={50}
                  dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-elevated)', border: 'none', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {pieData.slice(0, 3).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart */}
          <div className="card" style={{ padding: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>7-DAY TREND</p>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={dailyData}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-elevated)', border: 'none', borderRadius: 10, fontSize: 11 }} />
                <Line type="monotone" dataKey="amount" stroke="var(--accent-primary)" strokeWidth={2.5}
                  dot={{ fill: 'var(--accent-primary)', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Upcoming Dues ── */}
      {lendBorrow.filter(l => l.status !== 'paid' && l.dueDate).length > 0 && (
        <div style={{ padding: '8px 16px' }}>
          <div className="card" style={{ padding: 14, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-lent)' }}>⏰ UPCOMING DUES</span>
              <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/lend-borrow')}>See all</button>
            </div>
            {lendBorrow.filter(l => l.status !== 'paid').slice(0, 2).map(lb => (
              <div key={lb.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{lb.personName}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lb.type === 'lent' ? 'You lent' : 'You owe'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: lb.type === 'lent' ? 'var(--color-lent)' : 'var(--color-borrow)' }}>
                    {formatCurrency(lb.balanceRemaining)}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lb.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Transactions ── */}
      <div style={{ padding: '8px 0' }}>
        <div className="section-label">
          <span>Recent Transactions</span>
          <button onClick={() => navigate('/transactions')}>See All</button>
        </div>
        <div className="card" style={{ margin: '0 16px' }}>
          {recentTxns.map((t) => {
            const cat = getCategoryById(t.category);
            return (
              <div key={t.id} className="txn-item" onClick={() => navigate(`/transactions/${t.id}`)}>
                <div className="txn-icon" style={{ background: cat?.color ? `${cat.color}22` : 'var(--bg-tertiary)' }}>
                  {cat?.icon || '📦'}
                </div>
                <div className="txn-info">
                  <div className="txn-title">{t.description}</div>
                  <div className="txn-meta">
                    <span className="txn-time">{formatDate(t.date)} · {t.time}</span>
                    <span className={`txn-source-badge txn-source-${t.source}`}>{t.source}</span>
                  </div>
                </div>
                <div className="txn-amount" style={{ color: getTxnColor(t.type) }}>
                  {getTxnSign(t.type)}{formatCurrency(t.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: 0.5 }}>QUICK ACTIONS</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { icon: '📊', label: 'Budget',    path: '/budget'     },
            { icon: '🤝', label: 'Lend',      path: '/lend-borrow' },
            { icon: '📱', label: 'SMS Sync',  path: '/sms-import'  },
            { icon: '🎯', label: 'Goals',     path: '/savings'    },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '12px 8px', borderRadius: 12,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
              cursor: 'pointer', transition: 'all 0.15s', color: 'var(--text-primary)',
            }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
