import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import { CATEGORIES, getCategoryById, getMonthTransactions, getDailySpending } from '../data/demoData';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

const TABS = ['Daily', 'Category', 'Income vs Expense', 'Insights'];

export default function Reports() {
  const navigate = useNavigate();
  const { transactions, budget, lendBorrow, user, showToast } = useStore();
  const [tab, setTab] = useState('Daily');

  const monthTxns   = getMonthTransactions(transactions);
  const monthSpend  = monthTxns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const monthIncome = monthTxns.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const savings     = monthIncome - monthSpend;

  // Daily data (last 14 days)
  const dailyData = getDailySpending(transactions, 14);

  // Category data
  const catSpend = {};
  monthTxns.filter(t => t.type === 'expense').forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
  });
  const categoryData = Object.entries(catSpend).map(([catId, value]) => {
    const cat = getCategoryById(catId);
    return { name: cat?.name || 'Other', value, color: cat?.color || '#9CA3AF', icon: cat?.icon };
  }).sort((a,b) => b.value - a.value);

  // Monthly comparison (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mStr = d.toISOString().slice(0, 7);
    const mTxns = transactions.filter(t => t.date.startsWith(mStr));
    monthlyData.push({
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      expense: mTxns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0),
      income:  mTxns.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0),
    });
  }

  // Insights
  const topCat = categoryData[0];
  const avgDaily = monthSpend / new Date().getDate();
  const projectedMonthEnd = avgDaily * 30;
  const weekdaySpend = monthTxns.filter(t => { const d = new Date(t.date); return d.getDay() > 0 && d.getDay() < 6; }).reduce((s,t) => s + t.amount, 0);
  const weekendSpend = monthTxns.filter(t => { const d = new Date(t.date); return d.getDay() === 0 || d.getDay() === 6; }).reduce((s,t) => s + t.amount, 0);
  const totalLentPending = lendBorrow.filter(l => l.type === 'lent' && l.status !== 'paid').reduce((s,l) => s + l.balanceRemaining, 0);

  const TOOLTIP_STYLE = { background: 'var(--bg-elevated)', border: 'none', borderRadius: 10, fontSize: 12 };

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Reports & Analytics</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { exportToCSV(transactions); showToast('CSV downloaded 📊'); }}>
            📥 CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { exportToPDF(transactions, budget, lendBorrow, user); showToast('PDF downloaded 📄'); }}>
            📄 PDF
          </button>
        </div>
      </div>

      {/* Month summary */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'Expense', value: monthSpend,  color: 'var(--color-expense)' },
            { label: 'Income',  value: monthIncome, color: 'var(--color-income)'  },
            { label: 'Savings', value: savings,     color: savings >= 0 ? 'var(--color-income)' : 'var(--color-expense)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '10px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: 15, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(s.value, true)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="scroll-row" style={{ padding: '0 16px 8px' }}>
        {TABS.map(t => (
          <button key={t} className={`chip ${tab === t ? 'chip-active' : 'chip-default'}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px 20px' }}>
        {/* ── Daily Tab ── */}
        {tab === 'Daily' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>14-DAY SPENDING TREND</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--accent-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Spent']} contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="amount" stroke="var(--accent-primary)" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: 'var(--accent-primary)', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Daily table */}
            <div className="card">
              {[...dailyData].reverse().slice(0, 7).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < 6 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: d.amount > 0 ? 'var(--color-expense)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {d.amount > 0 ? formatCurrency(d.amount) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Category Tab ── */}
        {tab === 'Category' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categoryData.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📊</div><h3>No expense data</h3></div>
            ) : (
              <>
                <div className="card" style={{ padding: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>CATEGORY BREAKDOWN</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  {categoryData.map((cat, i) => {
                    const pct = (cat.value / monthSpend * 100).toFixed(1);
                    return (
                      <div key={i} style={{ padding: '10px 14px', borderBottom: i < categoryData.length-1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{cat.icon}</span>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: cat.color }}>{formatCurrency(cat.value)}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>{pct}%</span>
                          </div>
                        </div>
                        <div className="progress-bar-wrap" style={{ height: 5 }}>
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: cat.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Income vs Expense Tab ── */}
        {tab === 'Income vs Expense' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>6-MONTH COMPARISON</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="income"  fill="var(--color-income)"  radius={[4,4,0,0]} name="Income" />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[4,4,0,0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Avg Monthly Income',  value: monthlyData.reduce((s,m) => s+m.income, 0) / 6,   color: 'var(--color-income)' },
                { label: 'Avg Monthly Expense', value: monthlyData.reduce((s,m) => s+m.expense, 0) / 6,  color: 'var(--color-expense)' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(s.value, true)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Insights Tab ── */}
        {tab === 'Insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { emoji: '🏆', label: 'Top spending category', value: topCat ? `${topCat.icon} ${topCat.name} (${formatCurrency(topCat.value)})` : 'N/A', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
              { emoji: '📈', label: 'Projected month-end spend', value: formatCurrency(projectedMonthEnd), bg: 'rgba(108,99,255,0.08)', border: 'rgba(108,99,255,0.2)' },
              { emoji: '📅', label: 'Average daily spending', value: formatCurrency(avgDaily), bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
              { emoji: '🏢', label: 'Weekday spending', value: formatCurrency(weekdaySpend), bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
              { emoji: '🎉', label: 'Weekend spending', value: formatCurrency(weekendSpend), bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
              { emoji: '🤝', label: 'Total lending pending', value: formatCurrency(totalLentPending), bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
            ].map((insight, i) => (
              <div key={i} style={{ background: insight.bg, border: `1px solid ${insight.border}`, borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{insight.emoji}</span>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{insight.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 700 }}>{insight.value}</p>
                </div>
              </div>
            ))}

            {/* Smart suggestion */}
            <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(167,139,250,0.1))', border: '1px solid var(--border-accent)', borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8 }}>🤖 AI INSIGHT</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {topCat
                  ? `You spent ${formatCurrency(topCat.value)} on ${topCat.name} this month — your biggest expense category. Consider setting a category budget to keep it in check.`
                  : 'Add more transactions to get personalized spending insights!'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
