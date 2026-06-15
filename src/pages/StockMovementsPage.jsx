import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { inventoryAPI, productsAPI, warehousesAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function StockMovementsPage({ movementType, title, description }) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form dependencies
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Available stock calculation (just a rough local state for UI helper)
  const [availableStock, setAvailableStock] = useState(null);

  const initialForm = {
    product_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    quantity: '',
    notes: '',
    action: movementType === 'adjustment' ? 'adjustment_in' : movementType
  };
  const [form, setForm] = useState(initialForm);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // If adjustment, we fetch both adjustment_in and adjustment_out by not passing type, or handling it differently?
      // Actually backend only filters exactly matching string. So if type='adjustment', maybe we don't pass type and filter locally,
      // or we update backend to handle 'adjustment' as IN/OUT. For now let's just fetch all and filter in frontend if needed, or don't pass movement_type.
      const res = await inventoryAPI.listMovements({ page, page_size: 50 });
      let items = res.data.items || [];
      if (movementType === 'adjustment') {
        items = items.filter(i => i.movement_type === 'adjustment_in' || i.movement_type === 'adjustment_out');
      } else {
        items = items.filter(i => i.movement_type === movementType);
      }
      setData({ ...res.data, items });
    } catch { toast.error('Failed to load stock movements'); }
    setLoading(false);
  }, [movementType]);

  const fetchDependencies = async () => {
    try {
      const [prodRes, wareRes] = await Promise.all([
        productsAPI.list({ page_size: 1000 }),
        warehousesAPI.list({ page_size: 100 })
      ]);
      setProducts(prodRes.data.items || prodRes.data || []);
      setWarehouses(wareRes.data.items || wareRes.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    fetchData(); 
    fetchDependencies();
  }, [fetchData]);

  // Try to find available stock from inventory list when product and source warehouse change
  useEffect(() => {
    if (form.product_id && form.from_warehouse_id) {
      inventoryAPI.list({ search: '' }).then(res => {
        const items = res.data.items || [];
        const inv = items.find(i => i.product_id === Number(form.product_id) && i.warehouse_id === Number(form.from_warehouse_id));
        setAvailableStock(inv ? inv.quantity : 0);
      });
    } else {
      setAvailableStock(null);
    }
  }, [form.product_id, form.from_warehouse_id]);

  const handleSave = async () => {
    try {
      const missing = [];
      if (!form.product_id) missing.push('Product');
      if (!form.quantity || form.quantity <= 0) missing.push('Quantity');
      
      let finalMovementType = movementType;
      
      if (movementType === 'transfer') {
        if (!form.from_warehouse_id) missing.push('Source Warehouse');
        if (!form.to_warehouse_id) missing.push('Destination Warehouse');
        if (form.from_warehouse_id === form.to_warehouse_id) return toast.error('Source and Destination cannot be the same');
      } else if (movementType === 'adjustment') {
        if (!form.action) missing.push('Action (Add/Remove)');
        if (form.action === 'adjustment_in') {
          if (!form.to_warehouse_id) missing.push('Warehouse');
          finalMovementType = 'adjustment_in';
        } else {
          if (!form.from_warehouse_id) missing.push('Warehouse');
          finalMovementType = 'adjustment_out';
        }
      } else if (movementType === 'damage') {
        if (!form.from_warehouse_id) missing.push('Warehouse');
      }

      if (missing.length > 0) return toast.error(`Please fill required fields: ${missing.join(', ')}`);

      if (availableStock !== null && form.quantity > availableStock && finalMovementType !== 'adjustment_in') {
        return toast.error('Quantity cannot exceed available stock!');
      }

      const payload = {
        product_id: Number(form.product_id),
        movement_type: finalMovementType,
        quantity: Number(form.quantity),
        notes: form.notes
      };

      if (form.from_warehouse_id) payload.from_warehouse_id = Number(form.from_warehouse_id);
      if (form.to_warehouse_id) payload.to_warehouse_id = Number(form.to_warehouse_id);

      await inventoryAPI.createMovement(payload);
      toast.success('Movement recorded successfully');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving movement');
    }
  };

  const renderColumns = () => {
    const base = [
      { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleString() },
      { key: 'product_name', label: 'Product' },
      { key: 'quantity', label: 'Qty', render: (val) => <span style={{ fontWeight: 'bold' }}>{val}</span> },
    ];

    if (movementType === 'transfer') {
      base.push({ key: 'from_id', label: 'From', render: (val) => warehouses.find(w => w.id === val)?.name || '-' });
      base.push({ key: 'to_id', label: 'To', render: (val) => warehouses.find(w => w.id === val)?.name || '-' });
    } else if (movementType === 'adjustment') {
      base.push({ key: 'movement_type', label: 'Action', render: (val) => val === 'adjustment_in' ? <span style={{color: 'green'}}>+ Add</span> : <span style={{color: 'red'}}>- Remove</span> });
      base.push({ key: 'warehouse', label: 'Warehouse', render: (_, row) => {
        const wId = row.movement_type === 'adjustment_in' ? row.to_id : row.from_id;
        return warehouses.find(w => w.id === wId)?.name || '-';
      }});
    } else if (movementType === 'damage') {
      base.push({ key: 'from_id', label: 'Warehouse', render: (val) => warehouses.find(w => w.id === val)?.name || '-' });
    }
    
    base.push({ key: 'notes', label: 'Notes' });
    return base;
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Inventory / {title}</div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
      </div>

      <DataTable 
        title={`${title} History`}
        columns={renderColumns()} 
        data={data.items} 
        loading={loading} 
        onAdd={() => { setForm(initialForm); setAvailableStock(null); setShowModal(true); }} 
        addLabel={`New ${title.split(' ')[1]}`} 
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`New ${title}`}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label">Product *</label>
            <select className="form-select" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})}>
              <option value="">Select Product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {movementType === 'adjustment' && (
            <div className="form-group">
              <label className="form-label">Action *</label>
              <select className="form-select" value={form.action} onChange={e => {
                setForm({...form, action: e.target.value, from_warehouse_id: '', to_warehouse_id: ''});
                setAvailableStock(null);
              }}>
                <option value="adjustment_in">Add Stock (+)</option>
                <option value="adjustment_out">Remove Stock (-)</option>
              </select>
            </div>
          )}

          {/* Render Source Warehouse field */}
          {(movementType === 'transfer' || movementType === 'damage' || (movementType === 'adjustment' && form.action === 'adjustment_out')) && (
            <div className="form-group">
              <label className="form-label">Source Warehouse *</label>
              <select className="form-select" value={form.from_warehouse_id} onChange={e => setForm({...form, from_warehouse_id: e.target.value})}>
                <option value="">Select Warehouse...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}

          {/* Render Destination Warehouse field */}
          {(movementType === 'transfer' || (movementType === 'adjustment' && form.action === 'adjustment_in')) && (
            <div className="form-group">
              <label className="form-label">{movementType === 'transfer' ? 'Destination Warehouse *' : 'Target Warehouse *'}</label>
              <select className="form-select" value={form.to_warehouse_id} onChange={e => setForm({...form, to_warehouse_id: e.target.value})}>
                <option value="">Select Warehouse...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}

          {availableStock !== null && (movementType === 'transfer' || movementType === 'damage' || (movementType === 'adjustment' && form.action === 'adjustment_out')) && (
            <div style={{ fontSize: '13px', color: availableStock > 0 ? 'var(--success)' : 'var(--danger)', marginTop: '-8px', fontWeight: 600 }}>
              Available in Source: {availableStock}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input className="form-input" type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Reason</label>
            <textarea className="form-input" rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Why is this movement happening?"></textarea>
          </div>

        </div>
      </Modal>
    </div>
  );
}
