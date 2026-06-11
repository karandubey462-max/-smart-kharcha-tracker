import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  TRANSACTIONS, LEND_BORROW, BUDGETS, SAVINGS_GOALS, RECURRING,
  REMINDERS, ACCOUNTS, CATEGORIES, DEMO_USER,
  getMonthTransactions, getTodayTransactions, calculateSpending, calculateIncome
} from '../data/demoData';

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Theme ──────────────────────────────────────────────
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },

      // ─── Auth ────────────────────────────────────────────────
      user: null,
      isAuthenticated: false,
      isPinVerified: false,
      onboardingDone: false,

      login: (userData) => set({ user: userData || DEMO_USER, isAuthenticated: true, isPinVerified: true }),
      logout: () => set({ user: null, isAuthenticated: false, isPinVerified: false }),
      verifyPin: () => set({ isPinVerified: true }),
      completeOnboarding: () => set({ onboardingDone: true }),

      // ─── Transactions ─────────────────────────────────────────
      transactions: TRANSACTIONS,

      addTransaction: (txn) => set((s) => ({
        transactions: [{ ...txn, id: `t${Date.now()}`, createdAt: new Date().toISOString(), source: 'manual' }, ...s.transactions]
      })),

      updateTransaction: (id, updates) => set((s) => ({
        transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      deleteTransaction: (id) => set((s) => ({
        transactions: s.transactions.filter(t => t.id !== id)
      })),

      importTransactions: (txns) => set((s) => {
        const existingRefs = new Set(s.transactions.map(t => t.upiRef).filter(Boolean));
        const newTxns = txns.filter(t => !t.upiRef || !existingRefs.has(t.upiRef));
        return { transactions: [...newTxns, ...s.transactions] };
      }),

      // Computed getters
      getMonthlyTransactions: () => getMonthTransactions(get().transactions),
      getTodayTransactions:   () => getTodayTransactions(get().transactions),
      getMonthlySpending:     () => calculateSpending(getMonthTransactions(get().transactions)),
      getMonthlyIncome:       () => calculateIncome(getMonthTransactions(get().transactions)),
      getTodaySpending:       () => calculateSpending(getTodayTransactions(get().transactions)),

      // ─── Lend / Borrow ────────────────────────────────────────
      lendBorrow: LEND_BORROW,

      addLendBorrow: (record) => set((s) => ({
        lendBorrow: [{ ...record, id: `lb${Date.now()}`, repayments: [], amountRecovered: 0, balanceRemaining: record.amount }, ...s.lendBorrow]
      })),

      updateLendBorrow: (id, updates) => set((s) => ({
        lendBorrow: s.lendBorrow.map(lb => lb.id === id ? { ...lb, ...updates } : lb)
      })),

      addRepayment: (lbId, repayment) => set((s) => ({
        lendBorrow: s.lendBorrow.map(lb => {
          if (lb.id !== lbId) return lb;
          const newRepay = { ...repayment, id: `r${Date.now()}` };
          const totalRecovered = (lb.amountRecovered || 0) + repayment.amount;
          const balance = lb.amount - totalRecovered;
          return {
            ...lb,
            repayments: [...(lb.repayments || []), newRepay],
            amountRecovered: totalRecovered,
            balanceRemaining: balance,
            status: balance <= 0 ? 'paid' : 'partial',
          };
        })
      })),

      // ─── Budget ───────────────────────────────────────────────
      budget: BUDGETS,
      setBudget: (budget) => set({ budget }),
      updateBudgetCategory: (categoryId, amount) => set((s) => ({
        budget: {
          ...s.budget,
          categories: s.budget.categories.map(c =>
            c.categoryId === categoryId ? { ...c, allocated: amount } : c
          )
        }
      })),

      // ─── Savings Goals ────────────────────────────────────────
      savingsGoals: SAVINGS_GOALS,
      addSavingsGoal: (goal) => set((s) => ({ savingsGoals: [...s.savingsGoals, { ...goal, id: `sg${Date.now()}` }] })),
      updateSavingsGoal: (id, updates) => set((s) => ({
        savingsGoals: s.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g)
      })),
      deleteGoal: (id) => set((s) => ({ savingsGoals: s.savingsGoals.filter(g => g.id !== id) })),

      // ─── Recurring ────────────────────────────────────────────
      recurring: RECURRING,
      addRecurring: (item) => set((s) => ({ recurring: [...s.recurring, { ...item, id: `rec${Date.now()}` }] })),
      toggleRecurring: (id) => set((s) => ({
        recurring: s.recurring.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
      })),

      // ─── Reminders ────────────────────────────────────────────
      reminders: REMINDERS,
      markReminderRead: (id) => set((s) => ({
        reminders: s.reminders.map(r => r.id === id ? { ...r, isRead: true } : r)
      })),
      dismissReminder: (id) => set((s) => ({ reminders: s.reminders.filter(r => r.id !== id) })),
      get unreadCount() { return get().reminders.filter(r => !r.isRead).length; },

      // ─── Accounts ─────────────────────────────────────────────
      accounts: ACCOUNTS,
      addAccount: (acc) => set((s) => ({ accounts: [...s.accounts, { ...acc, id: `a${Date.now()}` }] })),

      // ─── Categories ───────────────────────────────────────────
      categories: CATEGORIES,
      addCategory: (cat) => set((s) => ({ categories: [...s.categories, { ...cat, id: `c${Date.now()}`, isCustom: true }] })),

      // ─── UI State ─────────────────────────────────────────────
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      toasts: [],
      showToast: (message, type = 'success') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3200);
      },
    }),
    {
      name: 'kharcha-store',
      partialize: (s) => ({
        theme: s.theme,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        onboardingDone: s.onboardingDone,
        transactions: s.transactions,
        lendBorrow: s.lendBorrow,
        budget: s.budget,
        savingsGoals: s.savingsGoals,
        recurring: s.recurring,
        reminders: s.reminders,
        accounts: s.accounts,
        categories: s.categories,
      }),
    }
  )
);

export default useStore;
