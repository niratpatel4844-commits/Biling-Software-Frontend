import CrudPage from './CrudPage';
import { brandsAPI } from '../services/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Brand Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
  { key: 'brand_code', label: 'Code', render: (val) => <span className="badge-status badge-info" style={{ fontFamily: 'monospace' }}>{val}</span> },
  { key: 'description', label: 'Description' },
  { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
];

const formFields = [
  { key: 'name', label: 'Brand Name *', required: true },
  { key: 'brand_code', label: 'Brand Code' },
  { key: 'description', label: 'Description' },
  { key: 'logo', label: 'Logo URL' },
  { key: 'is_active', label: 'Status', type: 'select', options: [{label: 'Active', value: 'true'}, {label: 'Inactive', value: 'false'}], default: 'true' },
];

export default function BrandsPage() {
  return <CrudPage title="Brands" subtitle="Manage product brands"
    breadcrumb="Home / Catalog / Brands" apiService={brandsAPI}
    columns={columns} formFields={formFields} addLabel="Add Brand" />;
}
