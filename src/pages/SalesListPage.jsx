import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { FileText, Plus, Download, Printer, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalesListPage() {
  const navigate = useNavigate();
  // We don't have a fully fledged sales API service yet in frontend, so we will mock the data fetch
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    // Mocking API fetch since the full API isn't built out in services/api.js yet
    setTimeout(() => {
      setData({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'invoice_number', label: 'Invoice No.' },
    { key: 'sale_date', label: 'Date' },
    { key: 'customer_name', label: 'Customer', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Total', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'payment_status', label: 'Payment', render: (val) => <span className={`badge-status ${val === 'paid' ? 'badge-active' : 'badge-inactive'}`}>{val || 'Unpaid'}</span> },
    { key: 'status', label: 'Status', render: (val) => <span className="badge-status badge-info">{val || 'Completed'}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">Home / Operations / Sales / Invoices</div>
          <h1 className="page-title">Sales Invoices</h1>
          <p className="page-subtitle">Manage all sales invoices</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/sales/create')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Sale / Create Invoice
        </button>
      </div>

      <DataTable 
        title="Sales Invoices" 
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
            <button className="btn btn-secondary btn-sm btn-icon" title="Email"><Mail size={14} /></button>
            <button className="btn btn-secondary btn-sm btn-icon" title="Export Excel"><Download size={14} /></button>
          </div>
        )}
      />
    </div>
  );
}
