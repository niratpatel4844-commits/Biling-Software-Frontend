import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { purchasesAPI, vendorsAPI, companiesAPI, branchesAPI, warehousesAPI, productsAPI, variantsAPI, unitsAPI } from '../services/api';

export default function AddPurchasePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') === 'request' ? 'purchase_request' : 
                      searchParams.get('type') === 'order' ? 'purchase_order' : 
                      searchParams.get('type') === 'receipt' ? 'goods_receipt' : 
                      searchParams.get('type') === 'return' ? 'vendor_return' : 'purchase_bill';
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    document_type: defaultType,
    po_number: 'AUTO-GENERATE',
    purchase_date: new Date().toISOString().split('T')[0],
    vendor_id: '',
    company_id: '',
    branch_id: '',
    warehouse_id: '',
    payment_status: 'unpaid',
    priority: 'Medium',
    notes: '',
  });

  const [items, setItems] = useState([
    { id: 1, product_id: '', variant_id: '', quantity: 1, unit_id: '', cost_price: 0, discount_amount: 0, gst_percent: 18 }
  ]);

  const [vendors, setVendors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [v, c, b, w, p, vr, u] = await Promise.all([
          vendorsAPI.list({page_size: 100}).catch(() => ({ data: { items: [] } })),
          companiesAPI.list().catch(() => ({ data: { items: [] } })),
          branchesAPI.list().catch(() => ({ data: { items: [] } })),
          warehousesAPI.list().catch(() => ({ data: { items: [] } })),
          productsAPI.list({page_size: 1000}).catch(() => ({ data: { items: [] } })),
          variantsAPI.list().catch(() => ({ data: { items: [] } })),
          unitsAPI.list().catch(() => ({ data: { items: [] } })),
        ]);
        setVendors(v.data.items || v.data || []);
        setCompanies(c.data.items || c.data || []);
        setBranches(b.data.items || b.data || []);
        setWarehouses(w.data.items || w.data || []);
        setProducts(p.data.items || p.data || []);
        setVariants(vr.data.items || vr.data || []);
        setUnits(u.data.items || u.data || []);
      } catch (err) {
        console.error("Error loading dependencies", err);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), product_id: '', variant_id: '', quantity: 1, unit_id: '', cost_price: 0, discount_amount: 0, gst_percent: 18 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax_amount = 0;
    
    items.forEach(item => {
      const rowTotal = item.quantity * item.cost_price;
      const afterDiscount = rowTotal - item.discount_amount;
      const rowTax = afterDiscount * (item.gst_percent / 100);
      
      subtotal += afterDiscount;
      tax_amount += rowTax;
    });

    return { subtotal, tax_amount, grand_total: subtotal + tax_amount };
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    if (!form.vendor_id) return toast.error('Please select a vendor');
    if (items.length === 0) return toast.error('Please add at least one line item');
    if (items.some(i => !i.product_id)) return toast.error('Please select a product for all line items');
    
    setLoading(true);
    try {
      const payload = {
        ...form,
        vendor_id: Number(form.vendor_id),
        company_id: form.company_id ? Number(form.company_id) : null,
        branch_id: form.branch_id ? Number(form.branch_id) : null,
        warehouse_id: form.warehouse_id ? Number(form.warehouse_id) : null,
        items: items.map(i => ({
          ...i,
          product_id: Number(i.product_id),
          variant_id: i.variant_id ? Number(i.variant_id) : null,
          unit_id: i.unit_id ? Number(i.unit_id) : null,
          quantity: Number(i.quantity),
          unit_price: Number(i.cost_price),
        }))
      };
      
      await purchasesAPI.create(payload);
      toast.success('Saved successfully!');
      
      const routeMap = {
        'purchase_request': '/purchases/requests',
        'purchase_order': '/purchases/orders',
        'goods_receipt': '/purchases/receipts',
        'vendor_return': '/purchases/returns',
        'purchase_bill': '/purchases/bills',
      };
      navigate(routeMap[form.document_type] || '/purchases/bills');
    } catch(err) {
      toast.error('Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-secondary btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div>
          <div className="breadcrumb">Home / Operations / Purchases / Add Document</div>
          <h1 className="page-title">Add {form.document_type.replace('_', ' ')}</h1>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Details</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select className="form-select" name="document_type" value={form.document_type} onChange={handleChange}>
              <option value="purchase_request">Purchase Request</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="goods_receipt">Goods Receipt</option>
              <option value="purchase_bill">Purchase Bill</option>
              <option value="vendor_return">Vendor Return</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Document Number</label>
            <input className="form-input" disabled value={form.po_number} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" name="purchase_date" value={form.purchase_date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Vendor</label>
            <select className="form-select" name="vendor_id" value={form.vendor_id} onChange={handleChange}>
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <select className="form-select" name="company_id" value={form.company_id} onChange={handleChange}>
              <option value="">Select Company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select className="form-select" name="warehouse_id" value={form.warehouse_id} onChange={handleChange}>
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Line Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Price (₹)</th>
                <th>Disc (₹)</th>
                <th>GST (%)</th>
                <th>Total (₹)</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const rowTotal = item.quantity * item.cost_price;
                const afterDiscount = rowTotal - item.discount_amount;
                const rowTax = afterDiscount * (item.gst_percent / 100);
                const finalTotal = afterDiscount + rowTax;
                
                return (
                  <tr key={item.id}>
                    <td>
                      <select className="form-select" value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}>
                        <option value="">Select...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="form-select" value={item.variant_id} onChange={(e) => handleItemChange(index, 'variant_id', e.target.value)}>
                        <option value="">Variant...</option>
                        {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="number" className="form-input" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} />
                    </td>
                    <td>
                      <select className="form-select" value={item.unit_id} onChange={(e) => handleItemChange(index, 'unit_id', e.target.value)}>
                        <option value="">Unit</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="number" className="form-input" min="0" value={item.cost_price} onChange={(e) => handleItemChange(index, 'cost_price', Number(e.target.value))} />
                    </td>
                    <td>
                      <input type="number" className="form-input" min="0" value={item.discount_amount} onChange={(e) => handleItemChange(index, 'discount_amount', Number(e.target.value))} />
                    </td>
                    <td>
                      <select className="form-select" value={item.gst_percent} onChange={(e) => handleItemChange(index, 'gst_percent', Number(e.target.value))}>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td style={{ fontWeight: 600 }}>{finalTotal.toFixed(2)}</td>
                    <td>
                      <button className="btn btn-secondary btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeItem(index)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Add Line Item
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Payment Details</h3>
          <div className="form-group">
            <label className="form-label">Payment Status</label>
            <select className="form-select" name="payment_status" value={form.payment_status} onChange={handleChange}>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Additional notes..." />
          </div>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Sub Total:</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 15 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tax Amount (GST):</span>
            <span>₹{totals.tax_amount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: 16, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
            <span>Grand Total:</span>
            <span>₹{totals.grand_total.toFixed(2)}</span>
          </div>
          
          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, height: 48, fontSize: 16 }}>
              <Save size={20} /> {loading ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
