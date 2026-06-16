import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, CreditCard, Wallet } from 'lucide-react';
import { reportsAPI } from '../services/api';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';

export default function SalesReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await reportsAPI.getSales({ days });
        setData(res.data);
      } catch {
        toast.error('Failed to load sales report');
      }
      setLoading(false);
    };
    fetchData();
  }, [days]);

  if (loading) return <div className="loading-spinner" style={{ height: '50vh' }}><div className="spinner"></div></div>;
  if (!data) return null;

  const topProductsColumns = [
    { key: 'name', label: 'Product' },
    { key: 'quantity', label: 'Qty Sold', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'revenue', label: 'Revenue Generated', render: (val) => `₹${val.toFixed(2)}` },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Reports / Sales</div>
          <h1 className="page-title">Sales Reports</h1>
          <p className="page-subtitle">Analyze your revenue and top performing products</p>
        </div>
        <div>
          <select className="form-select" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last 1 Year</option>
          </select>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value" style={{ color: 'var(--primary)', marginTop: '8px' }}>₹{data.summary.total_revenue.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Total Orders</div>
            <div className="stat-value" style={{ marginTop: '8px' }}>{data.summary.total_orders}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
            <ShoppingCart size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Avg Order Value</div>
            <div className="stat-value" style={{ marginTop: '8px' }}>₹{data.summary.avg_order_value.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
            <CreditCard size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Total Tax Collected</div>
            <div className="stat-value" style={{ color: 'var(--warning)', marginTop: '8px' }}>₹{data.summary.total_tax.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--warning)' }}>
            <Wallet size={24} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: 600 }}>Revenue Trend</h3>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']} 
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 8, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable 
        title="Top Selling Products" 
        columns={topProductsColumns} 
        data={data.top_products} 
        pagination={false}
      />
    </div>
  );
}
