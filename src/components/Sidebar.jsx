import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, Building2, GitBranch, Store,
  Warehouse, Package, Layers, BarChart3, ShoppingCart, Receipt,
  UserCircle, Truck, Banknote, FileText, Calculator, Bell,
  ClipboardList, Settings, ChevronLeft, ChevronRight, LogOut,
  Tag, Ruler, Boxes
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { section: 'Main', icon: LayoutDashboard, items: [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Management', icon: Users, items: [
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/roles', icon: Shield, label: 'Roles & Permissions' },
    { path: '/companies', icon: Building2, label: 'Companies' },
    { path: '/branches', icon: GitBranch, label: 'Branches' },
    { path: '/franchises', icon: Store, label: 'Franchises' },
    { path: '/warehouses', icon: Warehouse, label: 'Warehouses' },
  ]},
  { section: 'Catalog', icon: Package, items: [
    { path: '/categories', icon: Layers, label: 'Categories' },
    { path: '/brands', icon: Tag, label: 'Brands' },
    { path: '/units', icon: Ruler, label: 'Units' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/variants', icon: Boxes, label: 'Product Variants' },
    { path: '/inventory', icon: BarChart3, label: 'Inventory Master' },
  ]},
  { section: 'Sales', icon: ShoppingCart, items: [
    { path: '/sales/quotations', icon: FileText, label: 'Quotations' },
    { path: '/sales/orders', icon: ShoppingCart, label: 'Sales Orders' },
    { path: '/sales/invoices', icon: Receipt, label: 'Invoices' },
    { path: '/sales/returns', icon: Receipt, label: 'Returns' },
    { path: '/sales/credit-notes', icon: FileText, label: 'Credit Notes' },
  ]},
  { section: 'Purchases', icon: Receipt, items: [
    { path: '/purchases/requests', icon: FileText, label: 'Purchase Requests' },
    { path: '/purchases/orders', icon: ShoppingCart, label: 'Purchase Orders' },
    { path: '/purchases/receipts', icon: Package, label: 'Goods Receipt' },
    { path: '/purchases/bills', icon: Receipt, label: 'Purchase Bills' },
    { path: '/purchases/returns', icon: Receipt, label: 'Vendor Returns' },
    { path: '/purchases/payments', icon: Banknote, label: 'Vendor Payments' },
  ]},
  { section: 'CRM & Vendors', icon: Users, items: [
    { path: '/customers', icon: UserCircle, label: 'Customers' },
    { path: '/vendors', icon: Truck, label: 'Vendors' },
  ]},
  { section: 'Stock Movements', icon: Truck, items: [
    { path: '/inventory/transfer', icon: Truck, label: 'Stock Transfer' },
    { path: '/inventory/adjustment', icon: Settings, label: 'Stock Adjustment' },
    { path: '/inventory/damaged', icon: Package, label: 'Damaged Stock' },
    { path: '/inventory/reserved', icon: Layers, label: 'Reserved Stock' },
    { path: '/inventory/history', icon: ClipboardList, label: 'Stock History' },
  ]},
  { section: 'Reports', icon: FileText, items: [
    { path: '/reports/sales', icon: FileText, label: 'Sales Reports' },
    { path: '/reports/purchases', icon: FileText, label: 'Purchase Reports' },
    { path: '/reports/customers', icon: FileText, label: 'Customer Reports' },
    { path: '/reports/vendors', icon: FileText, label: 'Vendor Reports' },
    { path: '/reports/gst', icon: Calculator, label: 'GST Reports' },
    { path: '/reports/inventory', icon: BarChart3, label: 'Inventory Reports' },
  ]},
  { section: 'Finance', icon: Banknote, items: [
    { path: '/finance', icon: Banknote, label: 'Accounting' },
  ]},
  { section: 'System', icon: Settings, items: [
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    Management: true,
    Catalog: true
  });

  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </div>
      <div className="sidebar-header">
        <div className="sidebar-logo">E</div>
        <span className="sidebar-title">ERP Admin</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((section) => {
          if (section.section === 'Main') {
            return section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <item.icon size={20} />
                <span className="nav-item-text">{item.label}</span>
              </NavLink>
            ));
          }

          const isOpen = openSections[section.section];
          const hasActiveItem = section.items.some(item => location.pathname.startsWith(item.path) && item.path !== '/');

          return (
            <div key={section.section} style={{ marginBottom: 4 }}>
              <div 
                className={`nav-item ${hasActiveItem && !isOpen ? 'active' : ''}`} 
                style={{ cursor: 'pointer', justifyContent: 'space-between', background: isOpen ? 'rgba(0,0,0,0.02)' : '' }} 
                onClick={() => toggleSection(section.section)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <section.icon size={20} />
                  <span className="nav-item-text" style={{ fontWeight: 500 }}>{section.section}</span>
                </div>
                {!collapsed && (
                  <ChevronRight size={16} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                )}
              </div>
              {isOpen && !collapsed && (
                <div style={{ paddingLeft: '28px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      style={{ padding: '8px 12px', minHeight: '36px' }}
                      end={item.path === '/'}
                    >
                      <item.icon size={16} />
                      <span className="nav-item-text" style={{ fontSize: '0.85rem' }}>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="nav-section-title" style={{ marginTop: 16 }}>Account</div>
        <div className="nav-item" onClick={logout} style={{ cursor: 'pointer' }}>
          <LogOut size={20} />
          <span className="nav-item-text">Logout</span>
        </div>
      </nav>
    </aside>
  );
}
