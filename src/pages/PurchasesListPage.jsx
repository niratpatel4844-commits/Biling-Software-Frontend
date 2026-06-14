import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { FileText, Plus, Download, Printer, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchasesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    setTimeout(() => {
      setData({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'po_number', label: 'Purchase No.' },
    { key: 'purchase_date', label: 'Date' },
    { key: 'vendor_name', label: 'Vendor', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Total', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'payment_status', label: 'Payment', render: (val) => <span className={`badge-status ${val === 'paid' ? 'badge-active' : 'badge-inactive'}`}>{val || 'Unpaid'}</span> },
    { key: 'status', label: 'Status', render: (val) => <span className="badge-status badge-info">{val || 'Completed'}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Operations / Purchases / Purchase Bills</div>
          <h1 className="page-title">Purchase Bills</h1>
          <p className="page-subtitle">Manage all purchase bills and vendor receipts</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/purchases/create')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Purchase / Create Bill
        </button>
      </div>

      <DataTable 
        title="Purchase Bills" 
        columns={columns} 
        data={data.items} 
        total={data.total}
        page={data.page} 
        pageSize={data.page_size} 
        totalPages={data.total_pages}
        loading={loading} 
        onPageChange={(p) => fetchData(p)} 
        onSearch={(s) => fetchData(1, s)}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm btn-icon" title="View PDF"><FileText size={14} /></button>
            <button className="btn btn-secondary btn-sm btn-icon" title="Print"><Printer size={14} /></button>
            <button className="btn btn-secondary btn-sm btn-icon" title="Export Excel"><Download size={14} /></button>
          </div>
        )}
      />
    </div>
  );
}
