import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { purchasesAPI } from '../services/api';

export default function VendorReturnsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchasesAPI.list('vendor_return');
      setData(res.data || []);
    } catch (err) { toast.error('Failed to load returns'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'po_number', label: 'Return No' },
    { key: 'vendor_id', label: 'Vendor ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Total Value', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge-status ${val === 'completed' ? 'badge-active' : 'badge-inactive'}`} style={{ textTransform: 'capitalize' }}>{val || 'Pending'}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Purchases / Vendor Returns</div>
          <h1 className="page-title">Vendor Returns</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/purchases/create?type=return')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Return
        </button>
      </div>
      <DataTable 
        title="Vendor Returns" 
        columns={columns} 
        data={data} 
        loading={loading}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/purchases/view/${row.id}`)}>View</button>
          </div>
        )}
      />
    </div>
  );
}
