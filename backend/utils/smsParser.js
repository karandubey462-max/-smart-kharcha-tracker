// ============================================================
// SMS Parser for Indian UPI/PhonePe transactions on Backend
// Patterns sourced from real PhonePe, GPay, Paytm, SBI, HDFC SMS
// ============================================================

const SMS_PATTERNS = [
  // PhonePe
  {
    app: 'phonepe',
    regex: /Rs\.?(\d+(?:\.\d{2})?)\s+(debited|credited)\s+(?:from|to)\s+A\/c\s+[Xx*\d]+\s+on\s+([\d\-]+)\.?\s+(?:UPI:|Info:)\s*([^.]+)\.?\s+(?:UPI\s+Ref(?:erence)?:?\s*)([A-Z0-9]+)/i,
    map: (m) => ({
      amount: parseFloat(m[1]),
      type: m[2].toLowerCase() === 'debited' ? 'expense' : 'income',
      date: parseIndianDate(m[3]),
      description: m[4].trim(),
      upiRef: m[5].trim(),
      paymentApp: 'phonepe',
    }),
  },
  // PhonePe (alternate format)
  {
    app: 'phonepe',
    regex: /(?:INR|Rs\.?)\s*(\d+(?:\.\d{2})?)\s+(?:sent to|received from)\s+([^.]+)\s+(?:via\s+PhonePe|on PhonePe).*?(?:Ref[:\s]+)?([A-Z0-9]{10,})/i,
    map: (m) => ({
      amount: parseFloat(m[1]),
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      description: m[2].trim(),
      upiRef: m[3]?.trim() || '',
      paymentApp: 'phonepe',
    }),
  },
  // Google Pay
  {
    app: 'gpay',
    regex: /(?:You paid|You received)\s+Rs\.?\s*(\d+(?:\.\d{2})?)\s+(?:to|from)\s+([^.]+)\..*?(?:UPI transaction ID|Ref)\.?\s*([0-9]+)/i,
    map: (m) => ({
      amount: parseFloat(m[1]),
      type: m[0].includes('paid') ? 'expense' : 'income',
      date: new Date().toISOString().split('T')[0],
      description: m[2].trim(),
      upiRef: m[3].trim(),
      paymentApp: 'gpay',
    }),
  },
  // Paytm
  {
    app: 'paytm',
    regex: /(?:Rs\.|INR)\s*(\d+(?:\.\d{2})?)\s+(?:debited|credited|paid|sent)\s+(?:from|to|for)\s+([^.]+)\..*?(?:Txn\s+ID|Order\s+ID|Ref):?\s*([A-Z0-9]+)/i,
    map: (m) => ({
      amount: parseFloat(m[1]),
      type: m[0].toLowerCase().includes('credit') || m[0].toLowerCase().includes('received') ? 'income' : 'expense',
      date: new Date().toISOString().split('T')[0],
      description: m[2].trim(),
      upiRef: m[3].trim(),
      paymentApp: 'paytm',
    }),
  },
  // HDFC Bank UPI
  {
    app: 'bank',
    regex: /(?:Rs|INR)\.?\s*(\d+(?:\.\d{2})?)\s+(?:debited|credited)\s+(?:fr|from|to)\s+A\/[Cc][^.]+\.?\s+Info:\s*([^.]+)\.?\s+(?:Ref|UTR)(?:\s+No)?:?\s*([0-9]+)/i,
    map: (m) => ({
      amount: parseFloat(m[1]),
      type: m[0].toLowerCase().includes('debit') ? 'expense' : 'income',
      date: new Date().toISOString().split('T')[0],
      description: m[2].trim(),
      upiRef: m[3].trim(),
      paymentApp: 'bank',
    }),
  },
  // SBI UPI
  {
    app: 'bank',
    regex: /(?:Dear\s+\w+,?\s+)?(?:Rs\.?|INR)\s*(\d+(?:\.\d{2})?)\s+(?:is\s+)?(?:debited|credited)\s+in\s+(?:your\s+)?(?:A\/c|account)[^.]+\.?\s+([^.]+)\.\s+Ref\s*(?:No\.?|:)\s*([0-9]+)/i,
    map: (m) => ({
      amount: parseFloat(m[1]),
      type: m[0].toLowerCase().includes('debit') ? 'expense' : 'income',
      date: new Date().toISOString().split('T')[0],
      description: m[2].trim(),
      upiRef: m[3].trim(),
      paymentApp: 'bank',
    }),
  },
  // Generic UPI fallback
  {
    app: 'other',
    regex: /(?:Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s+(?:debited|credited|paid|received|sent)/i,
    map: (m) => ({
      amount: parseFloat(m[1].replace(/,/g, '')),
      type: m[0].toLowerCase().includes('credit') || m[0].toLowerCase().includes('receiv') ? 'income' : 'expense',
      date: new Date().toISOString().split('T')[0],
      description: 'UPI Transaction',
      upiRef: '',
      paymentApp: 'other',
    }),
  },
];

function parseIndianDate(str) {
  if (!str) return new Date().toISOString().split('T')[0];
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

function parseSMSText(smsText) {
  if (!smsText || typeof smsText !== 'string' || !smsText.trim()) return null;

  for (const pattern of SMS_PATTERNS) {
    const match = smsText.match(pattern.regex);
    if (match) {
      try {
        const base = pattern.map(match);
        return {
          ...base,
          source: 'sms',
          notes: `Auto-parsed from SMS webhook: "${smsText.slice(0, 60)}..."`,
        };
      } catch (err) {
        continue;
      }
    }
  }
  return null;
}

module.exports = { parseSMSText };
