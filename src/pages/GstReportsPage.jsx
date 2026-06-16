import { useState, useEffect } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { reportsAPI } from '../services/api';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';

export default function GstReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await reportsAPI.getGst({ days });
        setData(res.data);
      } catch {
        toast.error('Failed to load GST report');
      }
      setLoading(false);
    };
    fetchData();
  }, [days]);

  if (loading) return <div className="loading-spinner" style={{ height: '50vh' }}><div className="spinner"></div></div>;
  if (!data) return null;

  const columns = [
    { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'invoice', label: 'Invoice No.' },
    { key: 'amount', label: 'Total Amount', render: (val) => `₹${val.toFixed(2)}` },
    { key: 'tax', label: 'Tax Collected', render: (val) => <span style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{val.toFixed(2)}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Reports / GST</div>
          <h1 className="page-title">GST Reports</h1>
          <p className="page-subtitle">Summary of tax collected and paid</p>
        </div>
        <div>
          <select className="form-select" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last 1 Year</option>
          </select>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">GST Collected (Sales)</div>
            <div className="stat-value" style={{ color: 'var(--success)', marginTop: '8px' }}>₹{data.summary.gst_collected.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--success)' }}>
            <ArrowUpRight size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">GST Paid (Purchases)</div>
            <div className="stat-value" style={{ color: 'var(--danger)', marginTop: '8px' }}>₹{data.summary.gst_paid.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--danger)' }}>
            <ArrowDownRight size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Net Tax Liability</div>
            <div className="stat-value" style={{ color: 'var(--primary)', marginTop: '8px' }}>₹{data.summary.net_liability.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
            <Landmark size={24} />
          </div>
        </div>
      </div>

      <DataTable 
        title="Recent Taxable Sales" 
        columns={columns} 
        data={data.recent_sales} 
        pagination={false}
      />
    </div>
  );
}
