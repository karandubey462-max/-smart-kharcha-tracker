// ============================================================
// SMS / Notification Parser for Indian UPI/PhonePe transactions
// Patterns sourced from real PhonePe, GPay, Paytm, SBI, HDFC SMS
// ============================================================

// Master regex patterns for different banks/apps
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
  // Formats: 11-06-26, 11/06/2026, 11-Jun-26
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

export function parseSMSText(smsText) {
  if (!smsText?.trim()) return null;

  for (const pattern of SMS_PATTERNS) {
    const match = smsText.match(pattern.regex);
    if (match) {
      try {
        const base = pattern.map(match);
        return {
          ...base,
          source: 'sms',
          id: `sms_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
          status: 'completed',
          tags: 'personal',
          time: new Date().toTimeString().slice(0, 5),
          notes: `Auto-imported from SMS: "${smsText.slice(0, 60)}..."`,
        };
      } catch {
        continue;
      }
    }
  }
  return null;
}

export function parseMultipleSMS(textBlock) {
  // Split by common SMS delimiters or blank lines
  const messages = textBlock
    .split(/\n{2,}|---+|\*{3,}/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const results = [];
  for (const msg of messages) {
    const parsed = parseSMSText(msg);
    if (parsed) results.push(parsed);
  }
  return results;
}

// Sample SMS strings for demo/testing
export const SAMPLE_SMS_MESSAGES = [
  `Rs.380.00 debited from A/c XXXX1234 on 11-06-26. UPI: Swiggy Food Delivery. UPI Ref: P202606110001. Available Bal: Rs.12,070.`,
  `Rs.55000.00 credited to A/c XXXX1234 on 11-06-26. UPI: Salary June 2026. UPI Ref: P202606110002. Available Bal: Rs.67,070.`,
  `Rs.299.00 debited from A/c XXXX1234 on 10-06-26. UPI: Airtel Mobile Recharge. UPI Ref: P202606100003. Available Bal: Rs.11,771.`,
  `Rs.1240.00 debited from A/c XXXX1234 on 10-06-26. UPI: D-Mart Grocery. UPI Ref: P202606100004. Available Bal: Rs.10,531.`,
  `Rs.250.00 debited from A/c XXXX1234 on 09-06-26. UPI: Ola Cab Booking. UPI Ref: P202606090005. Available Bal: Rs.10,281.`,
];
