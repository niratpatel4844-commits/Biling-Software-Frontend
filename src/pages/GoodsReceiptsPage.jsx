import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { purchasesAPI } from '../services/api';

export default function GoodsReceiptsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchasesAPI.list('goods_receipt');
      setData(res.data || []);
    } catch (err) { toast.error('Failed to load GRNs'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConvert = async (id, type) => {
    try {
      await purchasesAPI.convert(id, type);
      toast.success(`Generated ${type === 'purchase_bill' ? 'Bill' : 'Return'} successfully!`);
      fetchData();
    } catch(err) { toast.error('Generation failed'); }
  }

  const columns = [
    { key: 'po_number', label: 'GRN Number' },
    { key: 'vendor_id', label: 'Vendor ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Value', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge-status ${val === 'completed' ? 'badge-active' : 'badge-inactive'}`} style={{ textTransform: 'capitalize' }}>{val === 'completed' ? 'Billed' : 'Received'}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Purchases / Goods Receipts</div>
          <h1 className="page-title">Goods Receipts (GRN)</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/purchases/create?type=receipt')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add GRN
        </button>
      </div>
      <DataTable title="Goods Receipts" columns={columns} data={data} loading={loading} actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/purchases/view/${row.id}`)}>View</button>
            {row.status !== 'completed' && <button className="btn btn-primary btn-sm" onClick={() => handleConvert(row.id, 'purchase_bill')}>Generate Bill</button>}
            <button className="btn btn-secondary btn-sm" onClick={() => handleConvert(row.id, 'vendor_return')}>Return Stock</button>
          </div>
        )} />
    </div>
  );
}
