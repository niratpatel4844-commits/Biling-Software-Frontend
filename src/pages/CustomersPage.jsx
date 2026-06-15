import CrudPage from './CrudPage';
import { customersAPI } from '../services/api';

const columns = [
  { key: 'customer_code', label: 'Code' },
  { key: 'name', label: 'Customer Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'mobile', label: 'Mobile' },
  { key: 'email', label: 'Email' },
  { key: 'gst_number', label: 'GST Number' },
  { key: 'credit_limit', label: 'Credit Limit', render: (val) => val ? `₹${Number(val).toLocaleString()}` : '₹0' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'customer_code', label: 'Customer Code (Auto Generate)', section: 'Basic Information' },
  { key: 'name', label: 'Customer Name', section: 'Basic Information' },
  { key: 'mobile', label: 'Mobile Number', section: 'Basic Information' },
  { key: 'email', label: 'Email', type: 'email', section: 'Basic Information' },
  
  { key: 'address', label: 'Address', section: 'Address Information' },
  { key: 'city', label: 'City', section: 'Address Information' },
  { key: 'state', label: 'State', section: 'Address Information' },
  
  { key: 'gst_number', label: 'GST Number', section: 'Tax Information' },
  
  { key: 'credit_limit', label: 'Credit Limit', type: 'number', default: 0, section: 'Business Settings' },
  
  { key: 'is_active', label: 'Status', type: 'select', valueType: 'boolean', options: [{label: 'Active', value: true}, {label: 'Inactive', value: false}], default: true, section: 'Status' },
];

export default function CustomersPage() {
  return <CrudPage 
    title="Customers" 
    subtitle="Manage customer database"
    breadcrumb="Home / Operations / CRM & Vendors / Customers" 
    apiService={customersAPI}
    columns={columns} 
    formFields={formFields} 
    addLabel="Add Customer" 
  />;
}
