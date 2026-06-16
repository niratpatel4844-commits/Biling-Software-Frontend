import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  Building2, Warehouse, GitBranch, Store, Users, Package,
  DollarSign, ShoppingCart, TrendingUp, AlertTriangle, XCircle,
  Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#EC4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [activities, setActivities] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, a, p] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getSalesTrend(30),
          dashboardAPI.getRecentActivities(),
          dashboardAPI.getTopProducts(),
        ]);
        setStats(s.data);
        setSalesTrend(t.data);
        setActivities(a.data);
        setTopProducts(p.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  // Grouped stats for better layout
  const overviewStats = [
    { label: "Today's Sales", value: `₹${(stats?.today_sales || 0).toLocaleString()}`, icon: ShoppingCart, color: 'blue', change: '+22%', up: true },
    { label: 'Monthly Sales', value: `₹${(stats?.monthly_sales || 0).toLocaleString()}`, icon: TrendingUp, color: 'purple', change: '+18%', up: true },
    { label: 'Inventory Value', value: `₹${(stats?.total_inventory_value || 0).toLocaleString()}`, icon: DollarSign, color: 'green', change: '+7%', up: true },
    { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: Clock, color: 'yellow', change: '-5%', up: false },
  ];

  const inventoryStats = [
    { label: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'blue', change: '+10%', up: true },
    { label: 'Low Stock Alerts', value: stats?.low_stock_products || 0, icon: AlertTriangle, color: 'yellow', change: '+2', up: false },
    { label: 'Out of Stock', value: stats?.out_of_stock_products || 0, icon: XCircle, color: 'red', change: '-1', up: true },
  ];

  const orgStats = [
    { label: 'Companies', value: stats?.total_companies || 0, icon: Building2, color: 'purple' },
    { label: 'Branches', value: stats?.total_branches || 0, icon: GitBranch, color: 'green' },
    { label: 'Franchises', value: stats?.total_franchises || 0, icon: Store, color: 'yellow' },
    { label: 'Warehouses', value: stats?.total_warehouses || 0, icon: Warehouse, color: 'blue' },
    { label: 'System Users', value: stats?.total_users || 0, icon: Users, color: 'purple' },
  ];

  // Generate mock data for charts if no real data
  const chartSalesData = salesTrend.length > 0 ? salesTrend : Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    amount: Math.floor(Math.random() * 50000) + 10000,
  }));

  const branchPerf = [
    { name: 'Mumbai HQ', sales: 450000, profit: 85000 },
    { name: 'Delhi', sales: 380000, profit: 72000 },
    { name: 'Bangalore', sales: 320000, profit: 61000 },
    { name: 'Chennai', sales: 280000, profit: 53000 },
    { name: 'Kolkata', sales: 220000, profit: 42000 },
  ];

  const inventoryDist = [
    { name: 'Electronics', value: 35 },
    { name: 'Clothing', value: 25 },
    { name: 'Food', value: 20 },
    { name: 'Furniture', value: 12 },
    { name: 'Other', value: 8 },
  ];

  // Helper component for stat cards
  const StatCard = ({ card, index }) => (
    <div className={`stat-card ${card.color}`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className={`stat-icon ${card.color}`}>
        <card.icon size={24} />
      </div>
      <div className="stat-content">
        <div className="stat-label">{card.label}</div>
        <div className="stat-value">{card.value}</div>
        {card.change && (
          <div className={`stat-change ${card.up ? 'up' : 'down'}`}>
            {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {card.change}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Main Revenue Overview - 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        {overviewStats.map((card, i) => <StatCard key={`overview-${i}`} card={card} index={i} />)}
      </div>

      {/* Charts Section - 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        {/* Main Chart */}
        <div className="chart-card" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
          <div className="chart-card-title">Sales Trend (30 Days)</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => v.slice(5)} tickLine={false} axisLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}
                  formatter={(v) => [`₹${v.toLocaleString()}`, 'Sales']} 
                />
                <Area type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={3} fill="url(#salesGrad)" activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Performance */}
        <div className="chart-card" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
          <div className="chart-card-title">Branch Performance</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchPerf} barSize={32} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }} cursor={{ fill: 'var(--bg-card-hover)', opacity: 0.5 }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} iconType="circle" />
                <Bar dataKey="sales" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Sales" />
                <Bar dataKey="profit" fill="#10B981" radius={[6, 6, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Information Grid - 3 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        
        {/* Inventory Alerts Section */}
        <div className="card" style={{ padding: '28px', height: '100%' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>Inventory Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {inventoryStats.map((card, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className={`stat-icon ${card.color}`} style={{ width: '42px', height: '42px' }}>
                    <card.icon size={20} />
                  </div>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '1rem' }}>{card.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{card.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Org Structure Grid */}
        <div className="card" style={{ padding: '28px', height: '100%' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>Organization</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            {orgStats.map((card, i) => (
              <div key={i} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-input)' }}>
                <card.icon size={24} style={{ color: `var(--${card.color})`, marginBottom: '12px' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{card.value}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="chart-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <div className="chart-card-title">Recent Activities</div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {activities.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px' }}>
                <Clock size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                <p style={{ fontSize: '1rem' }}>No recent activities</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activities.slice(0, 10).map((a, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    gap: 16, 
                    padding: '16px 0', 
                    borderBottom: i < 9 ? '1px solid var(--border)' : 'none',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ 
                      width: 10, height: 10, borderRadius: '50%', 
                      background: COLORS[i % COLORS.length], 
                      flexShrink: 0,
                      marginTop: '6px'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {a.action}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {a.details}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {a.module} • {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
