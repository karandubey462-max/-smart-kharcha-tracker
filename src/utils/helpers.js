// ── Utility helpers ───────────────────────────────────────────

export const formatCurrency = (amount, compact = false) => {
  if (amount === undefined || amount === null) return '₹0';
  const num = Math.abs(Number(amount));
  if (compact && num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (compact && num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

export const formatMonth = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + '-01');
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const getDaysLeft = (dueDateStr) => {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  const now = new Date();
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
};

export const groupByDate = (transactions) => {
  const groups = {};
  transactions.forEach(t => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, txns]) => ({ date, txns }));
};

export const getInitials = (name = '') => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
};

export const getTxnColor = (type) => {
  switch (type) {
    case 'income':    return 'var(--color-income)';
    case 'expense':   return 'var(--color-expense)';
    case 'lent':      return 'var(--color-lent)';
    case 'borrowed':  return 'var(--color-borrow)';
    case 'refund':    return 'var(--color-refund)';
    case 'repayment': return 'var(--color-income)';
    default:          return 'var(--text-muted)';
  }
};

export const getTxnSign = (type) => {
  switch (type) {
    case 'income':    return '+';
    case 'expense':   return '-';
    case 'lent':      return '↗';
    case 'borrowed':  return '↙';
    case 'refund':    return '+';
    case 'repayment': return '↩';
    default:          return '';
  }
};

export const getPaymentAppIcon = (app) => {
  const icons = {
    phonepe: '📲', gpay: '📲', paytm: '👜', bank: '🏦',
    cash: '💵', netbanking: '🏦', card: '💳', upi: '📲', other: '📦'
  };
  return icons[app] || '📦';
};

export const getPaymentAppName = (app) => {
  const names = {
    phonepe: 'PhonePe', gpay: 'Google Pay', paytm: 'Paytm',
    bank: 'Bank', cash: 'Cash', netbanking: 'Net Banking',
    card: 'Card', upi: 'UPI', other: 'Other'
  };
  return names[app] || 'Other';
};

export const getBudgetStatus = (spent, allocated) => {
  if (!allocated) return { pct: 0, status: 'safe', cls: 'progress-safe' };
  const pct = (spent / allocated) * 100;
  if (pct >= 100) return { pct: Math.min(pct, 100), status: 'over',    cls: 'progress-over'    };
  if (pct >= 80)  return { pct, status: 'danger',  cls: 'progress-danger'  };
  if (pct >= 50)  return { pct, status: 'warning', cls: 'progress-warning' };
  return           { pct, status: 'safe',    cls: 'progress-safe'    };
};

export const autoCategory = (description = '') => {
  const desc = description.toLowerCase();
  if (/zomato|swiggy|food|lunch|dinner|breakfast|restaurant|dhaba|chaayos|haldiram/.test(desc)) return 'c1';
  if (/dmart|bigbasket|grocery|supermarket|fresh|reliance|grocery/.test(desc)) return 'c2';
  if (/amazon|flipkart|myntra|meesho|shop|mall|clothes|kurta|shoes/.test(desc)) return 'c3';
  if (/electricity|bill|msedcl|gas|cylinder|water|lpg|utility/.test(desc)) return 'c4';
  if (/recharge|airtel|jio|vodafone|bsnl|mobile|data/.test(desc)) return 'c5';
  if (/rent|house|room|flat|accommodation/.test(desc)) return 'c6';
  if (/emi|loan|sbi|hdfc|icici|instalment/.test(desc)) return 'c7';
  if (/uber|ola|rapido|auto|cab|petrol|hpcl|travel|bus|train|flight/.test(desc)) return 'c8';
  if (/apollo|pharmacy|hospital|doctor|medicine|lab|test|fortis|health/.test(desc)) return 'c9';
  if (/school|college|fees|tuition|course|education|book|notebook/.test(desc)) return 'c10';
  if (/netflix|spotify|amazon prime|hotstar|youtube|subscription|entertain|movie|cinema/.test(desc)) return 'c11';
  if (/salary|credit|income|wages|stipend/.test(desc)) return 'c13';
  if (/sip|mutual fund|investment|groww|zerodha|stocks/.test(desc)) return 'c15';
  return 'c16';
};

export const parseCSVTransactions = (csvText) => {
  // Parse PhonePe-style CSV exports
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const txns = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
    if (values.length < 3) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

    const description = row['description'] || row['narration'] || row['remarks'] || row['particulars'] || '';
    const amount = parseFloat((row['amount'] || row['debit'] || row['credit'] || '0').replace(/[₹,\s]/g, '')) || 0;
    const dateRaw = row['date'] || row['transaction date'] || row['value date'] || '';
    const type = (row['type'] || '').toLowerCase().includes('credit') ? 'income' : 'expense';
    const upiRef = row['upi ref'] || row['reference no'] || row['transaction id'] || '';
    const date = dateRaw ? new Date(dateRaw).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    if (amount > 0 && description) {
      txns.push({
        id: `import_${Date.now()}_${i}`,
        type,
        amount,
        description,
        date,
        time: '00:00',
        upiRef,
        category: autoCategory(description),
        paymentApp: 'phonepe',
        accountId: 'a1',
        source: 'auto',
        status: 'completed',
        tags: 'personal',
      });
    }
  }
  return txns;
};
