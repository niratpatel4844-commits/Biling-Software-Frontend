import CrudPage from './CrudPage';
import { warehousesAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Warehouse', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'code', label: 'Code', render: (val) => <span className="badge-status badge-info">{val}</span> },
  { key: 'city', label: 'City' },
  { key: 'phone', label: 'Phone' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'name', label: 'Warehouse Name' },
  { key: 'code', label: 'Warehouse Code' },
  { key: 'company_id', label: 'Company ID', type: 'number' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'phone', label: 'Phone' },
  { key: 'capacity', label: 'Capacity' },
];

export default function WarehousesPage() {
  return <CrudPage title="Warehouses" subtitle="Manage warehouse locations"
    breadcrumb="Home / Management / Warehouses" apiService={warehousesAPI}
    columns={columns} formFields={formFields} addLabel="Add Warehouse" />;
}
