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
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import UnitsPage from './pages/UnitsPage';
import VariantsPage from './pages/VariantsPage';
import CustomersPage from './pages/CustomersPage';
import VendorsPage from './pages/VendorsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import InventoryPage from './pages/InventoryPage';
import PlaceholderPage from './pages/PlaceholderPage';
import SalesListPage from './pages/SalesListPage';
import AddSalePage from './pages/AddSalePage';
import PurchasesListPage from './pages/PurchasesListPage';
import AddPurchasePage from './pages/AddPurchasePage';
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
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="units" element={<UnitsPage />} />
        <Route path="variants" element={<VariantsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        
        {/* Sales Module */}
        <Route path="sales/quotations" element={<PlaceholderPage pageKey="sales_quotations" title="Quotations" />} />
        <Route path="sales/orders" element={<PlaceholderPage pageKey="sales_orders" title="Sales Orders" />} />
        <Route path="sales/invoices" element={<SalesListPage />} />
        <Route path="sales/create" element={<AddSalePage />} />
        <Route path="sales/returns" element={<PlaceholderPage pageKey="sales_returns" title="Sales Returns" />} />
        <Route path="sales/credit-notes" element={<PlaceholderPage pageKey="sales_credit_notes" title="Credit Notes" />} />

        {/* Purchases Module */}
        <Route path="purchases/requests" element={<PlaceholderPage pageKey="purchases_requests" title="Purchase Requests" />} />
        <Route path="purchases/orders" element={<PlaceholderPage pageKey="purchases_orders" title="Purchase Orders" />} />
        <Route path="purchases/receipts" element={<PlaceholderPage pageKey="purchases_receipts" title="Goods Receipt" />} />
        <Route path="purchases/bills" element={<PurchasesListPage />} />
        <Route path="purchases/create" element={<AddPurchasePage />} />
        <Route path="purchases/returns" element={<PlaceholderPage pageKey="purchases_returns" title="Vendor Returns" />} />
        <Route path="purchases/payments" element={<PlaceholderPage pageKey="purchases_payments" title="Vendor Payments" />} />

        {/* Stock Movements */}
        <Route path="inventory/transfer" element={<PlaceholderPage pageKey="inventory_transfer" title="Stock Transfer" />} />
        <Route path="inventory/adjustment" element={<PlaceholderPage pageKey="inventory_adjustment" title="Stock Adjustment" />} />
        <Route path="inventory/damaged" element={<PlaceholderPage pageKey="inventory_damaged" title="Damaged Stock" />} />
        <Route path="inventory/reserved" element={<PlaceholderPage pageKey="inventory_reserved" title="Reserved Stock" />} />
        <Route path="inventory/history" element={<PlaceholderPage pageKey="inventory_history" title="Stock History" />} />

        {/* Reports */}
        <Route path="reports/sales" element={<PlaceholderPage pageKey="reports_sales" title="Sales Reports" />} />
        <Route path="reports/purchases" element={<PlaceholderPage pageKey="reports_purchases" title="Purchase Reports" />} />
        <Route path="reports/customers" element={<PlaceholderPage pageKey="reports_customers" title="Customer Reports" />} />
        <Route path="reports/vendors" element={<PlaceholderPage pageKey="reports_vendors" title="Vendor Reports" />} />
        <Route path="reports/gst" element={<PlaceholderPage pageKey="reports_gst" title="GST Reports" />} />
        <Route path="reports/inventory" element={<PlaceholderPage pageKey="reports_inventory" title="Inventory Reports" />} />

        <Route path="finance" element={<PlaceholderPage pageKey="finance" title="Accounting" />} />
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
