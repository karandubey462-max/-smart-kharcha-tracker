import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/helpers';

export default function SavingsGoals() {
  const navigate = useNavigate();
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteGoal, showToast } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '0', deadline: '', icon: '🎯', color: '#6C63FF' });

  const ICONS = ['🎯', '🏖️', '📱', '🏠', '🚗', '🎓', '💍', '✈️', '🛡️', '💻', '🎸', '🏋️'];
  const COLORS = ['#6C63FF', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7', '#EC4899', '#14B8A6'];

  const handleAdd = () => {
    if (!form.name || !form.targetAmount) { showToast('Fill required fields', 'error'); return; }
    addSavingsGoal({ ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount) });
    showToast('Goal created 🎯');
    setShowAdd(false);
    setForm({ name: '', targetAmount: '', currentAmount: '0', deadline: '', icon: '🎯', color: '#6C63FF' });
  };

  const handleContribute = (id, amount) => {
    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) return;
    updateSavingsGoal(id, { currentAmount: goal.currentAmount + Number(amount) });
    showToast('Contribution added ✅');
  };

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Savings Goals</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Goal</button>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Total savings */}
        <div className="hero-card">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>TOTAL SAVED</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(savingsGoals.reduce((s,g) => s + g.currentAmount, 0))}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              of {formatCurrency(savingsGoals.reduce((s,g) => s + g.targetAmount, 0))} across {savingsGoals.length} goals
            </p>
          </div>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No savings goals yet</h3>
            <p>Create your first goal to start tracking your savings</p>
          </div>
        ) : (
          savingsGoals.map(goal => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div key={goal.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${goal.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {goal.icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{goal.name}</p>
                      {goal.deadline && (
                        <p style={{ fontSize: 11, color: daysLeft < 30 ? 'var(--color-lent)' : 'var(--text-muted)' }}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Ring progress */}
                  <svg width="52" height="52" style={{ flexShrink: 0 }}>
                    <circle cx="26" cy="26" r="22" fill="none" stroke="var(--bg-elevated)" strokeWidth="4" />
                    <circle cx="26" cy="26" r="22" fill="none" stroke={goal.color} strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 26 26)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                    <text x="26" y="30" textAnchor="middle" fill={goal.color} fontSize="11" fontWeight="700">
                      {pct.toFixed(0)}%
                    </text>
                  </svg>
                </div>

                <div className="progress-bar-wrap" style={{ marginBottom: 10 }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${goal.color}aa, ${goal.color})` }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Saved</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: goal.color, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Remaining</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(remaining)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Target</p>
                    <p style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-income btn-sm" style={{ flex: 1 }} onClick={() => {
                    const amt = prompt('Add amount to this goal (₹):');
                    if (amt && !isNaN(Number(amt))) handleContribute(goal.id, amt);
                  }}>+ Add Savings</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteGoal(goal.id)}>🗑</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Goal Sheet */}
      {showAdd && (
        <>
          <div className="sheet-overlay" onClick={() => setShowAdd(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>New Savings Goal</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Icon Picker */}
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      style={{ width: 40, height: 40, fontSize: 20, borderRadius: 10, border: `2px solid ${form.icon === ic ? 'var(--accent-primary)' : 'var(--border-default)'}`, background: form.icon === ic ? 'var(--accent-primary-dim)' : 'var(--bg-tertiary)', cursor: 'pointer' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              {/* Color Picker */}
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? 'white' : 'transparent'}`, cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Goal Name *</label>
                <input className="form-input" placeholder="e.g. Emergency Fund" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount *</label>
                <div className="amount-input-wrap">
                  <span className="amount-prefix">₹</span>
                  <input className="amount-input-field" type="number" placeholder="0" value={form.targetAmount}
                    onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} inputMode="decimal" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Current Savings</label>
                <div className="amount-input-wrap">
                  <span className="amount-prefix">₹</span>
                  <input className="amount-input-field" type="number" placeholder="0" value={form.currentAmount}
                    onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} inputMode="decimal" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input className="form-input" type="date" value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleAdd}>Create Goal 🎯</button>
            </div>
          </div>
        </>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}
