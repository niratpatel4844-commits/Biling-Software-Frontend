import CrudPage from './CrudPage';
import { vendorsAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Vendor', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'outstanding_amount', label: 'Outstanding', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '₹0' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'name', label: 'Vendor Name' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'address', label: 'Address' },
  { key: 'gst_number', label: 'GST Number' },
];

export default function VendorsPage() {
  return <CrudPage title="Vendors" subtitle="Manage vendor relationships"
    breadcrumb="Home / Operations / Vendors" apiService={vendorsAPI}
    columns={columns} formFields={formFields} addLabel="Add Vendor" />;
}
