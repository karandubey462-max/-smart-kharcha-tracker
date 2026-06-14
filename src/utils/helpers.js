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
  // Parse PhonePe-style CSV exports with better error handling
  console.log('🔍 Parsing CSV, length:', csvText.length);
  
  const lines = csvText.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    console.error('❌ CSV has less than 2 lines');
    return [];
  }
  
  // Check if this is a PhonePe formatted statement (multi-line format)
  if (csvText.includes('Transaction Statement for') || csvText.includes('Transaction Details')) {
    console.log('📱 Detected PhonePe formatted statement - using specialized parser');
    return parsePhonePeStatement(csvText);
  }
  
  // Parse headers - handle quoted fields
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(v => v.replace(/^["']|["']$/g, ''));
  };
  
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  console.log('📋 Headers found:', headers);
  
  const txns = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) {
      console.warn(`⚠️ Line ${i} has less than 3 values, skipping`);
      continue;
    }
    
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    
    console.log(`📝 Row ${i}:`, row);

    // Flexible field matching
    const description = row['description'] || row['narration'] || row['remarks'] || 
                       row['particulars'] || row['transaction details'] || row['details'] || '';
    
    // Try to parse amount - handle different formats
    let amountStr = row['amount'] || row['debit'] || row['credit'] || 
                   row['transaction amount'] || row['amt'] || '0';
    const amount = parseFloat(amountStr.replace(/[₹,\s]/g, '')) || 0;
    
    // Date parsing - try multiple formats
    const dateRaw = row['date'] || row['transaction date'] || row['value date'] || 
                   row['txn date'] || row['transaction time'] || '';
    
    // Parse date more flexibly
    let date = new Date().toISOString().split('T')[0];
    if (dateRaw) {
      try {
        // Handle formats like "2026-06-10", "10/06/2026", "10-Jun-2026"
        const parsed = new Date(dateRaw);
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('⚠️ Could not parse date:', dateRaw);
      }
    }
    
    // Determine transaction type
    let type = 'expense';
    const typeField = (row['type'] || row['transaction type'] || '').toLowerCase();
    const debit = row['debit'] || '';
    const credit = row['credit'] || '';
    
    if (typeField.includes('credit') || (credit && !debit)) {
      type = 'income';
    } else if (typeField.includes('debit') || (debit && !credit)) {
      type = 'expense';
    }
    
    const upiRef = row['upi ref'] || row['reference no'] || row['transaction id'] || 
                  row['upi reference no'] || row['ref no'] || '';

    if (amount > 0 && description) {
      const txn = {
        id: `import_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
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
      };
      console.log('✅ Parsed transaction:', txn);
      txns.push(txn);
    } else {
      console.warn(`⚠️ Skipping row ${i}: amount=${amount}, description="${description}"`);
    }
  }
  
  console.log(`✅ Successfully parsed ${txns.length} transactions`);
  return txns;
};

// Specialized parser for PhonePe formatted statements (multi-line format)
export const parsePhonePeStatement = (text) => {
  console.log('📱 Parsing PhonePe formatted statement...');
  const lines = text.split('\n').map(l => l.trim().replace(/^"|"$/g, ''));
  const txns = [];
  
  let currentTxn = {};
  let lineIndex = 0;
  
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    
    // Skip header lines, page numbers, disclaimers
    if (!line || 
        line.includes('Transaction Statement for') ||
        line.includes('This is a system generated') ||
        line.includes('This is an automatically generated') ||
        line.includes('Disclaimer') ||
        line.includes('Page ') ||
        line.includes('Date            Transaction Details') ||
        line.startsWith('of any errors') ||
        line.startsWith('the recipient') ||
        line.startsWith('terms-conditions') ||
        line.startsWith('etc. through SMS')) {
      lineIndex++;
      continue;
    }
    
    // Check if this line starts a transaction (contains date pattern)
    // Format: "Jun 13, 2026    Paid to Docgenie    DEBIT    ₹529.5"
    const dateMatch = line.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/);
    
    if (dateMatch) {
      // Parse the main transaction line
      const [month, day, year] = [dateMatch[1], dateMatch[2], dateMatch[3]];
      const monthNum = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      }[month];
      const date = `${year}-${monthNum}-${day.padStart(2, '0')}`;
      
      // Extract description, type, and amount from the same line
      const restOfLine = line.substring(dateMatch[0].length).trim();
      
      // Split by multiple spaces to get fields
      const parts = restOfLine.split(/\s{2,}/).filter(p => p.trim());
      
      let description = '';
      let type = 'expense';
      let amount = 0;
      
      if (parts.length >= 2) {
        // Last part is amount
        const amountStr = parts[parts.length - 1];
        amount = parseFloat(amountStr.replace(/[₹,\s]/g, '')) || 0;
        
        // Second to last is type (DEBIT/CREDIT)
        const typeStr = parts[parts.length - 2];
        if (typeStr && typeStr.toUpperCase().includes('CREDIT')) {
          type = 'income';
        }
        
        // Everything else is description
        description = parts.slice(0, parts.length - 2).join(' ');
      }
      
      // Look ahead for time and transaction ID
      let time = '00:00';
      let upiRef = '';
      
      if (lineIndex + 1 < lines.length) {
        const nextLine = lines[lineIndex + 1];
        const timeMatch = nextLine.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        if (timeMatch) {
          time = timeMatch[1];
        }
        const txnIdMatch = nextLine.match(/Transaction ID\s+([A-Z0-9]+)/);
        if (txnIdMatch) {
          upiRef = txnIdMatch[1];
        }
      }
      
      // Check if description continues on next line (for multi-line descriptions)
      if (lineIndex + 2 < lines.length && !lines[lineIndex + 2].includes('Transaction ID') && 
          !lines[lineIndex + 2].includes('UTR No') && !lines[lineIndex + 2].includes('Paid by') &&
          !lines[lineIndex + 2].includes('Credited to') && lines[lineIndex + 2].length > 5 &&
          !lines[lineIndex + 2].match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)) {
        description += ' ' + lines[lineIndex + 2];
      }
      
      if (amount > 0 && description) {
        const txn = {
          id: `import_${Date.now()}_${txns.length}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          amount,
          description: description.trim(),
          date,
          time,
          upiRef,
          category: autoCategory(description),
          paymentApp: 'phonepe',
          accountId: 'a1',
          source: 'auto',
          status: 'completed',
          tags: 'personal',
        };
        console.log('✅ Parsed PhonePe transaction:', txn);
        txns.push(txn);
      }
    }
    
    lineIndex++;
  }
  
  console.log(`✅ Successfully parsed ${txns.length} PhonePe transactions`);
  return txns;
};
