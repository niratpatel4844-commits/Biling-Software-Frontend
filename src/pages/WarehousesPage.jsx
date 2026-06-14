import { useState, useEffect } from 'react';
import CrudPage from './CrudPage';
import { warehousesAPI, companiesAPI, branchesAPI, usersAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Warehouse', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'code', label: 'Code', render: (val) => <span className="badge-status badge-info">{val}</span> },
  { key: 'city', label: 'City' },
  { key: 'phone', label: 'Phone' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

export default function WarehousesPage() {
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    companiesAPI.list({ page_size: 100 }).then(r => setCompanies(r.data.items || r.data || [])).catch(() => {});
    branchesAPI.list({ page_size: 100 }).then(r => setBranches(r.data.items || r.data || [])).catch(() => {});
    usersAPI.list({ page_size: 100 }).then(r => setUsers(r.data.items || r.data || [])).catch(() => {});
  }, []);

  const formFields = [
    { key: 'name', label: 'Warehouse Name' },
    { key: 'code', label: 'Warehouse Code' },
    { key: 'company_id', label: 'Company Dropdown', type: 'select', valueType: 'number', options: companies.map(c => ({ value: c.id, label: c.name })) },
    { key: 'branch_id', label: 'Branch Dropdown', type: 'select', valueType: 'number', options: branches.map(b => ({ value: b.id, label: b.name })) },
    { key: 'manager_id', label: 'Manager', type: 'select', valueType: 'number', options: users.map(u => ({ value: u.id, label: u.full_name })) },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'pincode', label: 'Pincode' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'is_active', label: 'Status', type: 'select', options: [{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }], default: true },
  ];

  return <CrudPage title="Warehouses" subtitle="Manage warehouse locations"
    breadcrumb="Home / Management / Warehouses" apiService={warehousesAPI}
    columns={columns} formFields={formFields} addLabel="Add Warehouse" />;
}
