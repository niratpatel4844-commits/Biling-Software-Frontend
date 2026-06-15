import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Plus, CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesAPI } from '../services/api';

export default function SalesReturnsListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesAPI.list('return');
      setData(res.data || []);
    } catch (err) {
      toast.error('Failed to load sales returns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this return? This will restock inventory and reduce the customer\'s balance.')) return;
    try {
      await salesAPI.approveReturn(id);
      toast.success('Return approved successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve return');
    }
  };

  const columns = [
    { key: 'invoice_number', label: 'Return No.' },
    { key: 'customer_id', label: 'Customer ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Return Amount', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val) => {
      let colorClass = val === 'approved' ? 'badge-active' : 'badge-warning';
      return <span className={`badge-status ${colorClass}`} style={{ textTransform: 'capitalize' }}>{val || 'Pending'}</span>;
    }},
    { key: 'sale_date', label: 'Date', render: (val) => new Date(val || Date.now()).toLocaleDateString() },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Operations / Sales / Returns</div>
          <h1 className="page-title">Sales Returns</h1>
          <p className="page-subtitle">Manage customer returns and approvals</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/sales/create?type=return')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Return
        </button>
      </div>

      <DataTable 
        title="Sales Returns" 
        columns={columns} 
        data={data} 
        loading={loading}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/sales/view/${row.id}`)} title="View Document">View</button>
            {row.status !== 'approved' && (
               <button className="btn btn-primary btn-sm" onClick={() => handleApprove(row.id)} title="Approve Return" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                 <CheckCircle size={14} /> Approve
               </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
