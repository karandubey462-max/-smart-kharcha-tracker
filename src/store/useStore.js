import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
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
      token: null,
      isDemo: false,
      isLoading: false,
      isAuthenticated: false,
      isPinVerified: false,
      onboardingDone: false,

      login: (userData, token) => {
        if (token) {
          // Cloud Login
          set({
            user: userData,
            token,
            isDemo: false,
            isAuthenticated: true,
            isPinVerified: !userData.pinEnabled, // must enter pin if enabled on backend
          });
        } else {
          // Demo Mode
          set({
            user: DEMO_USER,
            token: null,
            isDemo: true,
            isAuthenticated: true,
            isPinVerified: true,
            transactions: TRANSACTIONS,
            lendBorrow: LEND_BORROW,
            budget: BUDGETS,
            savingsGoals: SAVINGS_GOALS,
            recurring: RECURRING,
            reminders: REMINDERS,
          });
        }
      },
      
      logout: () => set({
        user: null,
        token: null,
        isDemo: false,
        isAuthenticated: false,
        isPinVerified: false,
        transactions: [],
        lendBorrow: [],
        budget: { totalBudget: 25000, month: new Date().toISOString().slice(0, 7), categories: [] },
        savingsGoals: [],
        recurring: [],
        reminders: [],
      }),
      
      verifyPin: () => set({ isPinVerified: true }),
      completeOnboarding: () => set({ onboardingDone: true }),

      // ─── Fetch All User Data (Cloud Only) ──────────────────────
      fetchUserData: async () => {
        if (get().isDemo || !get().token) return;
        set({ isLoading: true });
        try {
          const [txnsRes, lbRes, budgetRes, goalsRes, recRes, remindersRes] = await Promise.all([
            api.get('/transactions'),
            api.get('/lend-borrow'),
            api.get('/budget'),
            api.get('/goals'),
            api.get('/recurring'),
            api.get('/reminders'),
          ]);
          set({
            transactions: txnsRes.data.data || [],
            lendBorrow: lbRes.data.data || [],
            budget: budgetRes.data.data || { totalBudget: 25000, month: new Date().toISOString().slice(0, 7), categories: [] },
            savingsGoals: goalsRes.data.data || [],
            recurring: recRes.data.data || [],
            reminders: remindersRes.data.data || [],
          });
        } catch (err) {
          console.error('Failed to sync user data from server', err);
          get().showToast('Could not sync with cloud. Offline mode.', 'error');
        } finally {
          set({ isLoading: false });
        }
      },

      // ─── Transactions ─────────────────────────────────────────
      transactions: [],

      addTransaction: async (txn) => {
        if (get().isDemo) {
          set((s) => ({
            transactions: [{ ...txn, id: `t${Date.now()}`, createdAt: new Date().toISOString(), source: 'manual' }, ...s.transactions]
          }));
        } else {
          try {
            const res = await api.post('/transactions', txn);
            set((s) => ({ transactions: [res.data.data, ...s.transactions] }));
          } catch (err) {
            get().showToast('Failed to add transaction', 'error');
          }
        }
      },

      updateTransaction: async (id, updates) => {
        if (get().isDemo) {
          set((s) => ({
            transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
          }));
        } else {
          try {
            const res = await api.put(`/transactions/${id}`, updates);
            set((s) => ({
              transactions: s.transactions.map(t => (t._id === id || t.id === id) ? res.data.data : t)
            }));
          } catch (err) {
            get().showToast('Failed to update transaction', 'error');
          }
        }
      },

      deleteTransaction: async (id) => {
        if (get().isDemo) {
          set((s) => ({
            transactions: s.transactions.filter(t => t.id !== id)
          }));
        } else {
          try {
            await api.delete(`/transactions/${id}`);
            set((s) => ({
              transactions: s.transactions.filter(t => t._id !== id && t.id !== id)
            }));
          } catch (err) {
            get().showToast('Failed to delete transaction', 'error');
          }
        }
      },

      importTransactions: async (txns) => {
        if (get().isDemo) {
          set((s) => {
            const existingRefs = new Set(s.transactions.map(t => t.upiRef).filter(Boolean));
            const newTxns = txns.filter(t => !t.upiRef || !existingRefs.has(t.upiRef));
            return { transactions: [...newTxns, ...s.transactions] };
          });
        } else {
          try {
            const res = await api.post('/transactions/bulk', { transactions: txns });
            const inserted = res.data.data;
            set((s) => ({ transactions: [...inserted, ...s.transactions] }));
            get().showToast(`Imported ${res.data.inserted} transactions (${res.data.skipped} skipped)`);
          } catch (err) {
            get().showToast('Failed to import transactions', 'error');
          }
        }
      },

      // Computed getters
      getMonthlyTransactions: () => getMonthTransactions(get().transactions),
      getTodayTransactions:   () => getTodayTransactions(get().transactions),
      getMonthlySpending:     () => calculateSpending(getMonthTransactions(get().transactions)),
      getMonthlyIncome:       () => calculateIncome(getMonthTransactions(get().transactions)),
      getTodaySpending:       () => calculateSpending(getTodayTransactions(get().transactions)),

      // ─── Lend / Borrow ────────────────────────────────────────
      lendBorrow: [],

      addLendBorrow: async (record) => {
        if (get().isDemo) {
          set((s) => ({
            lendBorrow: [{ ...record, id: `lb${Date.now()}`, repayments: [], amountRecovered: 0, balanceRemaining: record.amount }, ...s.lendBorrow]
          }));
        } else {
          try {
            const res = await api.post('/lend-borrow', record);
            set((s) => ({ lendBorrow: [res.data.data, ...s.lendBorrow] }));
          } catch (err) {
            get().showToast('Failed to create lend/borrow record', 'error');
          }
        }
      },

      updateLendBorrow: async (id, updates) => {
        if (get().isDemo) {
          set((s) => ({
            lendBorrow: s.lendBorrow.map(lb => lb.id === id ? { ...lb, ...updates } : lb)
          }));
        } else {
          try {
            const res = await api.put(`/lend-borrow/${id}`, updates);
            set((s) => ({
              lendBorrow: s.lendBorrow.map(lb => (lb._id === id || lb.id === id) ? res.data.data : lb)
            }));
          } catch (err) {
            get().showToast('Failed to update record', 'error');
          }
        }
      },

      addRepayment: async (lbId, repayment) => {
        if (get().isDemo) {
          set((s) => ({
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
          }));
        } else {
          try {
            const res = await api.post(`/lend-borrow/${lbId}/repayment`, repayment);
            set((s) => ({
              lendBorrow: s.lendBorrow.map(lb => (lb._id === lbId || lb.id === lbId) ? res.data.data : lb)
            }));
          } catch (err) {
            get().showToast('Failed to add repayment', 'error');
          }
        }
      },

      // ─── Budget ───────────────────────────────────────────────
      budget: { totalBudget: 25000, month: new Date().toISOString().slice(0, 7), categories: [] },
      setBudget: async (budget) => {
        if (get().isDemo) {
          set({ budget });
        } else {
          try {
            const res = await api.put('/budget', budget);
            set({ budget: res.data.data });
          } catch (err) {
            get().showToast('Failed to update budget', 'error');
          }
        }
      },
      updateBudgetCategory: async (categoryId, amount) => {
        const currentBudget = get().budget;
        const updatedCategories = currentBudget.categories.map(c =>
          c.categoryId === categoryId ? { ...c, allocated: amount } : c
        );
        const updatedBudget = { ...currentBudget, categories: updatedCategories };
        
        if (get().isDemo) {
          set({ budget: updatedBudget });
        } else {
          try {
            const res = await api.put(`/budget?month=${currentBudget.month}`, updatedBudget);
            set({ budget: res.data.data });
          } catch (err) {
            get().showToast('Failed to update category budget', 'error');
          }
        }
      },

      // ─── Savings Goals ────────────────────────────────────────
      savingsGoals: [],
      addSavingsGoal: async (goal) => {
        if (get().isDemo) {
          set((s) => ({ savingsGoals: [...s.savingsGoals, { ...goal, id: `sg${Date.now()}` }] }));
        } else {
          try {
            const res = await api.post('/goals', goal);
            set((s) => ({ savingsGoals: [...s.savingsGoals, res.data.data] }));
          } catch (err) {
            get().showToast('Failed to add goal', 'error');
          }
        }
      },
      updateSavingsGoal: async (id, updates) => {
        if (get().isDemo) {
          set((s) => ({
            savingsGoals: s.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g)
          }));
        } else {
          try {
            const res = await api.put(`/goals/${id}`, updates);
            set((s) => ({
              savingsGoals: s.savingsGoals.map(g => (g._id === id || g.id === id) ? res.data.data : g)
            }));
          } catch (err) {
            get().showToast('Failed to update goal', 'error');
          }
        }
      },
      deleteGoal: async (id) => {
        if (get().isDemo) {
          set((s) => ({ savingsGoals: s.savingsGoals.filter(g => g.id !== id) }));
        } else {
          try {
            await api.delete(`/goals/${id}`);
            set((s) => ({ savingsGoals: s.savingsGoals.filter(g => g._id !== id && g.id !== id) }));
          } catch (err) {
            get().showToast('Failed to delete goal', 'error');
          }
        }
      },

      // ─── Recurring ────────────────────────────────────────────
      recurring: [],
      addRecurring: async (item) => {
        if (get().isDemo) {
          set((s) => ({ recurring: [...s.recurring, { ...item, id: `rec${Date.now()}` }] }));
        } else {
          try {
            const res = await api.post('/recurring', item);
            set((s) => ({ recurring: [...s.recurring, res.data.data] }));
          } catch (err) {
            get().showToast('Failed to add recurring item', 'error');
          }
        }
      },
      toggleRecurring: async (id) => {
        const item = get().recurring.find(r => r._id === id || r.id === id);
        if (!item) return;
        const nextVal = !item.isActive;

        if (get().isDemo) {
          set((s) => ({
            recurring: s.recurring.map(r => r.id === id ? { ...r, isActive: nextVal } : r)
          }));
        } else {
          try {
            const res = await api.put(`/recurring/${id}`, { isActive: nextVal });
            set((s) => ({
              recurring: s.recurring.map(r => (r._id === id || r.id === id) ? res.data.data : r)
            }));
          } catch (err) {
            get().showToast('Failed to toggle recurring item', 'error');
          }
        }
      },

      // ─── Reminders ────────────────────────────────────────────
      reminders: [],
      markReminderRead: async (id) => {
        if (get().isDemo) {
          set((s) => ({
            reminders: s.reminders.map(r => r.id === id ? { ...r, isRead: true } : r)
          }));
        } else {
          try {
            const res = await api.put(`/reminders/${id}`, { isRead: true });
            set((s) => ({
              reminders: s.reminders.map(r => (r._id === id || r.id === id) ? res.data.data : r)
            }));
          } catch (err) {
            get().showToast('Failed to mark reminder read', 'error');
          }
        }
      },
      dismissReminder: async (id) => {
        if (get().isDemo) {
          set((s) => ({ reminders: s.reminders.filter(r => r.id !== id) }));
        } else {
          try {
            await api.delete(`/reminders/${id}`);
            set((s) => ({ reminders: s.reminders.filter(r => r._id !== id && r.id !== id) }));
          } catch (err) {
            get().showToast('Failed to delete reminder', 'error');
          }
        }
      },
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
        token: s.token,
        isDemo: s.isDemo,
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
