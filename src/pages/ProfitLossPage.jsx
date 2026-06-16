import { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfitLossPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await financeAPI.getPnl();
        setData(res.data);
      } catch {
        toast.error('Failed to load P&L');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-spinner" style={{ height: '50vh' }}><div className="spinner"></div></div>;
  if (!data) return null;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="breadcrumb">Home / Finance / P&L</div>
        <h1 className="page-title">Profit & Loss Statement</h1>
        <p className="page-subtitle">Your income vs expenses</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>₹{data.total_revenue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Expenses</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>₹{data.total_expense.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Net Profit</div>
          <div className="stat-value" style={{ color: data.net_profit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>₹{data.net_profit.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--success)' }}>Revenues</h3>
          <table className="table">
            <tbody>
              {data.revenues.map(r => (
                <tr key={r.code}>
                  <td>{r.name}</td>
                  <td align="right">₹{r.balance.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 600 }}>Total Revenue</td>
                <td align="right" style={{ fontWeight: 600 }}>₹{data.total_revenue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--danger)' }}>Expenses</h3>
          <table className="table">
            <tbody>
              {data.expenses.map(e => (
                <tr key={e.code}>
                  <td>{e.name}</td>
                  <td align="right">₹{e.balance.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 600 }}>Total Expenses</td>
                <td align="right" style={{ fontWeight: 600 }}>₹{data.total_expense.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
