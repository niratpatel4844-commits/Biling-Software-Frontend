import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import { inventoryAPI, productsAPI, warehousesAPI, categoriesAPI, brandsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ReservedStockPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTimer, setSearchTimer] = useState(null);

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const fetchData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getReserved({ page, page_size: 20, search });
      if (res.data.items) setData(res.data);
    } catch { toast.error('Failed to load reserved stock data'); }
    setLoading(false);
  }, []);

  const fetchDependencies = async () => {
    try {
      const [prodRes, wareRes, catRes, brandRes] = await Promise.all([
        productsAPI.list({ page_size: 1000 }),
        warehousesAPI.list({ page_size: 100 }),
        categoriesAPI.list({ page_size: 100 }),
        brandsAPI.list({ page_size: 100 }),
      ]);
      setProducts(prodRes.data.items || prodRes.data || []);
      setWarehouses(wareRes.data.items || wareRes.data || []);
      setCategories(catRes.data.items || catRes.data || []);
      setBrands(brandRes.data.items || brandRes.data || []);
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
    { key: 'quantity', label: 'Total Available', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'reserved_quantity', label: 'Reserved Quantity', render: (val) => <span style={{ fontWeight: 700, color: 'var(--warning)', backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{val}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Inventory / Reserved Stock</div>
          <h1 className="page-title">Reserved Stock</h1>
          <p className="page-subtitle">View stock that is currently reserved for pending orders</p>
        </div>
      </div>

      <DataTable 
        title="Reserved Items" 
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
