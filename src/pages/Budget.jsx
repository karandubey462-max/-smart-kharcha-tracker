import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { formatCurrency, getBudgetStatus } from '../utils/helpers';
import { CATEGORIES, getMonthTransactions, getCategoryById } from '../data/demoData';

export default function Budget() {
  const navigate = useNavigate();
  const { budget, setBudget, transactions, showToast } = useStore();
  const [editing, setEditing] = useState(false);
  const [totalBudget, setTotalBudget] = useState(budget.totalBudget);
  const [catBudgets, setCatBudgets]   = useState(
    Object.fromEntries((budget.categories || []).map(c => [c.categoryId, c.allocated]))
  );

  const monthTxns  = getMonthTransactions(transactions);
  const monthSpend = monthTxns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const overallStatus = getBudgetStatus(monthSpend, totalBudget);

  // Category spending this month
  const catSpend = {};
  monthTxns.filter(t => t.type === 'expense').forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
  });

  const handleSave = () => {
    setBudget({
      ...budget,
      totalBudget: Number(totalBudget),
      categories: Object.entries(catBudgets).map(([categoryId, allocated]) => ({
        categoryId,
        allocated: Number(allocated),
        color: getCategoryById(categoryId)?.color || '#6B7280',
      })),
    });
    showToast('Budget updated 🎯');
    setEditing(false);
  };

  const expenseCategories = CATEGORIES.filter(c => c.type === 'expense');

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Budget Planner</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? 'Save' : '✏️ Edit'}
        </button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Overall Budget Card */}
        <div className="hero-card">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>MONTHLY BUDGET</p>
            {editing ? (
              <div className="amount-input-wrap" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span className="amount-prefix" style={{ color: 'white' }}>₹</span>
                <input className="amount-input-field" type="number" value={totalBudget}
                  onChange={e => setTotalBudget(e.target.value)} style={{ color: 'white' }} inputMode="decimal" />
              </div>
            ) : (
              <p style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>{formatCurrency(totalBudget)}</p>
            )}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Spent {formatCurrency(monthSpend)}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>{overallStatus.pct.toFixed(0)}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 999 }}>
                <div style={{
                  height: '100%', borderRadius: 999, transition: 'width 1s ease',
                  width: `${Math.min(overallStatus.pct, 100)}%`,
                  background: overallStatus.pct >= 80
                    ? 'linear-gradient(90deg, #F87171, #FC8181)'
                    : 'linear-gradient(90deg, #6C63FF, #A78BFA)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <div>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Remaining</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: overallStatus.pct >= 80 ? '#FCA5A5' : '#A3E4B5' }}>
                    {formatCurrency(Math.max(totalBudget - monthSpend, 0))}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Status</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: overallStatus.pct >= 100 ? '#FCA5A5' : overallStatus.pct >= 80 ? '#FDE68A' : '#6EE7B7' }}>
                    {overallStatus.pct >= 100 ? '🔴 Over Budget' : overallStatus.pct >= 80 ? '🟡 Near Limit' : '🟢 On Track'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Budgets */}
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Category Budgets</h3>
        {expenseCategories.map(cat => {
          const allocated = catBudgets[cat.id] || 0;
          const spent = catSpend[cat.id] || 0;
          const status = getBudgetStatus(spent, allocated);

          return (
            <div key={cat.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatCurrency(spent)} of {allocated ? formatCurrency(allocated) : 'No limit'}
                    </p>
                  </div>
                </div>
                {editing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)' }}>₹</span>
                    <input type="number" value={catBudgets[cat.id] || ''}
                      onChange={e => setCatBudgets(c => ({ ...c, [cat.id]: e.target.value }))}
                      style={{ width: 80, background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none' }}
                      placeholder="0" inputMode="decimal" />
                  </div>
                ) : (
                  allocated > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: status.pct >= 80 ? 'var(--color-expense)' : 'var(--text-muted)' }}>{status.pct.toFixed(0)}%</span>
                )}
              </div>
              {allocated > 0 && (
                <div className="progress-bar-wrap">
                  <div className={`progress-bar-fill ${status.cls}`} style={{ width: `${Math.min(status.pct, 100)}%` }} />
                </div>
              )}
              {status.pct >= 80 && allocated > 0 && (
                <p style={{ fontSize: 11, color: status.pct >= 100 ? 'var(--color-expense)' : 'var(--color-lent)', marginTop: 6 }}>
                  {status.pct >= 100 ? '⚠️ Budget exceeded!' : `⚡ ${(100 - status.pct).toFixed(0)}% remaining`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
