import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesAPI, customersAPI, companiesAPI, branchesAPI, warehousesAPI, usersAPI, productsAPI, variantsAPI, unitsAPI } from '../services/api';

export default function AddSalePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const docType = searchParams.get('type') || 'invoice';

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    invoice_number: 'AUTO-GENERATE',
    invoice_date: new Date().toISOString().split('T')[0],
    customer_id: '',
    company_id: '',
    branch_id: '',
    franchise_id: '',
    warehouse_id: '',
    sales_person_id: '',
    notes: '',
  });

  const [items, setItems] = useState([
    { id: 1, product_id: '', variant_id: '', quantity: 1, unit_id: '', rate: 0, discount_percent: 0, gst_percent: 18 }
  ]);

  const [options, setOptions] = useState({
    customers: [],
    companies: [],
    branches: [],
    warehouses: [],
    users: [],
    products: [],
    variants: [],
    units: []
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [
          custRes, compRes, brRes, whRes, usrRes, prodRes, varRes, unitRes
        ] = await Promise.all([
          customersAPI.list(),
          companiesAPI.list(),
          branchesAPI.list(),
          warehousesAPI.list(),
          usersAPI.list(),
          productsAPI.list(),
          variantsAPI.list(),
          unitsAPI.list()
        ]);
        
        setOptions({
          customers: custRes.data?.items || custRes.data || [],
          companies: compRes.data?.items || compRes.data || [],
          branches: brRes.data?.items || brRes.data || [],
          warehouses: whRes.data?.items || whRes.data || [],
          users: usrRes.data?.items || usrRes.data || [],
          products: prodRes.data?.items || prodRes.data || [],
          variants: varRes.data?.items || varRes.data || [],
          units: unitRes.data?.items || unitRes.data || []
        });
      } catch (err) {
        toast.error('Failed to load form options');
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), product_id: '', variant_id: '', quantity: 1, unit_id: '', rate: 0, discount_percent: 0, gst_percent: 18 }]);
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
      const rowTotal = item.quantity * item.rate;
      const rowDiscount = rowTotal * (item.discount_percent / 100);
      const afterDiscount = rowTotal - rowDiscount;
      const rowTax = afterDiscount * (item.gst_percent / 100);
      
      subtotal += afterDiscount;
      tax_amount += rowTax;
    });

    return { subtotal, tax_amount, grand_total: subtotal + tax_amount };
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    if (!form.customer_id) return toast.error('Please select a customer');
    
    const payload = {
      ...form,
      customer_id: parseInt(form.customer_id),
      company_id: form.company_id ? parseInt(form.company_id) : null,
      branch_id: form.branch_id ? parseInt(form.branch_id) : null,
      franchise_id: form.franchise_id ? parseInt(form.franchise_id) : null,
      warehouse_id: form.warehouse_id ? parseInt(form.warehouse_id) : null,
      sales_person_id: form.sales_person_id ? parseInt(form.sales_person_id) : null,
      document_type: docType,
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        product_variant_id: item.variant_id ? parseInt(item.variant_id) : null,
        unit_id: item.unit_id ? parseInt(item.unit_id) : null,
        quantity: item.quantity,
        unit_price: item.rate,
        discount_percent: Math.min(Number(item.discount_percent) || 0, 100),
        gst_percent: item.gst_percent
      }))
    };

    // Ensure all items have product_id
    if (payload.items.some(i => isNaN(i.product_id))) {
      return toast.error('Please select a product for all line items');
    }

    setLoading(true);
    try {
      await salesAPI.create(payload);
      toast.success(`${docType.replace('_', ' ').toUpperCase()} created successfully!`);
      navigate(`/sales/${docType === 'invoice' ? 'invoices' : docType + 's'}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-secondary btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div>
          <div className="breadcrumb">Home / Operations / Sales / Create {docType.replace('_', ' ')}</div>
          <h1 className="page-title" style={{ textTransform: 'capitalize' }}>Create {docType.replace('_', ' ')}</h1>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Invoice Details</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Document Number</label>
            <input className="form-input" disabled value={form.invoice_number} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" name="invoice_date" value={form.invoice_date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Customer</label>
            <select className="form-select" name="customer_id" value={form.customer_id} onChange={handleChange}>
              <option value="">Select Customer</option>
              {options.customers.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.full_name || `Customer #${c.id}`}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <select className="form-select" name="company_id" value={form.company_id} onChange={handleChange}>
              <option value="">Select Company</option>
              {options.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Branch</label>
            <select className="form-select" name="branch_id" value={form.branch_id} onChange={handleChange}>
              <option value="">Select Branch</option>
              {options.branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select className="form-select" name="warehouse_id" value={form.warehouse_id} onChange={handleChange}>
              <option value="">Select Warehouse</option>
              {options.warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sales Person</label>
            <select className="form-select" name="sales_person_id" value={form.sales_person_id} onChange={handleChange}>
              <option value="">Select Sales Person</option>
              {options.users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
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
                <th>Quantity</th>
                <th>Unit</th>
                <th>Rate (₹)</th>
                <th>Discount (%)</th>
                <th>GST (%)</th>
                <th>Total (₹)</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const rowTotal = item.quantity * item.rate;
                const rowDiscount = rowTotal * (item.discount_percent / 100);
                const afterDiscount = rowTotal - rowDiscount;
                const rowTax = afterDiscount * (item.gst_percent / 100);
                const finalTotal = afterDiscount + rowTax;
                
                return (
                  <tr key={item.id}>
                    <td>
                      <select className="form-select" value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}>
                        <option value="">Select Product...</option>
                        {options.products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select className="form-select" value={item.variant_id} onChange={(e) => handleItemChange(index, 'variant_id', e.target.value)}>
                        <option value="">Select Variant...</option>
                        {options.variants.filter(v => !item.product_id || v.product_id == item.product_id).map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input type="number" className="form-input" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} />
                    </td>
                    <td>
                      <select className="form-select" value={item.unit_id} onChange={(e) => handleItemChange(index, 'unit_id', e.target.value)}>
                        <option value="">Unit</option>
                        {options.units.map(u => (
                          <option key={u.id} value={u.id}>{u.name || u.short_name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input type="number" className="form-input" min="0" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))} />
                    </td>
                    <td>
                      <input type="number" className="form-input" min="0" max="100" value={item.discount_percent} onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > 100) val = 100;
                        handleItemChange(index, 'discount_percent', val);
                      }} />
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
          <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Additional Details</h3>
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
            <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, height: 48, fontSize: 16, textTransform: 'capitalize' }}>
              <Save size={20} /> {loading ? 'Saving...' : `Save & Print ${docType.replace('_', ' ')}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
