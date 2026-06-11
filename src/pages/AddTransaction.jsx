import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { autoCategory, getPaymentAppName } from '../utils/helpers';
import { CATEGORIES } from '../data/demoData';

const TYPES    = ['expense', 'income', 'lent', 'borrowed'];
const PAY_APPS = ['phonepe', 'gpay', 'paytm', 'bank', 'cash', 'card', 'other'];
const TAGS     = ['personal', 'family', 'business', 'investment', 'loan'];

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, showToast, categories } = useStore();

  const [form, setForm] = useState({
    type: 'expense', amount: '', description: '', category: 'c16',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    paymentApp: 'phonepe', tags: 'personal',
    personName: '', notes: '', upiRef: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDesc = (v) => {
    set('description', v);
    const suggested = autoCategory(v);
    if (suggested !== 'c16') set('category', suggested);
  };

  const handleSubmit = () => {
    if (!form.amount || isNaN(Number(form.amount))) { showToast('Enter a valid amount', 'error'); return; }
    if (!form.description) { showToast('Enter a description', 'error'); return; }
    addTransaction({ ...form, amount: Number(form.amount) });
    showToast(`${form.type === 'income' ? '💰' : '💸'} Transaction added!`);
    navigate(-1);
  };

  const typeColors = { expense: 'var(--color-expense)', income: 'var(--color-income)', lent: 'var(--color-lent)', borrowed: 'var(--color-borrow)' };
  const allCats = categories.filter(c => form.type === 'income' ? c.type === 'income' : c.type === 'expense');

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Add Transaction</h2>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type Selector */}
        <div className="type-selector">
          {TYPES.map(t => (
            <button key={t} className={`type-btn type-${t} ${form.type === t ? 'active' : ''}`}
              onClick={() => set('type', t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount</label>
          <div className="amount-input-wrap">
            <span className="amount-prefix" style={{ color: typeColors[form.type] }}>₹</span>
            <input className="amount-input-field" type="number" placeholder="0"
              value={form.amount} onChange={e => set('amount', e.target.value)} inputMode="decimal" />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" placeholder="What was this for?" value={form.description}
            onChange={e => handleDesc(e.target.value)} />
          {form.description && <p style={{ fontSize: 11, color: 'var(--accent-primary)' }}>
            ✨ Auto-categorized based on description
          </p>}
        </div>

        {/* Category grid */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-grid">
            {allCats.map(cat => (
              <div key={cat.id} className={`category-item ${form.category === cat.id ? 'selected' : ''}`}
                onClick={() => set('category', cat.id)}>
                <div className="cat-icon" style={{ background: form.category === cat.id ? `${cat.color}22` : 'var(--bg-elevated)' }}>
                  {cat.icon}
                </div>
                <span className="cat-name">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Person (for lent/borrowed) */}
        {(form.type === 'lent' || form.type === 'borrowed') && (
          <div className="form-group">
            <label className="form-label">Person Name</label>
            <input className="form-input" placeholder="Who did you lend/borrow from?"
              value={form.personName} onChange={e => set('personName', e.target.value)} />
          </div>
        )}

        {/* Date + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input className="form-input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
        </div>

        {/* Payment App */}
        <div className="form-group">
          <label className="form-label">Payment Via</label>
          <div className="scroll-row">
            {PAY_APPS.map(app => (
              <button key={app} className={`chip ${form.paymentApp === app ? 'chip-active' : 'chip-default'}`}
                onClick={() => set('paymentApp', app)}>
                {getPaymentAppName(app)}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Tag</label>
          <div className="scroll-row">
            {TAGS.map(tag => (
              <button key={tag} className={`chip ${form.tags === tag ? 'chip-active' : 'chip-default'}`}
                onClick={() => set('tags', tag)}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-input" rows={2} placeholder="Add a note..." value={form.notes}
            onChange={e => set('notes', e.target.value)} style={{ resize: 'none' }} />
        </div>

        {/* UPI Ref */}
        <div className="form-group">
          <label className="form-label">UPI Reference ID (optional)</label>
          <input className="form-input" placeholder="e.g. T2306100001" value={form.upiRef}
            onChange={e => set('upiRef', e.target.value)} />
        </div>

        {/* Attach receipt */}
        <button className="btn btn-ghost btn-full" style={{ border: '1.5px dashed var(--border-default)', borderRadius: 12 }}>
          📎 Attach Receipt / Screenshot
        </button>

        {/* Submit */}
        <button className="btn btn-primary btn-lg btn-full" onClick={handleSubmit}>
          ✓ Save Transaction
        </button>
      </div>
    </div>
  );
}
