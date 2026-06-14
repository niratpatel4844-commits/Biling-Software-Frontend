import CrudPage from './CrudPage';
import { unitsAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Unit Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'code', label: 'Code', render: (val) => <span className="badge-status badge-info" style={{ fontFamily: 'monospace' }}>{val}</span> },
  { key: 'description', label: 'Description' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'name', label: 'Unit Name *', required: true },
  { key: 'code', label: 'Unit Code *', required: true },
  { key: 'description', label: 'Description' },
  { key: 'is_active', label: 'Status', type: 'select', options: [{label: 'Active', value: 'true'}, {label: 'Inactive', value: 'false'}], default: 'true' },
];

export default function UnitsPage() {
  return <CrudPage title="Units" subtitle="Manage product units"
    breadcrumb="Home / Catalog / Units" apiService={unitsAPI}
    columns={columns} formFields={formFields} addLabel="Add Unit" />;
}
