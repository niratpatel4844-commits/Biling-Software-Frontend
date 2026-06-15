import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { FileText, Plus, Download, Printer, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

import { salesAPI } from '../services/api';

export default function SalesListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesAPI.list('invoice');
      setData(res.data || []);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'invoice_number', label: 'Invoice No.' },
    { key: 'customer_id', label: 'Customer ID', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'total_amount', label: 'Invoice Total', render: (val) => `₹${Number(val||0).toLocaleString()}` },
    { key: 'paid_amount', label: 'Paid Amount', render: (val) => <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{Number(val||0).toLocaleString()}</span> },
    { key: 'due_amount', label: 'Due Amount', render: (val) => <span style={{ color: 'var(--danger)', fontWeight: 600 }}>₹{Number(val||0).toLocaleString()}</span> },
    { key: 'payment_status', label: 'Payment Status', render: (val) => {
      let colorClass = val === 'paid' ? 'badge-active' : val === 'partial' ? 'badge-warning' : 'badge-inactive';
      return <span className={`badge-status ${colorClass}`} style={{ textTransform: 'capitalize' }}>{val || 'Unpaid'}</span>;
    }},
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
        data={data} 
        loading={loading} 
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/sales/view/${row.id}`)} title="View Document">View</button>
            {row.payment_status !== 'paid' && (
               <button className="btn btn-primary btn-sm" onClick={() => navigate('/sales/payments', { state: { autoOpen: true, customerId: row.customer_id, invoiceId: row.id, amount: row.due_amount || row.total_amount - (row.paid_amount || 0) } })} title="Record Payment">Pay Now</button>
            )}
          </div>
        )}
      />
    </div>
  );
}
