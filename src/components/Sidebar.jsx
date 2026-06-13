import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, Building2, GitBranch, Store,
  Warehouse, Package, Layers, BarChart3, ShoppingCart, Receipt,
  UserCircle, Truck, Banknote, FileText, Calculator, Bell,
  ClipboardList, Settings, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { section: 'Main', items: [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Management', items: [
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/roles', icon: Shield, label: 'Roles & Permissions' },
    { path: '/companies', icon: Building2, label: 'Companies' },
    { path: '/branches', icon: GitBranch, label: 'Branches' },
    { path: '/franchises', icon: Store, label: 'Franchises' },
    { path: '/warehouses', icon: Warehouse, label: 'Warehouses' },
  ]},
  { section: 'Catalog', items: [
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/categories', icon: Layers, label: 'Categories' },
    { path: '/inventory', icon: BarChart3, label: 'Inventory' },
  ]},
  { section: 'Operations', items: [
    { path: '/sales', icon: ShoppingCart, label: 'Sales' },
    { path: '/purchases', icon: Receipt, label: 'Purchases' },
    { path: '/customers', icon: UserCircle, label: 'Customers' },
    { path: '/vendors', icon: Truck, label: 'Vendors' },
  ]},
  { section: 'Finance', items: [
    { path: '/finance', icon: Banknote, label: 'Accounting' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/gst', icon: Calculator, label: 'GST' },
  ]},
  { section: 'System', items: [
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useAuth();
  const location = useLocation();

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
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <item.icon size={20} />
                <span className="nav-item-text">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
        <div className="nav-section-title">Account</div>
        <div className="nav-item" onClick={logout} style={{ cursor: 'pointer' }}>
          <LogOut size={20} />
          <span className="nav-item-text">Logout</span>
        </div>
      </nav>
    </aside>
  );
}
