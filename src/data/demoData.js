// ============================================================
// SMART KHARCHA TRACKER — DEMO DATA (Indian realistic dataset)
// ============================================================

export const DEMO_USER = {
  id: 'u1',
  name: 'Karan Sharma',
  email: 'karan@example.com',
  phone: '9876543210',
  avatar: null,
  currency: 'INR',
  language: 'en',
  monthlyBudget: 25000,
  pinEnabled: true,
};

export const CATEGORIES = [
  { id: 'c1',  name: 'Food & Dining',   icon: '🍛', color: '#F97316', type: 'expense' },
  { id: 'c2',  name: 'Groceries',       icon: '🛒', color: '#10B981', type: 'expense' },
  { id: 'c3',  name: 'Shopping',        icon: '🛍️', color: '#8B5CF6', type: 'expense' },
  { id: 'c4',  name: 'Bills & Utility', icon: '⚡', color: '#F59E0B', type: 'expense' },
  { id: 'c5',  name: 'Recharge',        icon: '📱', color: '#06B6D4', type: 'expense' },
  { id: 'c6',  name: 'Rent',            icon: '🏠', color: '#EF4444', type: 'expense' },
  { id: 'c7',  name: 'EMI',             icon: '🏦', color: '#EC4899', type: 'expense' },
  { id: 'c8',  name: 'Travel',          icon: '🚗', color: '#14B8A6', type: 'expense' },
  { id: 'c9',  name: 'Health',          icon: '💊', color: '#22C55E', type: 'expense' },
  { id: 'c10', name: 'Education',       icon: '📚', color: '#3B82F6', type: 'expense' },
  { id: 'c11', name: 'Entertainment',   icon: '🎬', color: '#A855F7', type: 'expense' },
  { id: 'c12', name: 'Transfer',        icon: '↗️', color: '#6B7280', type: 'expense' },
  { id: 'c13', name: 'Salary',          icon: '💰', color: '#10B981', type: 'income'  },
  { id: 'c14', name: 'Freelance',       icon: '💻', color: '#6C63FF', type: 'income'  },
  { id: 'c15', name: 'Investment',      icon: '📈', color: '#F59E0B', type: 'income'  },
  { id: 'c16', name: 'Other',           icon: '📦', color: '#9CA3AF', type: 'expense' },
];

export const ACCOUNTS = [
  { id: 'a1', name: 'PhonePe UPI',  type: 'upi',    provider: 'phonepe', balance: 12450,  color: '#5C2D91', icon: '📲' },
  { id: 'a2', name: 'SBI Bank',     type: 'bank',   provider: 'bank',    balance: 54200,  color: '#2563EB', icon: '🏦' },
  { id: 'a3', name: 'Cash',         type: 'cash',   provider: 'cash',    balance: 3500,   color: '#10B981', icon: '💵' },
  { id: 'a4', name: 'Google Pay',   type: 'upi',    provider: 'gpay',    balance: 8900,   color: '#4285F4', icon: '📲' },
  { id: 'a5', name: 'Paytm Wallet', type: 'wallet', provider: 'paytm',   balance: 1200,   color: '#002970', icon: '👜' },
];

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };

export const TRANSACTIONS = [
  // Today
  { id: 't1',  type: 'expense', amount: 320,   category: 'c1',  description: 'Lunch at Haldiram\'s',      date: daysAgo(0), time: '13:15', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2023060001' },
  { id: 't2',  type: 'expense', amount: 50,    category: 'c8',  description: 'Ola Auto to office',        date: daysAgo(0), time: '09:05', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2023060002' },
  { id: 't3',  type: 'expense', amount: 199,   category: 'c11', description: 'Netflix subscription',      date: daysAgo(0), time: '08:00', paymentApp: 'gpay',    accountId: 'a4', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'G2023060001' },

  // Yesterday
  { id: 't4',  type: 'expense', amount: 2840,  category: 'c2',  description: 'D-Mart groceries',          date: daysAgo(1), time: '18:30', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'family',   upiRef: 'P2023050001' },
  { id: 't5',  type: 'expense', amount: 450,   category: 'c1',  description: 'Dinner at Punjabi Dhaba',   date: daysAgo(1), time: '20:45', paymentApp: 'cash',    accountId: 'a3', source: 'manual', status: 'completed', tags: 'personal' },
  { id: 't6',  type: 'expense', amount: 299,   category: 'c5',  description: 'Airtel mobile recharge',    date: daysAgo(1), time: '11:00', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2023050002' },

  // 2 days ago
  { id: 't7',  type: 'expense', amount: 8000,  category: 'c6',  description: 'House rent - June',         date: daysAgo(2), time: '10:00', paymentApp: 'bank',    accountId: 'a2', source: 'manual', status: 'completed', tags: 'family',   isRecurring: true },
  { id: 't8',  type: 'expense', amount: 1250,  category: 'c3',  description: 'Myntra kurta purchase',     date: daysAgo(2), time: '15:20', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2023040001' },
  { id: 't9',  type: 'income',  amount: 55000, category: 'c13', description: 'June salary credited',      date: daysAgo(2), time: '09:00', paymentApp: 'bank',    accountId: 'a2', source: 'auto',   status: 'completed', tags: 'personal' },

  // 3 days ago
  { id: 't10', type: 'expense', amount: 680,   category: 'c9',  description: 'Apollo pharmacy',           date: daysAgo(3), time: '17:10', paymentApp: 'gpay',    accountId: 'a4', source: 'auto',   status: 'completed', tags: 'family',   upiRef: 'G2023030001' },
  { id: 't11', type: 'expense', amount: 350,   category: 'c1',  description: 'Swiggy food delivery',      date: daysAgo(3), time: '13:30', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2023030001' },
  { id: 't12', type: 'expense', amount: 2000,  category: 'c7',  description: 'SBI car loan EMI',          date: daysAgo(3), time: '09:30', paymentApp: 'bank',    accountId: 'a2', source: 'auto',   status: 'completed', tags: 'personal', isRecurring: true },

  // 4 days ago
  { id: 't13', type: 'expense', amount: 500,   category: 'c8',  description: 'Uber cab to airport',       date: daysAgo(4), time: '06:00', paymentApp: 'gpay',    accountId: 'a4', source: 'auto',   status: 'completed', tags: 'business', upiRef: 'G2023020001' },
  { id: 't14', type: 'expense', amount: 189,   category: 'c11', description: 'Amazon Prime renewal',      date: daysAgo(4), time: '14:00', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2023020001' },
  { id: 't15', type: 'income',  amount: 8000,  category: 'c14', description: 'Freelance logo design',     date: daysAgo(4), time: '16:00', paymentApp: 'bank',    accountId: 'a2', source: 'manual', status: 'completed', tags: 'business' },

  // 5 days ago
  { id: 't16', type: 'expense', amount: 3200,  category: 'c2',  description: 'Reliance Fresh weekly shop', date: daysAgo(5), time: '11:00', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'family',   upiRef: 'P2023010001' },
  { id: 't17', type: 'expense', amount: 250,   category: 'c1',  description: 'Tea & snacks Chaayos',      date: daysAgo(5), time: '17:30', paymentApp: 'cash',    accountId: 'a3', source: 'manual', status: 'completed', tags: 'personal' },
  { id: 't18', type: 'expense', amount: 799,   category: 'c4',  description: 'Electricity bill MSEDCL',   date: daysAgo(5), time: '10:20', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'family',   upiRef: 'P2022310001', isRecurring: true },

  // 6 days ago
  { id: 't19', type: 'expense', amount: 1800,  category: 'c10', description: 'School fees June term',     date: daysAgo(6), time: '09:00', paymentApp: 'bank',    accountId: 'a2', source: 'manual', status: 'completed', tags: 'family',   isRecurring: true },
  { id: 't20', type: 'expense', amount: 430,   category: 'c8',  description: 'Petrol HPCL Bhandup',       date: daysAgo(6), time: '08:00', paymentApp: 'gpay',    accountId: 'a4', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'G2022300001' },
  { id: 't21', type: 'expense', amount: 2000,  category: 'c15', description: 'SIP - Parag Parikh Fund',   date: daysAgo(6), time: '09:00', paymentApp: 'bank',    accountId: 'a2', source: 'auto',   status: 'completed', tags: 'investment', isRecurring: true },

  // 7 days ago
  { id: 't22', type: 'expense', amount: 550,   category: 'c1',  description: 'Birthday dinner Gajalee',   date: daysAgo(7), time: '20:00', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2022290001' },
  { id: 't23', type: 'expense', amount: 120,   category: 'c5',  description: 'Jio data add-on pack',      date: daysAgo(7), time: '12:00', paymentApp: 'paytm',   accountId: 'a5', source: 'auto',   status: 'completed', tags: 'personal' },

  // Older this month
  { id: 't24', type: 'expense', amount: 4500,  category: 'c3',  description: 'Amazon shoes + clothes',    date: daysAgo(10), time: '14:00', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2022260001' },
  { id: 't25', type: 'expense', amount: 1100,  category: 'c9',  description: 'Fortis lab tests',          date: daysAgo(12), time: '10:00', paymentApp: 'gpay',    accountId: 'a4', source: 'auto',   status: 'completed', tags: 'family',   upiRef: 'G2022240001' },
  { id: 't26', type: 'expense', amount: 650,   category: 'c8',  description: 'Rapido & Ola week commute', date: daysAgo(14), time: '09:00', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'P2022220001' },
  { id: 't27', type: 'expense', amount: 299,   category: 'c11', description: 'Spotify Premium',           date: daysAgo(15), time: '08:00', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'personal', isRecurring: true },
  { id: 't28', type: 'expense', amount: 1500,  category: 'c4',  description: 'Gas cylinder LPG',          date: daysAgo(17), time: '11:00', paymentApp: 'bank',    accountId: 'a2', source: 'manual', status: 'completed', tags: 'family' },
  { id: 't29', type: 'expense', amount: 380,   category: 'c1',  description: 'Zomato weekend order',      date: daysAgo(18), time: '19:30', paymentApp: 'gpay',    accountId: 'a4', source: 'auto',   status: 'completed', tags: 'personal', upiRef: 'G2022180001' },
  { id: 't30', type: 'expense', amount: 2200,  category: 'c2',  description: 'BigBasket monthly stock',   date: daysAgo(20), time: '17:00', paymentApp: 'phonepe', accountId: 'a1', source: 'auto',   status: 'completed', tags: 'family',   upiRef: 'P2022160001' },
];

export const LEND_BORROW = [
  {
    id: 'lb1',
    type: 'lent',
    personName: 'Rahul Verma',
    personPhone: '9123456780',
    amount: 5000,
    date: daysAgo(15),
    dueDate: daysAgo(-10),
    notes: 'Medical emergency help',
    status: 'partial',
    amountRecovered: 2000,
    balanceRemaining: 3000,
    reminderEnabled: true,
    repayments: [
      { id: 'r1', amount: 2000, date: daysAgo(5), notes: 'Partial returned via UPI' }
    ]
  },
  {
    id: 'lb2',
    type: 'lent',
    personName: 'Priya Kulkarni',
    personPhone: '9234567890',
    amount: 2500,
    date: daysAgo(20),
    dueDate: daysAgo(5),
    notes: 'Helped with train ticket booking',
    status: 'unpaid',
    amountRecovered: 0,
    balanceRemaining: 2500,
    reminderEnabled: true,
    repayments: []
  },
  {
    id: 'lb3',
    type: 'lent',
    personName: 'Amit Joshi',
    personPhone: '9345678901',
    amount: 1000,
    date: daysAgo(30),
    dueDate: daysAgo(-5),
    notes: 'Office lunch split',
    status: 'paid',
    amountRecovered: 1000,
    balanceRemaining: 0,
    reminderEnabled: false,
    repayments: [
      { id: 'r2', amount: 1000, date: daysAgo(3), notes: 'Returned in full via PhonePe' }
    ]
  },
  {
    id: 'lb4',
    type: 'borrowed',
    personName: 'Mummy',
    personPhone: '9456789012',
    amount: 10000,
    date: daysAgo(45),
    dueDate: daysAgo(-15),
    notes: 'Borrowed for bike repair',
    status: 'partial',
    amountRecovered: 4000,
    balanceRemaining: 6000,
    reminderEnabled: false,
    repayments: [
      { id: 'r3', amount: 4000, date: daysAgo(10), notes: 'Returned ₹4000 from salary' }
    ]
  },
  {
    id: 'lb5',
    type: 'borrowed',
    personName: 'Suresh Bhaiya',
    personPhone: '9567890123',
    amount: 5000,
    date: daysAgo(8),
    dueDate: daysAgo(-20),
    notes: 'Urgent cash need - weekend',
    status: 'unpaid',
    amountRecovered: 0,
    balanceRemaining: 5000,
    reminderEnabled: true,
    repayments: []
  },
];

export const BUDGETS = {
  totalBudget: 25000,
  month: new Date().toISOString().slice(0, 7),
  categories: [
    { categoryId: 'c1',  allocated: 4000,  color: '#F97316' },
    { categoryId: 'c2',  allocated: 5000,  color: '#10B981' },
    { categoryId: 'c3',  allocated: 2000,  color: '#8B5CF6' },
    { categoryId: 'c4',  allocated: 2000,  color: '#F59E0B' },
    { categoryId: 'c5',  allocated: 500,   color: '#06B6D4' },
    { categoryId: 'c6',  allocated: 8000,  color: '#EF4444' },
    { categoryId: 'c8',  allocated: 1500,  color: '#14B8A6' },
    { categoryId: 'c9',  allocated: 1500,  color: '#22C55E' },
    { categoryId: 'c11', allocated: 1000,  color: '#A855F7' },
  ],
};

export const SAVINGS_GOALS = [
  { id: 'sg1', name: 'Emergency Fund', targetAmount: 100000, currentAmount: 38000, deadline: '2026-12-31', icon: '🛡️', color: '#10B981' },
  { id: 'sg2', name: 'Trip to Goa',    targetAmount: 25000,  currentAmount: 9500,  deadline: '2026-10-01', icon: '🏖️', color: '#3B82F6' },
  { id: 'sg3', name: 'New iPhone',     targetAmount: 80000,  currentAmount: 15000, deadline: '2027-03-01', icon: '📱', color: '#8B5CF6' },
  { id: 'sg4', name: 'Home Down Pay',  targetAmount: 500000, currentAmount: 62000, deadline: '2028-01-01', icon: '🏠', color: '#F59E0B' },
];

export const RECURRING = [
  { id: 'rec1', name: 'House Rent',      amount: 8000,  categoryId: 'c6',  frequency: 'monthly', nextDue: daysAgo(-18), isActive: true,  autoAdd: true  },
  { id: 'rec2', name: 'Car Loan EMI',    amount: 2000,  categoryId: 'c7',  frequency: 'monthly', nextDue: daysAgo(-27), isActive: true,  autoAdd: true  },
  { id: 'rec3', name: 'Netflix',         amount: 199,   categoryId: 'c11', frequency: 'monthly', nextDue: daysAgo(-30), isActive: true,  autoAdd: false },
  { id: 'rec4', name: 'Spotify',         amount: 299,   categoryId: 'c11', frequency: 'monthly', nextDue: daysAgo(-15), isActive: true,  autoAdd: false },
  { id: 'rec5', name: 'SIP Investment',  amount: 2000,  categoryId: 'c15', frequency: 'monthly', nextDue: daysAgo(-24), isActive: true,  autoAdd: true  },
  { id: 'rec6', name: 'School Fees',     amount: 1800,  categoryId: 'c10', frequency: 'monthly', nextDue: daysAgo(-24), isActive: true,  autoAdd: false },
  { id: 'rec7', name: 'Electricity Bill',amount: 799,   categoryId: 'c4',  frequency: 'monthly', nextDue: daysAgo(-25), isActive: true,  autoAdd: false },
  { id: 'rec8', name: 'Airtel Recharge', amount: 299,   categoryId: 'c5',  frequency: 'monthly', nextDue: daysAgo(-29), isActive: true,  autoAdd: false },
];

export const REMINDERS = [
  { id: 'rem1', type: 'lend',    refId: 'lb1', title: 'Rahul hasn\'t returned ₹3,000', message: 'Due date was 10 days ago', dueDate: daysAgo(10), isRead: false },
  { id: 'rem2', type: 'lend',    refId: 'lb2', title: 'Priya owes you ₹2,500',         message: 'Overdue by 5 days. Send a reminder?', dueDate: daysAgo(5), isRead: false },
  { id: 'rem3', type: 'budget',  refId: null,  title: 'Food budget at 82%',            message: 'You\'ve spent ₹3,280 of ₹4,000 food budget', dueDate: daysAgo(0), isRead: false },
  { id: 'rem4', type: 'recurring', refId: 'rec1', title: 'Rent due in 3 days',         message: 'House rent ₹8,000 due on 15th June', dueDate: daysAgo(-3), isRead: true },
  { id: 'rem5', type: 'budget',  refId: null,  title: 'Monthly budget at 68%',        message: 'Spent ₹17,022 of ₹25,000 budget', dueDate: daysAgo(0), isRead: true },
];

// Computed helpers
export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id);
}

export function getAccountById(id) {
  return ACCOUNTS.find(a => a.id === id);
}

export function getMonthTransactions(transactions = TRANSACTIONS) {
  const now = new Date();
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

export function getTodayTransactions(transactions = TRANSACTIONS) {
  const today = fmt(new Date());
  return transactions.filter(t => t.date === today);
}

export function calculateSpending(transactions) {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateIncome(transactions) {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getCategorySpending(transactions) {
  const spending = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    spending[t.category] = (spending[t.category] || 0) + t.amount;
  });
  return spending;
}

export function getDailySpending(transactions, days = 7) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = fmt(d);
    const dayTxns = transactions.filter(t => t.date === dateStr && t.type === 'expense');
    const total = dayTxns.reduce((sum, t) => sum + t.amount, 0);
    result.push({
      date: dateStr,
      label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      amount: total,
    });
  }
  return result;
}
