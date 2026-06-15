import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesAPI, customersAPI, productsAPI, unitsAPI } from '../services/api';

export default function ViewSalePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState({});
  const [units, setUnits] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sRes, cRes, prodRes, unitRes] = await Promise.all([
          salesAPI.get(id),
          customersAPI.list({page_size: 1000}),
          productsAPI.list({page_size: 1000}),
          unitsAPI.list()
        ]);
        
        const data = sRes.data;
        setSale(data);
        
        const cList = cRes.data?.items || cRes.data || [];
        setCustomer(cList.find(c => c.id === data.customer_id));
        
        const prodList = prodRes.data?.items || prodRes.data || [];
        const prodMap = {};
        prodList.forEach(p => prodMap[p.id] = p);
        setProducts(prodMap);
        
        const unitList = unitRes.data?.items || unitRes.data || [];
        const unitMap = {};
        unitList.forEach(u => unitMap[u.id] = u);
        setUnits(unitMap);
        
      } catch (err) {
        toast.error('Failed to load document details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading document...</div>;
  if (!sale) return <div style={{ padding: 40, textAlign: 'center' }}>Document not found.</div>;

  const getStatusBadge = (status) => {
    if (status === 'completed' || status === 'approved') return <span className="badge-status badge-active" style={{ textTransform: 'capitalize' }}>{status}</span>;
    if (status === 'pending') return <span className="badge-status badge-warning">Pending</span>;
    return <span className="badge-status badge-inactive" style={{ textTransform: 'capitalize' }}>{status}</span>;
  };

  const getDocTypeName = (type) => {
    const map = {
      'quotation': 'Quotation',
      'sales_order': 'Sales Order',
      'invoice': 'Sales Invoice',
      'return': 'Sales Return',
      'credit_note': 'Credit Note'
    };
    return map[type] || type;
  };

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-secondary btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div style={{ flex: 1 }}>
          <div className="breadcrumb">Home / Sales / View Document</div>
          <h1 className="page-title">{getDocTypeName(sale.document_type)}: {sale.invoice_number}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Printer size={16} /> Print</button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Download size={16} /> PDF</button>
          
          {sale.document_type === 'invoice' && sale.payment_status !== 'paid' && (
            <button className="btn btn-primary" onClick={() => navigate('/sales/payments', { state: { autoOpen: true, customerId: sale.customer_id, invoiceId: sale.id, amount: sale.due_amount || sale.total_amount - (sale.paid_amount || 0) } })} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={16} /> Pay Now
            </button>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Document Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <span>{getStatusBadge(sale.status)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
              <span style={{ fontWeight: 500 }}>{new Date(sale.sale_date || Date.now()).toLocaleDateString()}</span>
            </div>
            {sale.document_type === 'invoice' && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
                <span className={`badge-status ${sale.payment_status === 'paid' ? 'badge-active' : sale.payment_status === 'partial' ? 'badge-warning' : 'badge-inactive'}`} style={{ textTransform: 'capitalize' }}>
                  {sale.payment_status || 'Unpaid'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Customer Details</h3>
          {customer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <strong style={{ fontSize: 16 }}>{customer.name}</strong>
              <span style={{ color: 'var(--text-secondary)' }}>{customer.address}, {customer.city}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Email: {customer.email || '-'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Phone: {customer.mobile || '-'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>GST: {customer.gst_number || '-'}</span>
            </div>
          ) : (
            <span>Unknown Customer</span>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Line Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price (₹)</th>
                <th>Disc. (%)</th>
                <th>GST (%)</th>
                <th style={{ textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(sale.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{products[item.product_id]?.name || `Product ID: ${item.product_id}`}</td>
                  <td>{item.quantity}</td>
                  <td>{units[item.unit_id]?.name || '-'}</td>
                  <td>{Number(item.unit_price).toLocaleString()}</td>
                  <td>{item.discount_percent || 0}%</td>
                  <td>{item.gst_percent || 0}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{Number(item.total).toLocaleString()}</td>
                </tr>
              ))}
              {(!sale.items || sale.items.length === 0) && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Sub Total:</span>
            <span>₹{Number(sale.subtotal).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 15 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tax Amount (GST):</span>
            <span>₹{Number(sale.tax_amount).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: 16, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
            <span>Grand Total:</span>
            <span>₹{Number(sale.total_amount).toLocaleString()}</span>
          </div>
          {sale.document_type === 'invoice' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 15, color: 'var(--success)', fontWeight: 600 }}>
              <span>Paid Amount:</span>
              <span>₹{Number(sale.paid_amount || 0).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
