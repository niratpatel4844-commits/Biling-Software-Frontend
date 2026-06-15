import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { FileText, Plus, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { purchasesAPI } from '../services/api';

export default function PurchaseRequestsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchasesAPI.list('purchase_request');
      setData(res.data || []);
    } catch (err) {
      toast.error('Failed to load purchase requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConvert = async (id) => {
    try {
      await purchasesAPI.convert(id, 'purchase_order');
      toast.success('Successfully converted to Purchase Order!');
      fetchData();
    } catch(err) {
      toast.error('Failed to convert');
    }
  }

  const columns = [
    { key: 'po_number', label: 'Request No.' },
    { key: 'vendor_id', label: 'Vendor ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'priority', label: 'Priority', render: (val) => <span className={`badge-status ${val === 'Urgent' ? 'badge-danger' : val === 'High' ? 'badge-warning' : 'badge-active'}`}>{val || 'Medium'}</span> },
    { key: 'total_amount', label: 'Total', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge-status ${val === 'completed' ? 'badge-active' : 'badge-inactive'}`} style={{ textTransform: 'capitalize' }}>{val === 'completed' ? 'Converted to PO' : val}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Purchases / Requests</div>
          <h1 className="page-title">Purchase Requests</h1>
          <p className="page-subtitle">Manage internal stock requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/purchases/create?type=request')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Purchase Request
        </button>
      </div>

      <DataTable 
        title="Purchase Requests" 
        columns={columns} 
        data={data} 
        loading={loading} 
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/purchases/view/${row.id}`)}>View</button>
            {row.status !== 'completed' && (
               <button className="btn btn-primary btn-sm" onClick={() => handleConvert(row.id)} title="Convert to PO">Convert to PO</button>
            )}
          </div>
        )}
      />
    </div>
  );
}
