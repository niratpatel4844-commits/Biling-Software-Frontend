import { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';

export default function TrialBalancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await financeAPI.getTrialBalance();
        setData(res.data);
      } catch {
        toast.error('Failed to load Trial Balance');
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
        <div className="breadcrumb">Home / Finance / Trial Balance</div>
        <h1 className="page-title">Trial Balance</h1>
        <p className="page-subtitle">Verify that total debits equal total credits</p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th>Type</th>
              <th align="right">Debit (₹)</th>
              <th align="right">Credit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map(acc => (
              <tr key={acc.account_id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{acc.account_code}</td>
                <td>{acc.account_name}</td>
                <td>
                  <span className={`badge ${acc.type === 'Asset' ? 'badge-primary' : acc.type === 'Liability' ? 'badge-danger' : acc.type === 'Revenue' ? 'badge-success' : acc.type === 'Expense' ? 'badge-warning' : 'badge-info'}`}>
                    {acc.type}
                  </span>
                </td>
                <td align="right">{acc.debit > 0 ? acc.debit.toFixed(2) : '-'}</td>
                <td align="right">{acc.credit > 0 ? acc.credit.toFixed(2) : '-'}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="3" align="right" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</td>
              <td align="right" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{data.total_debit.toFixed(2)}</td>
              <td align="right" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{data.total_credit.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        {Math.abs(data.total_debit - data.total_credit) < 0.01 ? (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
            ✅ Trial Balance is perfectly balanced!
          </div>
        ) : (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
            ❌ Trial Balance is out of balance by ₹{Math.abs(data.total_debit - data.total_credit).toFixed(2)}!
          </div>
        )}
      </div>
    </div>
  );
}
