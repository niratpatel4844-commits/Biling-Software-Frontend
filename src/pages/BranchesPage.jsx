import { useState, useEffect } from 'react';
import CrudPage from './CrudPage';
import { branchesAPI, companiesAPI, usersAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Branch Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'code', label: 'Code', render: (val) => <span className="badge-status badge-info">{val}</span> },
  { key: 'city', label: 'City' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

export default function BranchesPage() {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    companiesAPI.list({ page_size: 100 }).then(r => setCompanies(r.data.items || r.data || []));
    usersAPI.list({ page_size: 100 }).then(r => setUsers(r.data.items || r.data || []));
  }, []);

  const formFields = [
    { key: 'company_id', label: 'Company *', type: 'select', options: companies.map(c => ({ label: c.name, value: c.id })) },
    { key: 'name', label: 'Branch Name *' },
    { key: 'code', label: 'Branch Code *' },
    { key: 'gst_number', label: 'GST Number' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country', default: 'India' },
    { key: 'pincode', label: 'Pincode' },
    { key: 'manager_id', label: 'Branch Manager', type: 'select', options: users.map(u => ({ label: u.full_name, value: u.id })) },
    { key: 'is_active', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }], default: 'true' }
  ];

  return <CrudPage title="Branches" subtitle="Manage all branches across the organization"
    breadcrumb="Home / Management / Branches" apiService={branchesAPI}
    columns={columns} formFields={formFields} addLabel="Add Branch" />;
}
