import { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function BalanceSheetPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await financeAPI.getBalanceSheet();
        setData(res.data);
      } catch {
        toast.error('Failed to load Balance Sheet');
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
        <div className="breadcrumb">Home / Finance / Balance Sheet</div>
        <h1 className="page-title">Balance Sheet</h1>
        <p className="page-subtitle">A snapshot of your business's financial position</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Assets Column */}
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Assets</h3>
            <table className="table">
              <tbody>
                {data.assets.map(a => (
                  <tr key={a.code}>
                    <td>{a.name}</td>
                    <td align="right">₹{a.balance.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontWeight: 600 }}>Total Assets</td>
                  <td align="right" style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{data.total_assets.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Liabilities & Equity Column */}
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--danger)' }}>Liabilities</h3>
            <table className="table">
              <tbody>
                {data.liabilities.map(l => (
                  <tr key={l.code}>
                    <td>{l.name}</td>
                    <td align="right">₹{l.balance.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontWeight: 600 }}>Total Liabilities</td>
                  <td align="right" style={{ fontWeight: 600 }}>₹{data.total_liabilities.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--info)' }}>Equity</h3>
            <table className="table">
              <tbody>
                {data.equity.filter(e => e.name !== 'Retained Earnings').map(e => (
                  <tr key={e.code}>
                    <td>{e.name}</td>
                    <td align="right">₹{e.balance.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td>Current Period Net Profit</td>
                  <td align="right">₹{data.net_profit.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Total Equity</td>
                  <td align="right" style={{ fontWeight: 600 }}>₹{data.total_equity.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="card" style={{ padding: '24px', marginTop: '24px', backgroundColor: 'var(--bg-secondary)' }}>
            <table className="table" style={{ margin: 0 }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total Liabilities & Equity</td>
                  <td align="right" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                    ₹{(data.total_liabilities + data.total_equity).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
