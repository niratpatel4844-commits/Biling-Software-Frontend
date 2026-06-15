import CrudPage from './CrudPage';
import { vendorsAPI } from '../services/api';

const columns = [
  { key: 'vendor_code', label: 'Vendor Code' },
  { key: 'name', label: 'Vendor Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'mobile', label: 'Mobile' },
  { key: 'email', label: 'Email' },
  { key: 'gst_number', label: 'GST Number' },
  { key: 'payment_terms', label: 'Credit Days' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'vendor_code', label: 'Vendor Code (Auto Generate)', section: 'Basic Information' },
  { key: 'name', label: 'Vendor Name', section: 'Basic Information' },
  { key: 'mobile', label: 'Mobile Number', section: 'Basic Information' },
  { key: 'email', label: 'Email', type: 'email', section: 'Basic Information' },
  
  { key: 'address', label: 'Address', section: 'Address Information' },
  { key: 'city', label: 'City', section: 'Address Information' },
  { key: 'state', label: 'State', section: 'Address Information' },
  
  { key: 'gst_number', label: 'GST Number', section: 'Tax Information' },
  
  { key: 'payment_terms', label: 'Credit Days', section: 'Business Settings' },
  
  { key: 'is_active', label: 'Status', type: 'select', valueType: 'boolean', options: [{label: 'Active', value: true}, {label: 'Inactive', value: false}], default: true, section: 'Status' },
];

export default function VendorsPage() {
  return <CrudPage 
    title="Vendors" 
    subtitle="Manage supplier and vendor relationships"
    breadcrumb="Home / Operations / CRM & Vendors / Vendors" 
    apiService={vendorsAPI}
    columns={columns} 
    formFields={formFields} 
    addLabel="Add Vendor" 
  />;
}
