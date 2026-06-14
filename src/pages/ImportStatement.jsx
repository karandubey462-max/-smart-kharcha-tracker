import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { parseCSVTransactions, autoCategory } from '../utils/helpers';
import { getCategoryById } from '../data/demoData';

const PHONEPE_SAMPLE = `Date,Description,Amount,Type,UPI Ref
2026-06-10,Swiggy Food Order,380,Debit,P202606100001
2026-06-10,D-Mart Grocery Purchase,1240,Debit,P202606100002
2026-06-09,Salary Credit,55000,Credit,P202606090001
2026-06-09,Netflix Subscription,199,Debit,P202606090002
2026-06-08,Ola Cab Booking,250,Debit,P202606080001
2026-06-08,Airtel Mobile Recharge,299,Debit,P202606080002
2026-06-07,Apollo Pharmacy Purchase,680,Debit,P202606070001`;

export default function ImportStatement() {
  const navigate = useNavigate();
  const { importTransactions, showToast } = useStore();
  const [step, setStep]     = useState(1);
  const [file, setFile]     = useState(null);
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading]   = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        console.log('📄 File loaded, parsing...');
        const txns = parseCSVTransactions(ev.target.result);
        console.log('✅ Parsed result:', txns);
        
        if (txns.length === 0) {
          showToast('No transactions found. Check CSV format.', 'warning');
          setStep(2);
        } else {
          setParsed(txns);
          setSelected(new Set(txns.map(t => t.id)));
          setStep(3);
          showToast(`Found ${txns.length} transactions ✅`);
        }
      } catch (err) {
        console.error('❌ Parse error:', err);
        showToast('Could not parse file. Use PhonePe CSV format.', 'error');
        setStep(2);
      }
      setLoading(false);
    };
    reader.onerror = () => {
      console.error('❌ File read error');
      showToast('Could not read file', 'error');
      setLoading(false);
    };
    reader.readAsText(f);
  };

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => {
      const txns = parseCSVTransactions(PHONEPE_SAMPLE);
      setParsed(txns);
      setSelected(new Set(txns.map(t => t.id)));
      setFile({ name: 'phonepe_statement_demo.csv' });
      setStep(3);
      setLoading(false);
    }, 800);
  };

  const handleImport = () => {
    const toImport = parsed.filter(t => selected.has(t.id));
    importTransactions(toImport);
    showToast(`${toImport.length} transactions imported ✅`);
    navigate('/transactions');
  };

  const toggleSelect = (id) => setSelected(s => {
    const ns = new Set(s);
    ns.has(id) ? ns.delete(id) : ns.add(id);
    return ns;
  });

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Import Statement</h2>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', gap: 4 }}>
        {['Instructions', 'Upload', 'Review', 'Done'].map((s, i) => (
          <>
            <div key={s} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 700, flexShrink: 0,
              background: i + 1 <= step ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: i + 1 <= step ? 'white' : 'var(--text-muted)',
            }}>{i + 1}</div>
            {i < 3 && <div key={`line-${i}`} style={{ flex: 1, height: 2, background: i + 1 < step ? 'var(--accent-primary)' : 'var(--border-default)' }} />}
          </>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Step 1 — Instructions */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid var(--border-accent)', borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 10 }}>📱 How to export PhonePe Statement</p>
              {[
                'Open PhonePe app on your phone',
                'Go to Profile → Transaction History',
                'Tap "Download Statement" or "Export"',
                'Select date range and download as CSV',
                'Share the file to this app',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-lent)', marginBottom: 4 }}>⚠️ Privacy Note</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                All data stays on your device. No transaction data is sent to any server. We do not have direct access to your PhonePe account.
              </p>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Supported formats: CSV, TXT</p>
            <button className="btn btn-primary btn-full" onClick={() => setStep(2)}>Next →</button>
          </div>
        )}

        {/* Step 2 — Upload */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              padding: 32, borderRadius: 16, border: '2px dashed var(--border-default)',
              cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 48 }}>📂</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>Tap to upload statement</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>CSV, TXT files supported</p>
              </div>
              <input type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: 'none' }} />
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            </div>

            <button className="btn btn-secondary btn-full" onClick={handleDemo} disabled={loading}>
              {loading ? '⏳ Loading...' : '🎮 Try with Demo Data'}
            </button>

            <button className="btn btn-ghost btn-full" onClick={() => setStep(1)}>← Back</button>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--color-income-dim)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--color-income)', fontWeight: 700 }}>✅ PARSED SUCCESSFULLY</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{file?.name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-income)' }}>{selected.size}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>selected</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{parsed.length} transactions found</p>
              <button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setSelected(selected.size === parsed.length ? new Set() : new Set(parsed.map(t => t.id)))}>
                {selected.size === parsed.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="card">
              {parsed.map((t, i) => {
                const cat = getCategoryById(t.category);
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderBottom: i < parsed.length-1 ? '1px solid var(--border-subtle)' : 'none',
                    opacity: selected.has(t.id) ? 1 : 0.4,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, border: `2px solid ${selected.has(t.id) ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                      background: selected.has(t.id) ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
                    }} onClick={() => toggleSelect(t.id)}>
                      {selected.has(t.id) && <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.date} · {cat?.icon} {cat?.name}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' }}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                      </p>
                      <span style={{ fontSize: 9, background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: 999, fontWeight: 700 }}>AUTO</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={handleImport} disabled={selected.size === 0}>
              Import {selected.size} Transactions
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => setStep(2)}>← Back</button>
          </div>
        )}
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}
