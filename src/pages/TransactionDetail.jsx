import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { formatCurrency, formatDate, formatTime, getTxnColor, getTxnSign, getPaymentAppName } from '../utils/helpers';
import { getCategoryById } from '../data/demoData';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, deleteTransaction, showToast } = useStore();
  const txn = transactions.find(t => t.id === id);

  if (!txn) return (
    <div>
      <div className="page-header"><button className="btn-back" onClick={() => navigate(-1)}>←</button><h2>Transaction</h2></div>
      <div className="empty-state"><div className="empty-icon">🔍</div><h3>Not found</h3></div>
    </div>
  );

  const cat = getCategoryById(txn.category);

  const handleDelete = () => {
    if (confirm('Delete this transaction?')) {
      deleteTransaction(txn.id);
      showToast('Transaction deleted');
      navigate(-1);
    }
  };

  const handleShare = () => {
    const shareText = `${txn.description}\n${getTxnSign(txn.type)}${formatCurrency(txn.amount)}\n${formatDate(txn.date)} • ${cat?.name || 'Transaction'}\n\nShared from Smart Kharcha Tracker`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Transaction Details',
        text: shareText,
      }).catch(() => {
        // User cancelled or error
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        showToast('Transaction details copied to clipboard! 📋');
      }).catch(() => {
        showToast('Unable to share', 'error');
      });
    }
  };

  const typeLabels = { expense: 'Expense', income: 'Income', lent: 'Lent', borrowed: 'Borrowed', refund: 'Refund', repayment: 'Repayment' };

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Transaction Details</h2>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑</button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Hero amount card */}
        <div style={{
          background: `linear-gradient(135deg, ${cat?.color || '#6C63FF'}22, ${cat?.color || '#6C63FF'}11)`,
          border: `1px solid ${cat?.color || '#6C63FF'}33`,
          borderRadius: 20, padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{cat?.icon || '📦'}</div>
          <p style={{ fontSize: 38, fontWeight: 900, color: getTxnColor(txn.type), fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
            {getTxnSign(txn.type)}{formatCurrency(txn.amount)}
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>{txn.description}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <span className={`badge ${txn.type === 'income' ? 'badge-paid' : 'badge-unpaid'}`}>
              {typeLabels[txn.type] || txn.type}
            </span>
            <span className={`txn-source-badge txn-source-${txn.source}`}>{txn.source}</span>
            {txn.tags && <span style={{ fontSize: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 999 }}>{txn.tags}</span>}
          </div>
        </div>

        {/* Details card */}
        <div className="card">
          {[
            { label: 'Date', value: formatDate(txn.date) },
            { label: 'Time', value: formatTime(txn.time) },
            { label: 'Category', value: `${cat?.icon} ${cat?.name}` },
            { label: 'Payment Via', value: getPaymentAppName(txn.paymentApp) },
            txn.personName && { label: 'Person', value: txn.personName },
            txn.upiRef && { label: 'UPI Ref', value: txn.upiRef },
            txn.notes && { label: 'Notes', value: txn.notes },
          ].filter(Boolean).map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px',
              borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/add-transaction?edit=${txn.id}`)}>✏️ Edit</button>
          <button className="btn btn-ghost" style={{ border: '1px solid var(--border-default)' }} onClick={handleShare}>📤 Share</button>
        </div>

        {/* Audit note */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            🔒 Added {txn.source === 'auto' ? 'via auto-import' : 'manually'} on {formatDate(txn.date)}
          </p>
        </div>
      </div>
    </div>
  );
}
