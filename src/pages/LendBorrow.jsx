import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { formatCurrency, formatDate, getDaysLeft, getInitials } from '../utils/helpers';

export default function LendBorrow() {
  const navigate = useNavigate();
  const { lendBorrow, addLendBorrow, addRepayment, showToast } = useStore();
  const [tab, setTab]           = useState('lent');
  const [showAdd, setShowAdd]   = useState(false);
  const [showRepay, setShowRepay] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [form, setForm] = useState({
    type: 'lent', personName: '', personPhone: '', amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '', notes: '', reminderEnabled: false,
  });

  const filtered = lendBorrow.filter(l => l.type === tab);
  const totalAmt  = filtered.reduce((s,l) => s + l.amount, 0);
  const totalBalance = filtered.reduce((s,l) => s + l.balanceRemaining, 0);
  const totalPaid = filtered.filter(l => l.status === 'paid').reduce((s,l) => s + l.amount, 0);

  const handleAddRepay = (lbId) => {
    if (!repayAmount || isNaN(Number(repayAmount))) return;
    addRepayment(lbId, { amount: Number(repayAmount), date: new Date().toISOString().split('T')[0], notes: 'Repayment' });
    showToast('Repayment recorded ✅');
    setShowRepay(null);
    setRepayAmount('');
  };

  const handleAdd = () => {
    if (!form.personName || !form.amount) { showToast('Fill required fields', 'error'); return; }
    addLendBorrow({ ...form, amount: Number(form.amount) });
    showToast(`${tab === 'lent' ? '↗️' : '↙️'} Record added!`);
    setShowAdd(false);
    setForm({ type: tab, personName: '', personPhone: '', amount: '', date: new Date().toISOString().split('T')[0], dueDate: '', notes: '', reminderEnabled: false });
  };

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Lend & Borrow</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowAdd(true); setForm(f => ({ ...f, type: tab })); }}>+ Add</button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px 0' }}>
        <div className="type-selector">
          <button className={`type-btn ${tab === 'lent' ? 'active type-lent' : ''}`} onClick={() => setTab('lent')}>
            ↗️ Lent by Me
          </button>
          <button className={`type-btn ${tab === 'borrowed' ? 'active type-borrowed' : ''}`} onClick={() => setTab('borrowed')}>
            ↙️ I Need to Pay
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '12px 16px' }}>
        {[
          { label: 'Total',     value: totalAmt,     color: tab === 'lent' ? 'var(--color-lent)' : 'var(--color-borrow)' },
          { label: 'Pending',   value: totalBalance,  color: 'var(--color-expense)' },
          { label: 'Recovered', value: totalPaid,     color: 'var(--color-income)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 10, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(s.value, true)}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{tab === 'lent' ? '↗️' : '↙️'}</div>
            <h3>No {tab === 'lent' ? 'lending' : 'borrowing'} records</h3>
            <p>Tap + Add to create your first record</p>
          </div>
        ) : (
          filtered.map(lb => {
            const daysLeft = getDaysLeft(lb.dueDate);
            const isOverdue = daysLeft !== null && daysLeft < 0;
            const pct = lb.amount > 0 ? (lb.amountRecovered / lb.amount) * 100 : 0;
            return (
              <div key={lb.id} className="lb-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Avatar */}
                  <div className="person-avatar" style={{
                    background: tab === 'lent' ? 'rgba(251,191,36,0.15)' : 'rgba(96,165,250,0.15)',
                    color: tab === 'lent' ? 'var(--color-lent)' : 'var(--color-borrow)',
                  }}>{getInitials(lb.personName)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15 }}>{lb.personName}</p>
                        {lb.personPhone && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>📱 {lb.personPhone}</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: tab === 'lent' ? 'var(--color-lent)' : 'var(--color-borrow)', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(lb.balanceRemaining)}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>of {formatCurrency(lb.amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-bar-wrap">
                  <div className={`progress-bar-fill ${pct >= 100 ? 'progress-safe' : pct >= 50 ? 'progress-warning' : 'progress-danger'}`}
                    style={{ width: `${pct}%` }} />
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${lb.status === 'paid' ? 'badge-paid' : lb.status === 'partial' ? 'badge-partial' : 'badge-unpaid'}`}>
                      {lb.status}
                    </span>
                    {lb.dueDate && (
                      <span style={{ fontSize: 10, color: isOverdue ? 'var(--color-expense)' : 'var(--text-muted)' }}>
                        {isOverdue ? `⚠️ ${Math.abs(daysLeft)}d overdue` : `Due ${formatDate(lb.dueDate)}`}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {lb.status !== 'paid' && (
                      <button className="btn btn-sm btn-income" onClick={() => { setShowRepay(lb.id); setRepayAmount(''); }}>
                        + Repayment
                      </button>
                    )}
                  </div>
                </div>

                {lb.notes && <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 0' }}>📝 {lb.notes}</p>}

                {/* Repayment history */}
                {lb.repayments?.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>REPAYMENT HISTORY</p>
                    {lb.repayments.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(r.date)}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-income)' }}>+{formatCurrency(r.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Repayment Sheet */}
      {showRepay && (
        <>
          <div className="sheet-overlay" onClick={() => setShowRepay(null)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>Add Repayment</h3>
              <button onClick={() => setShowRepay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <div className="sheet-body">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Amount</label>
                <div className="amount-input-wrap">
                  <span className="amount-prefix">₹</span>
                  <input className="amount-input-field" type="number" placeholder="0" value={repayAmount}
                    onChange={e => setRepayAmount(e.target.value)} inputMode="decimal" autoFocus />
                </div>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => handleAddRepay(showRepay)}>
                Record Repayment
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Record Sheet */}
      {showAdd && (
        <>
          <div className="sheet-overlay" onClick={() => setShowAdd(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>Add {tab === 'lent' ? 'Lending' : 'Borrowing'} Record</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Person Name *</label>
                <input className="form-input" placeholder="Rahul Verma" value={form.personName}
                  onChange={e => setForm(f => ({ ...f, personName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" placeholder="9876543210" value={form.personPhone}
                  onChange={e => setForm(f => ({ ...f, personPhone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <div className="amount-input-wrap">
                  <span className="amount-prefix">₹</span>
                  <input className="amount-input-field" type="number" placeholder="0"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} inputMode="decimal" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} placeholder="What's it for?" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'none' }} />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleAdd}>Save Record</button>
            </div>
          </div>
        </>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}
