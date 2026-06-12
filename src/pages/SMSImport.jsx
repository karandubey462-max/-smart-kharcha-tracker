import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { parseSMSText, parseMultipleSMS, SAMPLE_SMS_MESSAGES } from '../utils/smsParser';
import { autoCategory } from '../utils/helpers';
import { getCategoryById } from '../data/demoData';
import { formatCurrency } from '../utils/helpers';

const TABS = ['Paste SMS', 'Auto Webhook', 'Setup Guide'];

export default function SMSImport() {
  const navigate = useNavigate();
  const { importTransactions, showToast, transactions, user } = useStore();

  const [tab, setTab]           = useState('Paste SMS');
  const [smsText, setSmsText]   = useState('');
  const [parsed, setParsed]     = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading]   = useState(false);
  const [watching, setWatching] = useState(false);
  const [autoImported, setAutoImported] = useState([]);

  // ── Paste & Parse ──
  const handleParse = () => {
    if (!smsText.trim()) { showToast('Paste at least one SMS message', 'error'); return; }
    setLoading(true);
    setTimeout(() => {
      const single = parseSMSText(smsText);
      const multi  = parseMultipleSMS(smsText);
      const results = multi.length > 0 ? multi : (single ? [single] : []);

      if (results.length === 0) {
        showToast('Could not detect a transaction in this SMS', 'error');
      } else {
        // Check for duplicates against existing transactions
        const existingRefs = new Set(transactions.map(t => t.upiRef).filter(Boolean));
        const deduped = results.filter(r => !r.upiRef || !existingRefs.has(r.upiRef));
        const dupes   = results.length - deduped.length;

        setParsed(deduped);
        setSelected(new Set(deduped.map(t => t.id)));
        if (dupes > 0) showToast(`${dupes} duplicate(s) skipped ✓`, 'warning');
      }
      setLoading(false);
    }, 400);
  };

  const handleImport = () => {
    const toImport = parsed.filter(t => selected.has(t.id));
    if (toImport.length === 0) { showToast('Select at least one transaction', 'error'); return; }
    importTransactions(toImport);
    showToast(`${toImport.length} transaction${toImport.length > 1 ? 's' : ''} imported from SMS ✅`);
    setSmsText('');
    setParsed([]);
    navigate('/transactions');
  };

  const handleDemo = () => {
    setSmsText(SAMPLE_SMS_MESSAGES.join('\n\n'));
    showToast('Demo SMS messages loaded!');
  };

  const toggleSelect = (id) => setSelected(s => {
    const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns;
  });

  // ── Auto Watch simulator ──
  const simulateAutoWatch = () => {
    setWatching(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= SAMPLE_SMS_MESSAGES.length) { clearInterval(interval); setWatching(false); return; }
      const txn = parseSMSText(SAMPLE_SMS_MESSAGES[i]);
      if (txn) {
        importTransactions([txn]);
        setAutoImported(prev => [txn, ...prev]);
        showToast(`📩 Auto-imported: ${txn.description.slice(0, 30)}…`);
      }
      i++;
    }, 2000);
  };

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>SMS Auto-Import</h2>
      </div>

      {/* Banner */}
      <div style={{
        margin: '12px 16px',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(167,139,250,0.08))',
        border: '1px solid var(--border-accent)',
        borderRadius: 16, padding: 14,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 28 }}>📱</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 4 }}>
              Get transactions from PhonePe SMS
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              PhonePe sends an SMS for every transaction. Paste it here — we'll parse it automatically in 1 second.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="scroll-row" style={{ padding: '0 16px 12px', gap: 8 }}>
        {TABS.map(t => (
          <button key={t} className={`chip ${tab === t ? 'chip-active' : 'chip-default'}`} onClick={() => setTab(t)}>
            {t === 'Paste SMS' ? '📋 Paste SMS' : t === 'Auto Webhook' ? '📡 Auto Webhook (Real)' : '⚙️ Native App (CLI)'}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px 20px' }}>

        {/* ── Tab 1: Paste SMS ── */}
        {tab === 'Paste SMS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                className="form-input"
                rows={6}
                style={{ resize: 'none', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, flex: 1 }}
                placeholder={`Paste your PhonePe / bank SMS here...\n\nExample:\nRs.380.00 debited from A/c XXXX1234 on 11-06-26. UPI: Swiggy Food Delivery. UPI Ref: P202606110001.`}
                value={smsText}
                onChange={e => { setSmsText(e.target.value); setParsed([]); }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, border: '1px dashed var(--border-default)' }} onClick={handleDemo}>
                🎮 Load Demo SMS
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleParse} disabled={loading || !smsText.trim()}>
                {loading ? '⏳ Parsing…' : '🔍 Parse SMS'}
              </button>
            </div>

            {/* Support hint */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>SUPPORTED SMS FROM</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['PhonePe', 'Google Pay', 'Paytm', 'SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'].map(b => (
                  <span key={b} style={{ fontSize: 11, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 99, padding: '3px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Parsed preview */}
            {parsed.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>✅ {parsed.length} transaction{parsed.length > 1 ? 's' : ''} detected</p>
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => setSelected(selected.size === parsed.length ? new Set() : new Set(parsed.map(t => t.id)))}
                  >
                    {selected.size === parsed.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="card">
                  {parsed.map((t, i) => {
                    const cat = getCategoryById(t.category || autoCategory(t.description));
                    return (
                      <div key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                        borderBottom: i < parsed.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        opacity: selected.has(t.id) ? 1 : 0.4,
                      }}>
                        {/* Checkbox */}
                        <div onClick={() => toggleSelect(t.id)} style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                          border: `2px solid ${selected.has(t.id) ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                          background: selected.has(t.id) ? 'var(--accent-primary)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {selected.has(t.id) && <span style={{ fontSize: 12, color: 'white', fontWeight: 800 }}>✓</span>}
                        </div>

                        {/* Category icon */}
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: `${cat?.color || '#9CA3AF'}22`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}>{cat?.icon || '📦'}</div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.description}
                          </p>
                          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.date}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
                            <span style={{ fontSize: 10, color: 'var(--accent-primary)', fontWeight: 700 }}>
                              {cat?.name || 'Other'}
                            </span>
                            {t.upiRef && (
                              <span style={{ fontSize: 9, background: 'var(--bg-elevated)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: 99 }}>
                                {t.upiRef.slice(0, 12)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{
                            fontSize: 15, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                            color: t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                          }}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </p>
                          <span style={{
                            fontSize: 9, background: 'rgba(108,99,255,0.15)', color: 'var(--accent-primary)',
                            padding: '2px 6px', borderRadius: 99, fontWeight: 700,
                          }}>SMS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button className="btn btn-primary btn-full btn-lg" onClick={handleImport} disabled={selected.size === 0}>
                  ✓ Import {selected.size} Transaction{selected.size !== 1 ? 's' : ''}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Tab 2: Auto Webhook ── */}
        {tab === 'Auto Webhook' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(167,139,250,0.08))',
              border: '1px solid var(--border-accent)',
              borderRadius: 16, padding: 18,
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8 }}>
                📡 Webhook Auto-Read (Recommended)
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You can auto-track transactions in the background using a free SMS Forwarder app.
                Whenever you get a payment SMS, it is sent to your personal webhook and saved instantly!
              </p>
            </div>

            {/* Webhook URL Display */}
            <div className="card" style={{ padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                YOUR PERSONAL WEBHOOK URL
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
                borderRadius: 10, padding: 8, paddingLeft: 12,
              }}>
                <code style={{
                  fontSize: 10, color: 'var(--accent-primary)', flex: 1,
                  wordBreak: 'break-all', fontFamily: 'monospace',
                }}>
                  {`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/webhook/sms/${user?._id || 'guest_user_id'}`}
                </code>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ whiteSpace: 'nowrap', padding: '6px 12px', height: 'auto', border: '1px solid var(--border-default)' }}
                  onClick={() => {
                    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/webhook/sms/${user?._id || ''}`;
                    navigator.clipboard.writeText(url);
                    showToast('Webhook URL copied! 📋');
                  }}
                >
                  Copy URL
                </button>
              </div>
            </div>

            {/* Steps card */}
            <div className="card" style={{ padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>3-STEP AUTO-READ SETUP</p>
              {[
                {
                  step: 1,
                  title: 'Install "SMS to Webhook" App',
                  desc: 'Go to Google Play Store and install any free app like "SMS to Webhook" or "SMS Forwarder" (by Hitesh Sahu).'
                },
                {
                  step: 2,
                  title: 'Configure Webhook Endpoint',
                  desc: 'In the SMS Forwarder app, create a new rule, paste your personal Webhook URL (from above), and set the HTTP method to "POST".'
                },
                {
                  step: 3,
                  title: 'Set up SMS Filters',
                  desc: 'Add text filters in the app so it only forwards messages containing words like: debited, credited, PhonePe, Paytm, GPay, or your bank name.'
                }
              ].map((s) => (
                <div key={s.step} style={{ display: 'flex', gap: 12, padding: '12px 0', borderTop: s.step > 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: 'rgba(108,99,255,0.15)', color: 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0
                  }}>{s.step}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 3: Native Setup ── */}
        {tab === 'Setup Guide' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.04))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-income)', marginBottom: 8 }}>🚀 Enable Real SMS Auto-Sync</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Install the Android native wrapper using Capacitor. This gives the app permission to read your SMS messages and import PhonePe/bank transactions automatically in real time.
              </p>
            </div>

            {/* Steps */}
            {[
              {
                step: 1,
                title: 'Install Capacitor',
                code: 'npm install @capacitor/core @capacitor/android\nnpx cap init "Smart Kharcha" "com.smartkharcha.app"',
                note: 'Wraps your web app in a native Android shell',
              },
              {
                step: 2,
                title: 'Install SMS Plugin',
                code: 'npm install capacitor-sms-retriever\nnpx cap sync android',
                note: 'Adds SMS read permission to the Android app',
              },
              {
                step: 3,
                title: 'Build Android App',
                code: 'npm run build\nnpx cap add android\nnpx cap open android',
                note: 'Opens Android Studio — click Run to install on your phone',
              },
              {
                step: 4,
                title: 'Grant SMS Permission',
                code: '// In Android — when prompted:\n// "Allow Smart Kharcha to read SMS?" → Allow',
                note: 'The app will now automatically read PhonePe SMS messages',
              },
            ].map((s) => (
              <div key={s.step} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--accent-primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                  }}>{s.step}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.note}</p>
                  </div>
                </div>
                <div style={{
                  background: 'var(--bg-primary)', borderRadius: 10, padding: '10px 12px',
                  fontFamily: 'monospace', fontSize: 11, color: 'var(--accent-primary)',
                  lineHeight: 1.7, whiteSpace: 'pre', overflowX: 'auto',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {s.code}
                </div>
              </div>
            ))}

            {/* What happens */}
            <div className="card" style={{ padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>WHAT HAPPENS AFTER SETUP</p>
              {[
                { icon: '📩', text: 'PhonePe sends SMS → App detects it instantly' },
                { icon: '🤖', text: 'Auto-parsed: amount, category, UPI ref, date' },
                { icon: '✅', text: 'Added to Today\'s transactions automatically' },
                { icon: '🔔', text: 'Push notification: "₹380 expense added"' },
                { icon: '🛡️', text: 'SMS data stays on your device — never uploaded' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                🔒 Zero server access · All data stays on device · No PhonePe API needed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
