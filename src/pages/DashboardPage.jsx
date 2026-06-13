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

  const statCards = [
    { label: 'Total Companies', value: stats?.total_companies || 0, icon: Building2, color: 'purple', change: '+12%', up: true },
    { label: 'Total Warehouses', value: stats?.total_warehouses || 0, icon: Warehouse, color: 'blue', change: '+5%', up: true },
    { label: 'Total Branches', value: stats?.total_branches || 0, icon: GitBranch, color: 'green', change: '+8%', up: true },
    { label: 'Total Franchises', value: stats?.total_franchises || 0, icon: Store, color: 'yellow', change: '+15%', up: true },
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'purple', change: '+3%', up: true },
    { label: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'blue', change: '+10%', up: true },
    { label: 'Inventory Value', value: `₹${(stats?.total_inventory_value || 0).toLocaleString()}`, icon: DollarSign, color: 'green', change: '+7%', up: true },
    { label: "Today's Sales", value: `₹${(stats?.today_sales || 0).toLocaleString()}`, icon: ShoppingCart, color: 'yellow', change: '+22%', up: true },
    { label: 'Monthly Sales', value: `₹${(stats?.monthly_sales || 0).toLocaleString()}`, icon: TrendingUp, color: 'purple', change: '+18%', up: true },
    { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: Clock, color: 'yellow', change: '-5%', up: false },
    { label: 'Low Stock', value: stats?.low_stock_products || 0, icon: AlertTriangle, color: 'red', change: '+2', up: false },
    { label: 'Out of Stock', value: stats?.out_of_stock_products || 0, icon: XCircle, color: 'red', change: '-1', up: true },
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

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Dashboard</div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your business overview.</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className={`stat-card ${card.color}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`stat-icon ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className={`stat-change ${card.up ? 'up' : 'down'}`}>
                {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-title">Sales Trend (30 Days)</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartSalesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => v.slice(5)} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', color: 'var(--text-primary)', fontSize: '13px', padding: '12px 16px', fontWeight: 600 }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(v) => [`₹${v.toLocaleString()}`, 'Sales']} 
                cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={3} fill="url(#salesGrad)" activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Branch Performance</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchPerf} barSize={32}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', color: 'var(--text-primary)', fontSize: '13px', padding: '12px 16px', fontWeight: 600 }}
                cursor={{ fill: 'var(--bg-card-hover)', opacity: 0.5 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} iconType="circle" />
              <Bar dataKey="sales" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Sales" />
              <Bar dataKey="profit" fill="#10B981" radius={[6, 6, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Inventory Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={inventoryDist} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                paddingAngle={5} dataKey="value" stroke="none" 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false} style={{ fontSize: '12px', fontWeight: 600, fill: 'var(--text-primary)' }}>
                {inventoryDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', color: 'var(--text-primary)', fontSize: '13px', padding: '12px 16px', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Recent Activities</div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {activities.length === 0 ? (
              <div className="empty-state"><p>No recent activities</p></div>
            ) : (
              activities.slice(0, 10).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.action} - {a.module}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.details}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{a.created_at?.slice(11, 16)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
