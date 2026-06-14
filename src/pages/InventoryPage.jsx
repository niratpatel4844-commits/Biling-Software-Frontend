import { useState, useEffect } from 'react';
import CrudPage from './CrudPage';
import { inventoryAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'Inv ID' },
  { key: 'product_sku', label: 'SKU', render: (val) => <span className="badge-status badge-info" style={{ fontFamily: 'monospace' }}>{val}</span> },
  { key: 'product_name', label: 'Product Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'quantity', label: 'Available Stock', render: (val) => <span style={{ fontWeight: 700, color: val > 10 ? 'var(--success)' : (val > 0 ? 'var(--warning)' : 'var(--danger)') }}>{val}</span> },
  { key: 'reserved_quantity', label: 'Reserved' },
  { key: 'damaged_quantity', label: 'Damaged' },
  { key: 'batch_number', label: 'Batch No.', render: (val) => val || '-' },
  { key: 'location', label: 'Location', render: (val) => val || '-' },
];

export default function InventoryPage() {
  const formFields = [
    { key: 'product_id', label: 'Product ID *', type: 'number', section: 'Basic Information' },
    { key: 'quantity', label: 'Stock Quantity *', type: 'number', section: 'Basic Information' },
    { key: 'reserved_quantity', label: 'Reserved Stock', type: 'number', default: 0, section: 'Basic Information' },
    { key: 'damaged_quantity', label: 'Damaged Stock', type: 'number', default: 0, section: 'Basic Information' },
    { key: 'batch_number', label: 'Batch Number', section: 'Tracking' },
    { key: 'location', label: 'Warehouse Location', section: 'Tracking' },
  ];

  return <CrudPage title="Inventory" subtitle="Track live stock across products"
    breadcrumb="Home / Catalog / Inventory" apiService={inventoryAPI}
    columns={columns} formFields={formFields} addLabel="Add Stock Entry" />;
}
