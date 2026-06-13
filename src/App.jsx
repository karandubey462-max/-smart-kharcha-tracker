import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import AppShell from './components/AppShell';
import Toast from './components/Toast';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import PinLock from './pages/PinLock';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import LendBorrow from './pages/LendBorrow';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ImportStatement from './pages/ImportStatement';
import SavingsGoals from './pages/SavingsGoals';
import Reminders from './pages/Reminders';
import TransactionDetail from './pages/TransactionDetail';
import Recurring from './pages/Recurring';
import Profile from './pages/Profile';
import SMSImport from './pages/SMSImport';

function ProtectedRoute({ children }) {
  const { hasHydrated, isAuthenticated, isPinVerified, onboardingDone, user } = useStore();
  if (!hasHydrated) return null;
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;
  if (!isAuthenticated)  return <Navigate to="/login" replace />;
  // Only require PIN if the user has explicitly set one up
  if (user?.pinEnabled && !isPinVerified) return <Navigate to="/pin" replace />;
  return children;
}

export default function App() {
  const { toasts } = useStore();

  return (
    <BrowserRouter>
      <Toast toasts={toasts} />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/pin"        element={<PinLock />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="transactions"        element={<Transactions />} />
          <Route path="transactions/:id"    element={<TransactionDetail />} />
          <Route path="add-transaction"     element={<AddTransaction />} />
          <Route path="lend-borrow"         element={<LendBorrow />} />
          <Route path="budget"              element={<Budget />} />
          <Route path="reports"             element={<Reports />} />
          <Route path="settings"            element={<Settings />} />
          <Route path="import"              element={<ImportStatement />} />
          <Route path="savings"             element={<SavingsGoals />} />
          <Route path="reminders"           element={<Reminders />} />
          <Route path="recurring"           element={<Recurring />} />
          <Route path="profile"             element={<Profile />} />
          <Route path="sms-import"          element={<SMSImport />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
