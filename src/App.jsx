import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import CompaniesPage from './pages/CompaniesPage';
import BranchesPage from './pages/BranchesPage';
import FranchisesPage from './pages/FranchisesPage';
import WarehousesPage from './pages/WarehousesPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import VendorsPage from './pages/VendorsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner" style={{ height: '100vh' }}><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner" style={{ height: '100vh' }}><div className="spinner"></div></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="franchises" element={<FranchisesPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="categories" element={<PlaceholderPage pageKey="categories" />} />
        <Route path="inventory" element={<PlaceholderPage pageKey="inventory" />} />
        <Route path="sales" element={<PlaceholderPage pageKey="sales" />} />
        <Route path="purchases" element={<PlaceholderPage pageKey="purchases" />} />
        <Route path="finance" element={<PlaceholderPage pageKey="finance" />} />
        <Route path="reports" element={<PlaceholderPage pageKey="reports" />} />
        <Route path="gst" element={<PlaceholderPage pageKey="gst" />} />
        <Route path="notifications" element={<PlaceholderPage pageKey="notifications" />} />
        <Route path="settings" element={<PlaceholderPage pageKey="settings" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 },
          }} />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
