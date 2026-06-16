import { useState, useEffect } from 'react';
import { Store, UserCheck, AlertOctagon } from 'lucide-react';
import { reportsAPI } from '../services/api';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';

export default function VendorReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await reportsAPI.getVendors();
        setData(res.data);
      } catch {
        toast.error('Failed to load vendor report');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-spinner" style={{ height: '50vh' }}><div className="spinner"></div></div>;
  if (!data) return null;

  const columns = [
    { key: 'name', label: 'Vendor Name' },
    { key: 'phone', label: 'Contact', render: (val) => val || '-' },
    { key: 'amount', label: 'Payable Amount', render: (val) => <span style={{ color: 'var(--danger)', fontWeight: 600 }}>₹{val.toFixed(2)}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="breadcrumb">Home / Reports / Vendors</div>
        <h1 className="page-title">Vendor Reports</h1>
        <p className="page-subtitle">Overview of your suppliers and payable amounts</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Total Vendors</div>
            <div className="stat-value" style={{ marginTop: '8px' }}>{data.summary.total_vendors}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
            <Store size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Active Vendors</div>
            <div className="stat-value" style={{ color: 'var(--success)', marginTop: '8px' }}>{data.summary.active_vendors}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--success)' }}>
            <UserCheck size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Total Payables</div>
            <div className="stat-value" style={{ color: 'var(--danger)', marginTop: '8px' }}>₹{data.summary.total_payable.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--danger)' }}>
            <AlertOctagon size={24} />
          </div>
        </div>
      </div>

      <DataTable 
        title="Outstanding Payables" 
        columns={columns} 
        data={data.outstanding} 
        pagination={false}
      />
    </div>
  );
}
