import { useState, useEffect } from 'react';
import CrudPage from './CrudPage';
import { franchisesAPI, companiesAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Franchise', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'code', label: 'Code', render: (val) => <span className="badge-status badge-info">{val}</span> },
  { key: 'owner_name', label: 'Owner' },
  { key: 'commission_percent', label: 'Commission %' },
  { key: 'royalty_percent', label: 'Royalty %' },
  { key: 'status', label: 'Status', render: (val) => {
    const cls = val === 'approved' ? 'badge-active' : val === 'suspended' ? 'badge-inactive' : 'badge-pending';
    return <span className={`badge-status ${cls}`} style={{ textTransform: 'capitalize' }}>{val}</span>;
  }},
];

export default function FranchisesPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    companiesAPI.list({ page_size: 100 }).then(r => setCompanies(r.data.items || r.data || []));
  }, []);

  const formFields = [
    { key: 'name', label: 'Franchise Name *' },
    { key: 'code', label: 'Franchise Code *' },
    { key: 'company_id', label: 'Company *', type: 'select', options: companies.map(c => ({ label: c.name, value: c.id })) },
    { key: 'owner_name', label: 'Owner Name *' },
    { key: 'owner_mobile', label: 'Owner Mobile *' },
    { key: 'owner_email', label: 'Owner Email *', type: 'email' },
    { key: 'gst_number', label: 'GST Number' },
    { key: 'pan_number', label: 'PAN Number' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country', default: 'India' },
    { key: 'pincode', label: 'Pincode' },
    { key: 'commission_percent', label: 'Commission %', type: 'number' },
    { key: 'royalty_percent', label: 'Royalty %', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Suspended', value: 'suspended' },
      { label: 'Terminated', value: 'terminated' }
    ], default: 'pending' },
    { key: 'is_active', label: 'Is Active', type: 'select', options: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }], default: 'true' }
  ];

  return <CrudPage title="Franchises" subtitle="Manage franchise network"
    breadcrumb="Home / Management / Franchises" apiService={franchisesAPI}
    columns={columns} formFields={formFields} addLabel="Add Franchise" />;
}
