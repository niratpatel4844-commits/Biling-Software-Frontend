import { useState, useEffect, useCallback, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { inventoryAPI, productsAPI, companiesAPI, branchesAPI, warehousesAPI, categoriesAPI, brandsAPI, unitsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);

  // Dropdown options
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  // Form state
  const initialForm = {
    product_id: '', product_variant_id: '',
    opening_quantity: 0, reserved_quantity: 0, damaged_quantity: 0,
    company_id: '', branch_id: '', franchise_id: '', warehouse_id: '',
    batch_number: '', lot_number: '', serial_number: '',
    manufacturing_date: '', expiry_date: '',
    purchase_cost: '', selling_price: '',
    opening_stock_date: '', remarks: ''
  };
  const [form, setForm] = useState(initialForm);

  const fetchData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await inventoryAPI.list({ page, page_size: 20, search });
      if (res.data.items) {
        setData(res.data);
      }
    } catch { toast.error('Failed to load inventory data'); }
    setLoading(false);
  }, []);

  const fetchDependencies = async () => {
    try {
      const [prodRes, compRes, branchRes, wareRes, catRes, brandRes, unitRes] = await Promise.all([
        productsAPI.list({ page_size: 1000 }),
        companiesAPI.list({ page_size: 100 }),
        branchesAPI.list({ page_size: 100 }),
        warehousesAPI.list({ page_size: 100 }),
        categoriesAPI.list({ page_size: 100 }),
        brandsAPI.list({ page_size: 100 }),
        unitsAPI.list({ page_size: 100 })
      ]);
      setProducts(prodRes.data.items || prodRes.data || []);
      setCompanies(compRes.data.items || compRes.data || []);
      setBranches(branchRes.data.items || branchRes.data || []);
      setWarehouses(wareRes.data.items || wareRes.data || []);
      setCategories(catRes.data.items || catRes.data || []);
      setBrands(brandRes.data.items || brandRes.data || []);
      setUnits(unitRes.data.items || unitRes.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    fetchData(); 
    fetchDependencies();
  }, [fetchData]);

  const handleSearch = (val) => {
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchData(1, val), 400));
  };

  const handleProductChange = (e) => {
    const pid = Number(e.target.value);
    const prod = products.find(p => p.id === pid);
    if (prod) {
      setForm(f => ({
        ...f,
        product_id: pid,
        purchase_cost: prod.cost_price || '',
        selling_price: prod.selling_price || '',
      }));
    } else {
      setForm(f => ({ ...f, product_id: pid }));
    }
  };

  const selectedProduct = products.find(p => p.id === form.product_id) || {};
  const catName = categories.find(c => c.id === selectedProduct.category_id)?.name || '-';
  const brandName = brands.find(b => b.id === selectedProduct.brand_id)?.name || '-';
  const unitName = units.find(u => u.id === selectedProduct.unit_id)?.name || '-';

  const availableStock = Math.max(0, (Number(form.opening_quantity) || 0) - (Number(form.reserved_quantity) || 0) - (Number(form.damaged_quantity) || 0));

  const handleSave = async () => {
    try {
      const missing = [];
      if (!form.product_id) missing.push('Product');
      if (form.opening_quantity === '' || form.opening_quantity === null) missing.push('Opening Quantity');
      if (!form.company_id) missing.push('Company');
      if (!form.branch_id) missing.push('Branch');
      if (!form.warehouse_id) missing.push('Warehouse');

      if (missing.length > 0) {
        toast.error(`Please fill required fields: ${missing.join(', ')}`);
        return;
      }

      if (form.opening_quantity < 0) return toast.error('Quantity cannot be negative');
      if (form.reserved_quantity > form.opening_quantity) return toast.error('Reserved exceeds Opening Quantity');
      if (form.damaged_quantity > form.opening_quantity) return toast.error('Damaged exceeds Opening Quantity');

      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

      await inventoryAPI.addOpeningStock(payload);
      toast.success('Opening Stock added successfully');
      setShowModal(false);
      fetchData(data.page);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0].msg : (detail || 'Error saving'));
    }
  };

  const getStatus = (qty) => {
    if (qty > 20) return <span className="badge-status badge-success">In Stock</span>;
    if (qty > 0) return <span className="badge-status badge-warning">Low Stock</span>;
    return <span className="badge-status badge-danger">Out Of Stock</span>;
  };

  const columns = [
    { key: 'product_name', label: 'Product' },
    { key: 'product_sku', label: 'SKU', render: (val) => <span style={{ fontFamily: 'monospace' }}>{val}</span> },
    { key: 'category', label: 'Category', render: (_, row) => {
      const p = products.find(p => p.id === row.product_id);
      return categories.find(c => c.id === p?.category_id)?.name || '-';
    }},
    { key: 'brand', label: 'Brand', render: (_, row) => {
      const p = products.find(p => p.id === row.product_id);
      return brands.find(b => b.id === p?.brand_id)?.name || '-';
    }},
    { key: 'warehouse', label: 'Warehouse', render: (_, row) => warehouses.find(w => w.id === row.warehouse_id)?.name || '-' },
    { key: 'quantity', label: 'Available Stock', render: (val) => <span style={{ fontWeight: 700 }}>{val}</span> },
    { key: 'reserved_quantity', label: 'Reserved' },
    { key: 'damaged_quantity', label: 'Damaged' },
    { key: 'batch_number', label: 'Batch No.', render: (val) => val || '-' },
    { key: 'status', label: 'Status', render: (_, row) => getStatus(row.quantity) },
    { key: 'actions', label: 'Actions', render: () => <span style={{ color: 'var(--text-secondary)' }}>No manual edits</span> }
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Catalog / Inventory</div>
          <h1 className="page-title">Inventory Master</h1>
          <p className="page-subtitle">Track live stock and manage opening inventory</p>
        </div>
      </div>

      <DataTable 
        title="Inventory" 
        columns={columns} 
        data={data.items} 
        total={data.total}
        page={data.page} 
        pageSize={data.page_size} 
        totalPages={data.total_pages}
        loading={loading} 
        onPageChange={(p) => fetchData(p)} 
        onSearch={handleSearch}
        onAdd={() => { setForm(initialForm); setShowModal(true); }} 
        addLabel="Add Inventory (Opening Stock)" 
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Opening Stock"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '75vh', overflowY: 'auto', paddingRight: '8px' }}>
          
          <div style={{ padding: '12px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '14px' }}>
            <strong>IMPORTANT:</strong> This form is ONLY for Opening Stock / Initial Stock Entry. Daily stock changes must come from Purchases, Sales, Stock Transfers, Adjustments, or Returns.
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>SECTION 1: PRODUCT INFORMATION</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Product *</label>
                <select className="form-select" value={form.product_id} onChange={handleProductChange}>
                  <option value="">Select Product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Product Variant</label>
                <input className="form-input" disabled value="N/A (Optional)" />
              </div>
              <div className="form-group">
                <label className="form-label">SKU (Auto Fill)</label>
                <input className="form-input" disabled value={selectedProduct.sku || ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Category (Auto Fill)</label>
                <input className="form-input" disabled value={catName} />
              </div>
              <div className="form-group">
                <label className="form-label">Brand (Auto Fill)</label>
                <input className="form-input" disabled value={brandName} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit (Auto Fill)</label>
                <input className="form-input" disabled value={unitName} />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>SECTION 2: STOCK INFORMATION</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Opening Quantity *</label>
                <input className="form-input" type="number" min="0" value={form.opening_quantity} onChange={e => setForm({...form, opening_quantity: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Reserved Quantity</label>
                <input className="form-input" type="number" min="0" value={form.reserved_quantity} onChange={e => setForm({...form, reserved_quantity: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Damaged Quantity</label>
                <input className="form-input" type="number" min="0" value={form.damaged_quantity} onChange={e => setForm({...form, damaged_quantity: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--success)' }}>Available Stock (Live Calculation)</label>
                <input className="form-input" disabled value={availableStock} style={{ fontWeight: 'bold', color: 'var(--success)', backgroundColor: 'rgba(34, 197, 94, 0.05)' }} />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>SECTION 3: LOCATION INFORMATION</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Company *</label>
                <select className="form-select" value={form.company_id} onChange={e => setForm({...form, company_id: Number(e.target.value)})}>
                  <option value="">Select Company...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch *</label>
                <select className="form-select" value={form.branch_id} onChange={e => setForm({...form, branch_id: Number(e.target.value)})}>
                  <option value="">Select Branch...</option>
                  {branches.filter(b => b.company_id === form.company_id || !form.company_id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Franchise (Optional)</label>
                <input className="form-input" placeholder="Optional" disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Warehouse *</label>
                <select className="form-select" value={form.warehouse_id} onChange={e => setForm({...form, warehouse_id: Number(e.target.value)})}>
                  <option value="">Select Warehouse...</option>
                  {warehouses.filter(w => w.company_id === form.company_id || !form.company_id).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>SECTION 4: TRACKING INFORMATION</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input className="form-input" value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Lot Number</label>
                <input className="form-input" value={form.lot_number} onChange={e => setForm({...form, lot_number: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Serial Number (Optional)</label>
                <input className="form-input" value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Manufacturing Date</label>
                <input className="form-input" type="date" value={form.manufacturing_date} onChange={e => setForm({...form, manufacturing_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input className="form-input" type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>SECTION 5: COST INFORMATION</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Purchase Cost</label>
                <input className="form-input" type="number" step="0.01" value={form.purchase_cost} onChange={e => setForm({...form, purchase_cost: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price</label>
                <input className="form-input" type="number" step="0.01" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})} />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>SECTION 6: AUDIT INFORMATION</h4>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Opening Stock Date</label>
                <input className="form-input" type="date" value={form.opening_stock_date} onChange={e => setForm({...form, opening_stock_date: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Remarks</label>
                <textarea className="form-input" rows="3" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})}></textarea>
              </div>
            </div>
          </div>

        </div>
      </Modal>
    </div>
  );
}
