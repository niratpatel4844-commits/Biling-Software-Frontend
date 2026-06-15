import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { purchasesAPI, vendorsAPI, productsAPI, unitsAPI } from '../services/api';

export default function ViewPurchasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState({});
  const [units, setUnits] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, vRes, prodRes, unitRes] = await Promise.all([
          purchasesAPI.get(id),
          vendorsAPI.list({page_size: 1000}),
          productsAPI.list({page_size: 1000}),
          unitsAPI.list()
        ]);
        
        const data = pRes.data;
        setPurchase(data);
        
        const vList = vRes.data?.items || vRes.data || [];
        setVendor(vList.find(v => v.id === data.vendor_id));
        
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
  if (!purchase) return <div style={{ padding: 40, textAlign: 'center' }}>Document not found.</div>;

  const getStatusBadge = (status) => {
    if (status === 'completed') return <span className="badge-status badge-active">Completed</span>;
    if (status === 'pending') return <span className="badge-status badge-warning">Pending</span>;
    return <span className="badge-status badge-inactive">{status}</span>;
  };

  const getDocTypeName = (type) => {
    const map = {
      'purchase_request': 'Purchase Request',
      'purchase_order': 'Purchase Order',
      'goods_receipt': 'Goods Receipt (GRN)',
      'purchase_bill': 'Purchase Bill',
      'vendor_return': 'Vendor Return'
    };
    return map[type] || type;
  };

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-secondary btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div style={{ flex: 1 }}>
          <div className="breadcrumb">Home / Purchases / View Document</div>
          <h1 className="page-title">{getDocTypeName(purchase.document_type)}: {purchase.po_number}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Printer size={16} /> Print</button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Download size={16} /> PDF</button>
          
          {purchase.document_type === 'purchase_bill' && purchase.payment_status !== 'paid' && (
            <button className="btn btn-primary" onClick={() => navigate('/purchases/payments', { state: { autoOpen: true, vendorId: purchase.vendor_id, billId: purchase.id, amount: purchase.total_amount - (purchase.paid_amount || 0) } })} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
              <span>{getStatusBadge(purchase.status)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
              <span style={{ fontWeight: 500 }}>{new Date(purchase.purchase_date).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Priority:</span>
              <span style={{ fontWeight: 500 }}>{purchase.priority}</span>
            </div>
            {purchase.document_type === 'purchase_bill' && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
                <span className={`badge-status ${purchase.payment_status === 'paid' ? 'badge-active' : purchase.payment_status === 'partial' ? 'badge-warning' : 'badge-inactive'}`} style={{ textTransform: 'capitalize' }}>
                  {purchase.payment_status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Vendor Details</h3>
          {vendor ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <strong style={{ fontSize: 16 }}>{vendor.name}</strong>
              <span style={{ color: 'var(--text-secondary)' }}>{vendor.address}, {vendor.city}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Email: {vendor.email || '-'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Phone: {vendor.mobile || '-'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>GST: {vendor.gst_number || '-'}</span>
            </div>
          ) : (
            <span>Unknown Vendor</span>
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
                <th>GST (%)</th>
                <th style={{ textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(purchase.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{products[item.product_id]?.name || `Product ID: ${item.product_id}`}</td>
                  <td>{item.quantity}</td>
                  <td>{units[item.unit_id]?.name || '-'}</td>
                  <td>{Number(item.unit_price).toLocaleString()}</td>
                  <td>{item.gst_percent}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{Number(item.total).toLocaleString()}</td>
                </tr>
              ))}
              {(!purchase.items || purchase.items.length === 0) && (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Sub Total:</span>
            <span>₹{Number(purchase.subtotal).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 15 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tax Amount (GST):</span>
            <span>₹{Number(purchase.tax_amount).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: 16, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
            <span>Grand Total:</span>
            <span>₹{Number(purchase.total_amount).toLocaleString()}</span>
          </div>
          {purchase.document_type === 'purchase_bill' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 15, color: 'var(--success)', fontWeight: 600 }}>
              <span>Paid Amount:</span>
              <span>₹{Number(purchase.paid_amount || 0).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
