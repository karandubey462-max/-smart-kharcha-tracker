# Smart Kharcha Tracker 💸

> **Personal Finance App for Indian Users** — Track every rupee, never forget who owes you, stay on budget.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:5174)
npm run dev

# Build for production
npm run build
```

**Demo Login**: Click "Try Demo Mode" on the login screen  
**Demo PIN**: `1234`

---

## 📱 App Features

### ✅ Core Modules
| Module | Description |
|--------|-------------|
| 🏠 **Home Dashboard** | Today's spend, monthly summary, charts, quick actions |
| 💸 **Expense Tracker** | Add/view expenses with auto-categorization |
| 📊 **Budget Planner** | Set total + category budgets with progress alerts |
| 🤝 **Lend & Borrow** | Track money lent/borrowed with repayment history |
| 📈 **Reports** | 4-tab analytics — daily, category, income vs expense, AI insights |
| 🎯 **Savings Goals** | Visual progress rings with contribution tracking |
| 🔄 **Recurring Expenses** | Auto-track rent, EMI, subscriptions |
| 📥 **Import Statement** | Upload PhonePe/bank CSV with smart parser |
| 🔔 **Reminders** | Smart alerts for dues, budget limits, unpaid lends |
| ⚙️ **Settings** | Dark/light mode, PIN lock, profile, export |

### 🤖 Smart Features
- **Auto-categorization** from transaction description (Swiggy→Food, D-Mart→Groceries, etc.)
- **Duplicate detection** during CSV import (via UPI Ref ID)
- **AI-style insights**: top category, projected month-end, weekday vs weekend spending
- **Month-over-month** comparison charts

### 📥 PhonePe Integration
> Direct PhonePe account API is not publicly available for personal transaction access.

The app provides practical alternatives:
1. **CSV Import** — Download statement from PhonePe app → Import here
2. **Smart Parser** — Auto-detects amount, date, type, and category from CSV
3. **Manual Entry** — Add any transaction manually with full detail
4. **Duplicate Prevention** — UPI Reference IDs prevent re-importing same transactions
5. All imported entries are clearly labeled **AUTO** vs manual entries labeled **manual**

---

## 🗂 Project Structure

```
src/
├── data/
│   └── demoData.js          # 30+ realistic Indian demo transactions
├── store/
│   └── useStore.js          # Zustand global state with localStorage persistence
├── utils/
│   ├── helpers.js           # formatCurrency, groupByDate, autoCategory, CSV parser
│   └── exportUtils.js       # PDF (jsPDF) and CSV (PapaParse) export
├── pages/
│   ├── Onboarding.jsx       # 3-slide animated intro
│   ├── Login.jsx            # Login/signup + demo mode
│   ├── PinLock.jsx          # 4-digit PIN security screen
│   ├── Home.jsx             # Full dashboard
│   ├── Transactions.jsx     # Searchable + filterable transaction list
│   ├── AddTransaction.jsx   # Add/edit transaction form
│   ├── TransactionDetail.jsx# Full transaction view
│   ├── LendBorrow.jsx       # Lending + borrowing tracker
│   ├── Budget.jsx           # Category budget planner
│   ├── Reports.jsx          # Charts + analytics (PDF/CSV export)
│   ├── ImportStatement.jsx  # 3-step CSV import wizard
│   ├── SavingsGoals.jsx     # Savings goals with ring charts
│   ├── Recurring.jsx        # Recurring expenses manager
│   ├── Reminders.jsx        # Smart notification center
│   ├── Settings.jsx         # App settings + theme toggle
│   └── Profile.jsx          # User profile + security
├── components/
│   ├── AppShell.jsx         # Layout wrapper + bottom nav
│   └── Toast.jsx            # Global toast notifications
├── index.css                # Full design system (tokens, dark/light, components)
└── App.css                  # App-level animations and polish
```

---

## 🎨 Design System

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--bg-primary` | `#0A0E1A` | `#F4F6FC` |
| `--accent-primary` | `#6C63FF` | `#6C63FF` |
| `--color-income` | `#10B981` | `#10B981` |
| `--color-expense` | `#F87171` | `#F87171` |
| `--color-lent` | `#FBBF24` | `#FBBF24` |
| `--color-borrow` | `#60A5FA` | `#60A5FA` |

Toggle theme in **Settings → Switch to Light/Dark Mode**

---

## 💾 Data Model

All data is stored in **localStorage** (via Zustand persist middleware).

### Transaction Object
```js
{
  id, type, amount, category, description,
  date, time, paymentApp, accountId,
  source: 'auto' | 'manual',
  tags: 'personal' | 'family' | 'business' | 'investment' | 'loan',
  upiRef, notes, personName, status
}
```

### Lend/Borrow Object
```js
{
  id, type: 'lent' | 'borrowed',
  personName, personPhone, amount, date, dueDate,
  status: 'unpaid' | 'partial' | 'paid',
  amountRecovered, balanceRemaining,
  repayments: [{ id, amount, date, notes }],
  reminderEnabled
}
```

---

## 📤 Export

- **CSV Export** — All transactions with category, type, amount, UPI ref
- **PDF Report** — Monthly summary + transaction table + lend/borrow summary

Access from **Reports → CSV / PDF buttons**

---

## 🔐 Security

- **PIN Lock**: 4-digit PIN (demo: `1234`) required on every app open
- **Biometric**: Framework ready (WebAuthn integration planned)
- **No server**: All data stored locally on device — nothing sent to any server
- **Encrypted persistence**: Via Zustand persist with localStorage

---

## 🏦 Supported Payment Apps

PhonePe, Google Pay, Paytm, Cash, Bank Transfer, Net Banking, Card, UPI

---

## 📊 Demo Data Included

- **30 transactions** spanning last 21 days (Swiggy, D-Mart, Rent, Netflix, Salary...)
- **5 lend/borrow records** (Rahul ₹3K pending, Priya ₹2.5K overdue, Mummy borrowed...)
- **4 savings goals** (Emergency Fund 38%, Goa trip 38%, iPhone 19%, Home 12%)
- **8 recurring items** (Rent ₹8K, Car EMI ₹2K, Netflix, Spotify, SIP...)
- **5 reminders** (2 unread: Rahul overdue, food budget at 82%)
- **Monthly budget**: ₹25,000 with per-category limits

---

## 🛣 Roadmap

### Phase 4 (Planned)
- [ ] Backend API (Node.js + PostgreSQL) for multi-device sync
- [ ] Real user accounts with JWT auth
- [ ] WhatsApp reminder integration
- [ ] SMS transaction parsing (Android)
- [ ] Hindi language support (i18n)
- [ ] Family shared budget mode
- [ ] Yearly tax report export

### Phase 5 (Future)
- [ ] Bank statement auto-import (Open Banking APIs)
- [ ] Investment portfolio tracking
- [ ] Bill payment calendar
- [ ] Voice input for quick expense add
- [ ] Widget for home screen balance display

---

## 💡 Monetization Ideas

| Tier | Price | Features |
|------|-------|---------|
| Free | ₹0 | Up to 100 transactions/month, basic reports |
| Pro | ₹99/month | Unlimited, PDF export, advanced analytics, backup |
| Family | ₹149/month | Up to 5 members shared budget |
| Lifetime | ₹499 | All pro features forever |

---

## 🤝 Contributing

Built with React + Vite + Zustand + Recharts + jsPDF.  
Designed for **Indian users** with INR currency, UPI payment modes, and Indian spending categories.

---

*Made with ❤️ for India* 🇮🇳
