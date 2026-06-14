import CrudPage from './CrudPage';
import { customersAPI } from '../services/api';

const columns = [
  { key: 'customer_code', label: 'Code' },
  { key: 'name', label: 'Customer', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'contact_person', label: 'Contact Person' },
  { key: 'gst_number', label: 'GST Number' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'city', label: 'City' },
  { key: 'outstanding_amount', label: 'Outstanding', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '₹0' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'customer_code', label: 'Customer Code (Auto)' },
  { key: 'name', label: 'Customer Name' },
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
  { key: 'credit_limit', label: 'Credit Limit', type: 'number', default: 0 },
  { key: 'notes', label: 'Notes' },
  { key: 'is_active', label: 'Status', type: 'checkbox', default: true },
];

export default function CustomersPage() {
  return <CrudPage title="Customers" subtitle="Manage customer database"
    breadcrumb="Home / Operations / Customers" apiService={customersAPI}
    columns={columns} formFields={formFields} addLabel="Add Customer" />;
}
