import CrudPage from './CrudPage';
import { companiesAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Company Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'gst_number', label: 'GST' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'city', label: 'City' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'name', label: 'Company Name *' },
  { key: 'company_code', label: 'Company Code *' },
  { key: 'gst_number', label: 'GST Number' },
  { key: 'pan_number', label: 'PAN Number' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Mobile' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country', default: 'India' },
  { key: 'pincode', label: 'Pincode' },
  { key: 'logo', label: 'Logo URL (optional)' },
  { key: 'is_active', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }], default: 'true' }
];

export default function CompaniesPage() {
  return <CrudPage title="Companies" subtitle="Manage all registered companies"
    breadcrumb="Home / Management / Companies" apiService={companiesAPI}
    columns={columns} formFields={formFields} addLabel="Add Company" />;
}
