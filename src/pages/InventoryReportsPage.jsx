import { useState, useEffect } from 'react';
import { Package, IndianRupee, AlertTriangle } from 'lucide-react';
import { reportsAPI } from '../services/api';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';

export default function InventoryReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await reportsAPI.getInventory();
        setData(res.data);
      } catch {
        toast.error('Failed to load inventory report');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-spinner" style={{ height: '50vh' }}><div className="spinner"></div></div>;
  if (!data) return null;

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU', render: (val) => <span style={{ fontFamily: 'monospace' }}>{val}</span> },
    { key: 'min_stock', label: 'Minimum Required', render: (val) => <span style={{ color: 'var(--text-secondary)' }}>{val}</span> },
    { key: 'quantity', label: 'Current Stock', render: (val) => <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{val}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="breadcrumb">Home / Reports / Inventory</div>
        <h1 className="page-title">Inventory Reports</h1>
        <p className="page-subtitle">Overview of stock valuation and items needing attention</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Total Items in Stock</div>
            <div className="stat-value" style={{ marginTop: '8px' }}>{data.summary.total_items}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
            <Package size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Total Stock Valuation</div>
            <div className="stat-value" style={{ color: 'var(--primary)', marginTop: '8px' }}>₹{data.summary.total_valuation.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
            <IndianRupee size={24} />
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-title">Low Stock Items</div>
            <div className="stat-value" style={{ color: 'var(--warning)', marginTop: '8px' }}>{data.summary.low_stock_count}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--warning)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <DataTable 
        title="Low Stock Alerts" 
        columns={columns} 
        data={data.low_stock} 
        pagination={false}
      />
    </div>
  );
}
