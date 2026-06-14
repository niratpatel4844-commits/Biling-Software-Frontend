import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPurchasePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    po_number: 'AUTO-GENERATE',
    purchase_date: new Date().toISOString().split('T')[0],
    vendor_id: '',
    company_id: '',
    branch_id: '',
    warehouse_id: '',
    payment_status: 'unpaid',
    notes: '',
  });

  const [items, setItems] = useState([
    { id: 1, product_id: '', variant_id: '', quantity: 1, unit_id: '', cost_price: 0, discount_amount: 0, gst_percent: 18 }
  ]);

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
    setLoading(true);
    setTimeout(() => {
      toast.success('Purchase created successfully! Inventory increased.');
      setLoading(false);
      navigate('/purchases/bills');
    }, 800);
  };

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-secondary btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div>
          <div className="breadcrumb">Home / Operations / Purchases / Add Purchase</div>
          <h1 className="page-title">Add Purchase Bill</h1>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Purchase Details</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Purchase Number</label>
            <input className="form-input" disabled value={form.po_number} />
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input type="date" className="form-input" name="purchase_date" value={form.purchase_date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Vendor</label>
            <select className="form-select" name="vendor_id" value={form.vendor_id} onChange={handleChange}>
              <option value="">Select Vendor</option>
              <option value="1">Global Suppliers Ltd</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <select className="form-select" name="company_id" value={form.company_id} onChange={handleChange}>
              <option value="">Select Company</option>
              <option value="1">Main Company</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Branch</label>
            <select className="form-select" name="branch_id" value={form.branch_id} onChange={handleChange}>
              <option value="">Select Branch</option>
              <option value="1">HQ Branch</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select className="form-select" name="warehouse_id" value={form.warehouse_id} onChange={handleChange}>
              <option value="">Select Warehouse</option>
              <option value="1">Main Warehouse</option>
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
                <th>Cost Price (₹)</th>
                <th>Discount (₹)</th>
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
                        <option value="">Select Product...</option>
                        <option value="1">Raw Material X</option>
                      </select>
                    </td>
                    <td>
                      <select className="form-select" value={item.variant_id} onChange={(e) => handleItemChange(index, 'variant_id', e.target.value)}>
                        <option value="">Select Variant...</option>
                        <option value="1">Grade A</option>
                      </select>
                    </td>
                    <td>
                      <input type="number" className="form-input" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} />
                    </td>
                    <td>
                      <select className="form-select" value={item.unit_id} onChange={(e) => handleItemChange(index, 'unit_id', e.target.value)}>
                        <option value="">Unit</option>
                        <option value="1">KG</option>
                        <option value="2">TON</option>
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
              <Save size={20} /> {loading ? 'Saving...' : 'Save Purchase Bill'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
