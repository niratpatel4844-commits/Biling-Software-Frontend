import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { purchasesAPI } from '../services/api';

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchasesAPI.list('purchase_order');
      setData(res.data || []);
    } catch (err) { toast.error('Failed to load purchase orders'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConvert = async (id) => {
    try {
      await purchasesAPI.convert(id, 'goods_receipt');
      toast.success('Converted to Goods Receipt!');
      fetchData();
    } catch(err) { toast.error('Conversion failed'); }
  }

  const columns = [
    { key: 'po_number', label: 'PO Number' },
    { key: 'vendor_id', label: 'Vendor ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Amount', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge-status ${val === 'completed' ? 'badge-active' : 'badge-inactive'}`} style={{ textTransform: 'capitalize' }}>{val === 'completed' ? 'Received (GRN)' : val}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Purchases / Orders</div>
          <h1 className="page-title">Purchase Orders</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/purchases/create?type=order')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Purchase Order
        </button>
      </div>
      <DataTable title="Purchase Orders" columns={columns} data={data} loading={loading} actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/purchases/view/${row.id}`)}>View</button>
            {row.status !== 'completed' && <button className="btn btn-primary btn-sm" onClick={() => handleConvert(row.id)}>Generate GRN</button>}
          </div>
        )} />
    </div>
  );
}
