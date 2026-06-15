import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { purchasesAPI } from '../services/api';

export default function PurchaseBillsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchasesAPI.list('purchase_bill');
      setData(res.data || []);
    } catch (err) { toast.error('Failed to load purchase bills'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'po_number', label: 'Bill Number' },
    { key: 'vendor_id', label: 'Vendor ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Bill Total', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'paid_amount', label: 'Paid Amount', render: (val) => <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{Number(val||0).toLocaleString()}</span> },
    { key: 'payment_status', label: 'Payment Status', render: (val) => {
      let colorClass = val === 'paid' ? 'badge-active' : val === 'partial' ? 'badge-warning' : 'badge-inactive';
      return <span className={`badge-status ${colorClass}`} style={{ textTransform: 'capitalize' }}>{val || 'Unpaid'}</span>;
    }},
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Purchases / Bills</div>
          <h1 className="page-title">Purchase Bills</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/purchases/create?type=bill')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Purchase Bill
        </button>
      </div>
      <DataTable 
        title="Purchase Bills" 
        columns={columns} 
        data={data} 
        loading={loading}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/purchases/view/${row.id}`)}>View</button>
            {row.payment_status !== 'paid' && (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/purchases/payments', { state: { autoOpen: true, vendorId: row.vendor_id, billId: row.id, amount: row.total_amount - (row.paid_amount || 0) } })}>Pay Now</button>
            )}
          </div>
        )}
      />
    </div>
  );
}
