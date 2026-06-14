import CrudPage from './CrudPage';
import { vendorsAPI } from '../services/api';

const columns = [
  { key: 'vendor_code', label: 'Code' },
  { key: 'name', label: 'Vendor', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'contact_person', label: 'Contact Person' },
  { key: 'gst_number', label: 'GST Number' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'payment_terms', label: 'Payment Terms' },
  { key: 'outstanding_amount', label: 'Outstanding', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '₹0' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'vendor_code', label: 'Vendor Code (Auto)' },
  { key: 'name', label: 'Vendor Name' },
  { key: 'contact_person', label: 'Contact Person' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'gst_number', label: 'GST Number' },
  { key: 'pan_number', label: 'PAN Number' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country', default: 'India' },
  { key: 'pincode', label: 'Pincode' },
  { key: 'payment_terms', label: 'Payment Terms' },
  { key: 'notes', label: 'Notes' },
  { key: 'is_active', label: 'Status', type: 'checkbox', default: true },
];

export default function VendorsPage() {
  return <CrudPage title="Vendors" subtitle="Manage vendor relationships"
    breadcrumb="Home / Operations / Vendors" apiService={vendorsAPI}
    columns={columns} formFields={formFields} addLabel="Add Vendor" />;
}
