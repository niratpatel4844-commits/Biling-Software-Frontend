import { BarChart3, ShoppingCart, Receipt, Layers, Banknote, FileText, Calculator, Bell, Settings as SettingsIcon } from 'lucide-react';

const pageConfig = {
  inventory: { icon: BarChart3, title: 'Inventory Management', subtitle: 'Track stock across branches, warehouses, and franchises', breadcrumb: 'Home / Catalog / Inventory', features: ['Live Inventory', 'Stock Transfer', 'Stock Adjustment', 'Damaged Stock', 'Returned Stock', 'Reserved Stock'] },
  sales: { icon: ShoppingCart, title: 'Sales Management', subtitle: 'Manage invoices, GST billing, returns, and refunds', breadcrumb: 'Home / Operations / Sales', features: ['Create Invoice', 'GST Billing', 'Returns & Refunds', 'Credit Notes', 'Debit Notes', 'PDF/Print/Email'] },
  purchases: { icon: Receipt, title: 'Purchase Management', subtitle: 'Manage purchase orders and vendor payments', breadcrumb: 'Home / Operations / Purchases', features: ['Create PO', 'Approve PO', 'Receive Goods', 'Vendor Payments', 'Purchase Reports'] },
  categories: { icon: Layers, title: 'Category Management', subtitle: 'Organize products into hierarchical categories', breadcrumb: 'Home / Catalog / Categories', features: ['Main Category', 'Sub Category', 'Child Category', 'Category Tree'] },
  finance: { icon: Banknote, title: 'Finance & Accounting', subtitle: 'Complete accounting suite', breadcrumb: 'Home / Finance / Accounting', features: ['Cash Book', 'Bank Book', 'Journal', 'Ledger', 'Trial Balance', 'P&L', 'Balance Sheet'] },
  reports: { icon: FileText, title: 'Reports', subtitle: 'Comprehensive business reports with export', breadcrumb: 'Home / Finance / Reports', features: ['Sales Reports', 'Purchase Reports', 'Inventory Reports', 'GST Reports', 'Profit Reports', 'Export: Excel/CSV/PDF'] },
  gst: { icon: Calculator, title: 'GST Module', subtitle: 'GST calculation, filing, and compliance', breadcrumb: 'Home / Finance / GST', features: ['GST Calculation', 'GST Summary', 'Filing Reports', 'GST Invoice', 'GST Returns'] },
  notifications: { icon: Bell, title: 'Notifications', subtitle: 'Multi-channel notification center', breadcrumb: 'Home / System / Notifications', features: ['Email', 'SMS', 'WhatsApp', 'In-App', 'Low Stock Alerts', 'System Alerts'] },
  settings: { icon: SettingsIcon, title: 'Settings', subtitle: 'System configuration and preferences', breadcrumb: 'Home / System / Settings', features: ['Company Settings', 'Billing Settings', 'Invoice Settings', 'GST Settings', 'Email Settings', 'Theme Settings'] },
};

export default function PlaceholderPage({ pageKey, title, subtitle }) {
  const config = pageConfig[pageKey] || { 
    icon: BarChart3, 
    title: title || pageKey.replace(/_/g, ' '), 
    subtitle: subtitle || 'This module will be implemented soon.', 
    breadcrumb: `Home / ${title || pageKey}`,
    features: [] 
  };
  const Icon = config.icon || BarChart3;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">{config.breadcrumb}</div>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-subtitle">{config.subtitle}</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Icon size={36} style={{ color: 'var(--accent)' }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{config.title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>{config.subtitle}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {config.features.map((f, i) => (
            <span key={i} className="badge-status badge-info" style={{ padding: '8px 16px', fontSize: 13 }}>{f}</span>
          ))}
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: 32, fontSize: 13 }}>
          🚀 This module is ready for implementation. Backend APIs are prepared.
        </p>
      </div>
    </div>
  );
}
