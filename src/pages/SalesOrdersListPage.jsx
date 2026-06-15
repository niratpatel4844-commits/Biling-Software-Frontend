import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { FileText, Plus, Download, Printer, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesAPI } from '../services/api';

export default function SalesOrdersListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesAPI.list('sales_order');
      setData(res.data || []);
    } catch (err) {
      toast.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, target: null, loading: false });

  const handleConvertClick = (id, target) => {
    setConfirmModal({ isOpen: true, id, target, loading: false });
  };

  const handleConvertConfirm = async () => {
    const { id, target } = confirmModal;
    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      await salesAPI.convert(id, target);
      toast.success(`Successfully converted to ${target}`);
      setConfirmModal({ isOpen: false, id: null, target: null, loading: false });
      
      if (target === 'invoice') navigate('/sales/invoices');
      else fetchData();
    } catch (err) {
      toast.error(`Conversion failed: ${err.response?.data?.detail || err.message}`);
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    { key: 'invoice_number', label: 'Order No.' },
    { key: 'sale_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'customer_id', label: 'Customer ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Total', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge-status ${val === 'converted' ? 'badge-active' : 'badge-warning'}`}>{val || 'Pending'}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Operations / Sales / Sales Orders</div>
          <h1 className="page-title">Sales Orders</h1>
          <p className="page-subtitle">Manage confirmed customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/sales/create?type=sales_order')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Create Sales Order
        </button>
      </div>

      <DataTable 
        title="Sales Orders" 
        columns={columns} 
        data={data} 
        loading={loading} 
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/sales/view/${row.id}`)} title="View Document">View</button>
            {row.status !== 'converted' && (
              <button className="btn btn-primary btn-sm" title="Convert to Invoice" onClick={() => handleConvertClick(row.id, 'invoice')}>Convert to Invoice</button>
            )}
          </div>
        )}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null, target: null, loading: false })}
        onConfirm={handleConvertConfirm}
        title="Confirm Conversion"
        message={`Are you sure you want to convert this sales order to an ${confirmModal.target}?`}
        confirmText="Yes, Convert"
        type="primary"
        loading={confirmModal.loading}
      />
    </div>
  );
}
