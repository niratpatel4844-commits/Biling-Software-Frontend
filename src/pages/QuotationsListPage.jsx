import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { FileText, Plus, Download, Printer, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesAPI } from '../services/api';

export default function QuotationsListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesAPI.list('quotation');
      setData(res.data || []);
    } catch (err) {
      toast.error('Failed to load quotations');
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
      toast.success(`Successfully converted to ${target.replace('_', ' ')}`);
      setConfirmModal({ isOpen: false, id: null, target: null, loading: false });
      
      if (target === 'sales_order') navigate('/sales/orders');
      else if (target === 'invoice') navigate('/sales/invoices');
      else fetchData();
    } catch (err) {
      toast.error(`Conversion failed: ${err.response?.data?.detail || err.message}`);
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    { key: 'invoice_number', label: 'Quotation No.' },
    { key: 'sale_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'customer_id', label: 'Customer ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Total', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val) => <span className={`badge-status ${val === 'converted' ? 'badge-active' : 'badge-info'}`}>{val || 'Draft'}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Operations / Sales / Quotations</div>
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">Manage all price offers and quotations</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/sales/create?type=quotation')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Create Quotation
        </button>
      </div>

      <DataTable 
        title="Quotations" 
        columns={columns} 
        data={data} 
        loading={loading} 
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/sales/view/${row.id}`)} title="View Document">View</button>
            {row.status !== 'converted' && (
              <button className="btn btn-primary btn-sm" title="Convert to Sales Order" onClick={() => handleConvertClick(row.id, 'sales_order')}>Convert to Order</button>
            )}
          </div>
        )}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null, target: null, loading: false })}
        onConfirm={handleConvertConfirm}
        title="Confirm Conversion"
        message={`Are you sure you want to convert this quotation to a ${confirmModal.target?.replace('_', ' ')}?`}
        confirmText="Yes, Convert"
        type="primary"
        loading={confirmModal.loading}
      />
    </div>
  );
}
