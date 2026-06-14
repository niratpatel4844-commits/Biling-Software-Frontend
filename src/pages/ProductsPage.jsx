import { useState, useEffect } from 'react';
import CrudPage from './CrudPage';
import { productsAPI, categoriesAPI, brandsAPI, unitsAPI } from '../services/api';

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

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    categoriesAPI.list({ page_size: 100 })
      .then(res => setCategories(res.data?.items || res.data || []))
      .catch(console.error);
    brandsAPI.list({ page_size: 100 })
      .then(res => setBrands(res.data?.items || res.data || []))
      .catch(console.error);
    unitsAPI.list({ page_size: 100 })
      .then(res => setUnits(res.data?.items || res.data || []))
      .catch(console.error);
  }, []);

  const formFields = [
    // Basic Information
    { key: 'sku', label: 'SKU *', section: 'Basic Information' },
    { key: 'name', label: 'Product Name *', section: 'Basic Information' },
    { 
      key: 'category_id', 
      label: 'Main Category *', 
      type: 'select', 
      valueType: 'number', 
      section: 'Basic Information',
      options: categories.filter(c => c.level === 0).map(c => ({ label: c.name, value: c.id })) 
    },
    { 
      key: 'sub_category_id', 
      label: 'Sub Category', 
      type: 'select', 
      valueType: 'number', 
      section: 'Basic Information',
      options: (form) => categories.filter(c => c.level === 1 && c.parent_id === form.category_id).map(c => ({ label: c.name, value: c.id })) 
    },
    { 
      key: 'child_category_id', 
      label: 'Child Category', 
      type: 'select', 
      valueType: 'number', 
      section: 'Basic Information',
      options: (form) => categories.filter(c => c.level === 2 && c.parent_id === form.sub_category_id).map(c => ({ label: c.name, value: c.id })) 
    },
    { key: 'brand_id', label: 'Brand *', type: 'select', valueType: 'number', section: 'Basic Information', options: brands.map(b => ({ label: b.name, value: b.id })) },
    { key: 'unit_id', label: 'Unit *', type: 'select', valueType: 'number', section: 'Basic Information', options: units.map(u => ({ label: u.name, value: u.id })) },
    { key: 'description', label: 'Description', section: 'Basic Information' },

    // Tax Information
    { key: 'hsn_code', label: 'HSN Code', section: 'Tax Information' },
    { key: 'gst_percent', label: 'GST %', type: 'number', default: 18, section: 'Tax Information' },

    // Pricing Information
    { key: 'cost_price', label: 'Cost Price *', type: 'number', section: 'Pricing Information' },
    { key: 'selling_price', label: 'Selling Price *', type: 'number', section: 'Pricing Information' },
    { key: 'mrp', label: 'MRP', type: 'number', section: 'Pricing Information' },

    // Inventory Information
    { key: 'min_stock', label: 'Min Stock', type: 'number', default: 10, section: 'Inventory Information' },
    { key: 'reorder_level', label: 'Reorder Level', type: 'number', default: 20, section: 'Inventory Information' },

    // Additional Information
    { key: 'barcode', label: 'Barcode', section: 'Additional Information' },
    { key: 'image', label: 'Product Image URL', section: 'Additional Information' },
    { key: 'is_active', label: 'Status', type: 'select', options: [{label: 'Active', value: 'true'}, {label: 'Inactive', value: 'false'}], default: 'true', section: 'Additional Information' },
  ];

  return <CrudPage title="Products" subtitle="Manage product catalog"
    breadcrumb="Home / Catalog / Products" apiService={productsAPI}
    columns={columns} formFields={formFields} addLabel="Add Product" />;
}
