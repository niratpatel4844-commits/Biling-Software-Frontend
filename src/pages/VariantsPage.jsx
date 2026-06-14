import { useState, useEffect } from 'react';
import CrudPage from './CrudPage';
import { variantsAPI, productsAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'sku', label: 'Variant SKU', render: (val) => <span className="badge-status badge-info" style={{ fontFamily: 'monospace' }}>{val}</span> },
  { key: 'name', label: 'Variant Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'color', label: 'Color' },
  { key: 'size', label: 'Size' },
  { key: 'cost_price', label: 'Cost Price', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '-' },
  { key: 'selling_price', label: 'Selling Price', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '-' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

export default function VariantsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productsAPI.list({ page_size: 100 })
      .then(res => setProducts(res.data?.items || res.data || []))
      .catch(console.error);
  }, []);

  const formFields = [
    { key: 'product_id', label: 'Product *', type: 'select', valueType: 'number', options: products.map(p => ({ label: p.name, value: p.id })) },
    { key: 'sku', label: 'Variant SKU *', required: true },
    { key: 'name', label: 'Variant Name *', required: true },
    { key: 'color', label: 'Color' },
    { key: 'size', label: 'Size' },
    { key: 'weight', label: 'Weight' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'cost_price', label: 'Cost Price', type: 'number' },
    { key: 'selling_price', label: 'Selling Price', type: 'number' },
    { key: 'is_active', label: 'Status', type: 'select', options: [{label: 'Active', value: 'true'}, {label: 'Inactive', value: 'false'}], default: 'true' },
  ];

  return <CrudPage title="Product Variants" subtitle="Manage variants of products"
    breadcrumb="Home / Catalog / Variants" apiService={variantsAPI}
    columns={columns} formFields={formFields} addLabel="Add Variant" />;
}
