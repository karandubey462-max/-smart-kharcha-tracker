import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/helpers';
import { getCategoryById } from '../data/demoData';

export default function Recurring() {
  const navigate = useNavigate();
  const { recurring, toggleRecurring, addRecurring, showToast } = useStore();
  const [showAdd, setShowAdd] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', amount: '', categoryId: 'c6', frequency: 'monthly', nextDue: '', isActive: true, autoAdd: false });

  const totalMonthly = recurring.filter(r => r.isActive).reduce((s,r) => {
    if (r.frequency === 'daily')   return s + r.amount * 30;
    if (r.frequency === 'weekly')  return s + r.amount * 4;
    if (r.frequency === 'yearly')  return s + r.amount / 12;
    return s + r.amount;
  }, 0);

  const handleAdd = () => {
    if (!form.name || !form.amount) { showToast('Fill required fields', 'error'); return; }
    addRecurring({ ...form, amount: Number(form.amount) });
    showToast('Recurring expense added 🔄');
    setShowAdd(false);
  };

  const freq_icons = { daily: '📅', weekly: '📆', monthly: '🗓', yearly: '📅' };

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Recurring Expenses</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 14, border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>MONTHLY RECURRING</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-expense)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalMonthly)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE</p>
            <p style={{ fontSize: 26, fontWeight: 800 }}>{recurring.filter(r => r.isActive).length}</p>
          </div>
        </div>

        {recurring.map(r => {
          const cat = getCategoryById(r.categoryId);
          return (
            <div key={r.id} className="card" style={{ padding: 14, opacity: r.isActive ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cat?.color || '#6C63FF'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {cat?.icon || '🔄'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-expense)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(r.amount)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="chip chip-default" style={{ padding: '2px 8px', fontSize: 10 }}>
                        {freq_icons[r.frequency]} {r.frequency}
                      </span>
                      {r.autoAdd && <span className="chip chip-active" style={{ padding: '2px 8px', fontSize: 10 }}>Auto-add</span>}
                    </div>
                    <div onClick={() => toggleRecurring(r.id)} style={{
                      width: 48, height: 26, borderRadius: 999, cursor: 'pointer',
                      background: r.isActive ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                      border: `2px solid ${r.isActive ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                      position: 'relative', transition: 'all 0.2s', flexShrink: 0,
                    }}>
                      <div style={{
                        position: 'absolute', top: 2, left: 2, width: 18, height: 18,
                        borderRadius: '50%', background: 'white', transition: 'transform 0.2s',
                        transform: r.isActive ? 'translateX(22px)' : 'translateX(0)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }} />
                    </div>
                  </div>
                  {r.nextDue && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Next due: {formatDate(r.nextDue)}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <>
          <div className="sheet-overlay" onClick={() => setShowAdd(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>Add Recurring Expense</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" placeholder="e.g. Netflix, Rent" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <div className="amount-input-wrap">
                  <span className="amount-prefix">₹</span>
                  <input className="amount-input-field" type="number" placeholder="0" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} inputMode="decimal" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <div className="type-selector">
                  {['daily','weekly','monthly','yearly'].map(f => (
                    <button key={f} className={`type-btn ${form.frequency === f ? 'active' : ''}`}
                      onClick={() => setForm(fr => ({ ...fr, frequency: f }))}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Next Due Date</label>
                <input className="form-input" type="date" value={form.nextDue}
                  onChange={e => setForm(f => ({ ...f, nextDue: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleAdd}>Add Recurring 🔄</button>
            </div>
          </div>
        </>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}

