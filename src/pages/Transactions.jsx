import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { formatCurrency, formatDate, formatTime, getTxnColor, getTxnSign, groupByDate } from '../utils/helpers';
import { getCategoryById } from '../data/demoData';

const FILTER_TYPES = ['All', 'Expense', 'Income', 'Lent', 'Borrowed'];

export default function Transactions() {
  const navigate = useNavigate();
  const { transactions } = useStore();
  const [search, setSearch]       = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy]       = useState('date');

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        if (filterType !== 'All' && t.type.toLowerCase() !== filterType.toLowerCase()) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            t.description?.toLowerCase().includes(q) ||
            t.personName?.toLowerCase().includes(q) ||
            t.category?.includes(q) ||
            String(t.amount).includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date')   return new Date(b.date) - new Date(a.date);
        if (sortBy === 'amount') return b.amount - a.amount;
        return 0;
      });
  }, [transactions, search, filterType, sortBy]);

  const grouped = groupByDate(filtered);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '52px 16px 12px', background: 'linear-gradient(180deg, rgba(108,99,255,0.06) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Transactions</h1>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/import')}>📥 Import</button>
        </div>

        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input className="search-input" placeholder="Search transactions..." value={search}
            onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>}
        </div>

        {/* Filter chips */}
        <div className="scroll-row">
          {FILTER_TYPES.map(f => (
            <button key={f} className={`chip ${filterType === f ? 'chip-active' : 'chip-default'}`}
              onClick={() => setFilterType(f)}>
              {f}
            </button>
          ))}
          <button className={`chip ${sortBy === 'amount' ? 'chip-active' : 'chip-default'}`}
            onClick={() => setSortBy(s => s === 'amount' ? 'date' : 'amount')}>
            {sortBy === 'amount' ? '↑ Amount' : '🗓 Date'}
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', gap: 0, padding: '0 16px 12px' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: '10px 0 0 10px', background: 'var(--color-income-dim)' }}>
            <p style={{ fontSize: 10, color: 'var(--color-income)', fontWeight: 700 }}>INCOME</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-income)' }}>{formatCurrency(totalIncome, true)}</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: '0 10px 10px 0', background: 'var(--color-expense-dim)' }}>
            <p style={{ fontSize: 10, color: 'var(--color-expense)', fontWeight: 700 }}>EXPENSE</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-expense)' }}>{formatCurrency(totalExpense, true)}</p>
          </div>
        </div>
      )}

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No transactions found</h3>
          <p>Try changing your search or filter</p>
        </div>
      ) : (
        grouped.map(({ date, txns }) => {
          const dayTotal = txns.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
          return (
            <div key={date}>
              <div className="txn-date-header">
                <span className="date-label">{formatDate(date)}</span>
                {dayTotal > 0 && <span className="date-total">-{formatCurrency(dayTotal)}</span>}
              </div>
              <div className="card" style={{ margin: '0 16px 8px' }}>
                {txns.map(t => {
                  const cat = getCategoryById(t.category);
                  return (
                    <div key={t.id} className="txn-item" onClick={() => navigate(`/transactions/${t.id}`)}>
                      <div className="txn-icon" style={{ background: cat?.color ? `${cat.color}22` : 'var(--bg-tertiary)' }}>
                        {cat?.icon || '📦'}
                      </div>
                      <div className="txn-info">
                        <div className="txn-title">{t.description}</div>
                        <div className="txn-meta">
                          <span className="txn-time">{formatTime(t.time)}</span>
                          <span className={`txn-source-badge txn-source-${t.source}`}>{t.source}</span>
                          {t.paymentApp && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{t.paymentApp}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="txn-amount" style={{ color: getTxnColor(t.type) }}>
                          {getTxnSign(t.type)}{formatCurrency(t.amount)}
                        </div>
                        {t.tags && <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{t.tags}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}
