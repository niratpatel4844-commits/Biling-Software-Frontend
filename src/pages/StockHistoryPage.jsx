import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import { inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function StockHistoryPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTimer, setSearchTimer] = useState(null);

  const fetchData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getHistory({ page, page_size: 20, search });
      if (res.data.items) setData(res.data);
    } catch { toast.error('Failed to load stock history'); }
    setLoading(false);
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const handleSearch = (val) => {
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchData(1, val), 400));
  };

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'OPENING_STOCK': return <span className="badge-status badge-primary">Opening Stock</span>;
      case 'PURCHASE': return <span className="badge-status badge-success">Purchase</span>;
      case 'SALES': return <span className="badge-status badge-info">Sales</span>;
      case 'TRANSFER_IN': return <span className="badge-status badge-success">Transfer In</span>;
      case 'TRANSFER_OUT': return <span className="badge-status badge-warning">Transfer Out</span>;
      case 'ADJUSTMENT_IN': return <span className="badge-status badge-success">Adjustment In</span>;
      case 'ADJUSTMENT_OUT': return <span className="badge-status badge-danger">Adjustment Out</span>;
      case 'DAMAGE': return <span className="badge-status badge-danger">Damage</span>;
      default: return <span className="badge-status" style={{ backgroundColor: 'var(--bg-card-hover)' }}>{type}</span>;
    }
  };

  const columns = [
    { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleString() },
    { key: 'product_name', label: 'Product', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600 }}>{val}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.product_sku}</div>
      </div>
    )},
    { key: 'warehouse_name', label: 'Warehouse' },
    { key: 'transaction_type', label: 'Transaction Type', render: (val) => getTransactionBadge(val) },
    { key: 'previous_stock', label: 'Prev Stock', render: (val) => <span style={{ color: 'var(--text-secondary)' }}>{val}</span> },
    { key: 'quantity_in', label: 'Qty In', render: (val) => val > 0 ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>+{val}</span> : '-' },
    { key: 'quantity_out', label: 'Qty Out', render: (val) => val > 0 ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>-{val}</span> : '-' },
    { key: 'new_stock', label: 'New Stock', render: (val) => <span style={{ fontWeight: 700 }}>{val}</span> },
    { key: 'user_name', label: 'Recorded By' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Inventory / Stock History</div>
          <h1 className="page-title">Stock History</h1>
          <p className="page-subtitle">Chronological log of all inventory changes</p>
        </div>
      </div>

      <DataTable 
        title="Stock Log" 
        columns={columns} 
        data={data.items} 
        total={data.total}
        page={data.page} 
        pageSize={data.page_size} 
        totalPages={data.total_pages}
        loading={loading} 
        onPageChange={(p) => fetchData(p)} 
        onSearch={handleSearch}
      />
    </div>
  );
}
