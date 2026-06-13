import CrudPage from './CrudPage';
import { customersAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Customer', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'city', label: 'City' },
  { key: 'outstanding_amount', label: 'Outstanding', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '₹0' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'name', label: 'Customer Name' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'gst_number', label: 'GST Number' },
  { key: 'credit_limit', label: 'Credit Limit', type: 'number', default: 0 },
];

export default function CustomersPage() {
  return <CrudPage title="Customers" subtitle="Manage customer database"
    breadcrumb="Home / Operations / Customers" apiService={customersAPI}
    columns={columns} formFields={formFields} addLabel="Add Customer" />;
}
