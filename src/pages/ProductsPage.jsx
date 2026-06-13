import CrudPage from './CrudPage';
import { productsAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'sku', label: 'SKU', render: (val) => <span className="badge-status badge-info" style={{ fontFamily: 'monospace' }}>{val}</span> },
  { key: 'name', label: 'Product', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'brand', label: 'Brand' },
  { key: 'cost_price', label: 'Cost Price', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '-' },
  { key: 'selling_price', label: 'Selling Price', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '-' },
  { key: 'gst_percent', label: 'GST %' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Product Name' },
  { key: 'brand', label: 'Brand' },
  { key: 'description', label: 'Description' },
  { key: 'category_id', label: 'Category ID', type: 'number' },
  { key: 'unit', label: 'Unit', default: 'PCS' },
  { key: 'hsn_code', label: 'HSN Code' },
  { key: 'gst_percent', label: 'GST %', type: 'number', default: 18 },
  { key: 'cost_price', label: 'Cost Price', type: 'number' },
  { key: 'selling_price', label: 'Selling Price', type: 'number' },
  { key: 'mrp', label: 'MRP', type: 'number' },
  { key: 'min_stock', label: 'Min Stock', type: 'number', default: 10 },
];

export default function ProductsPage() {
  return <CrudPage title="Products" subtitle="Manage product catalog"
    breadcrumb="Home / Catalog / Products" apiService={productsAPI}
    columns={columns} formFields={formFields} addLabel="Add Product" />;
}
