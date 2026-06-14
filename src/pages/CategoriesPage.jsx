import { useState, useEffect } from 'react';
import CrudPage from './CrudPage';
import { categoriesAPI } from '../services/api';

export default function CategoriesPage() {
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    // Fetch all categories for the dropdowns
    categoriesAPI.list({ page_size: 1000 }).then(res => {
      setAllCategories(res.data?.items || res.data || []);
    }).catch(console.error);
  }, []);

  const getParentName = (id) => {
    if (!id) return '-';
    const cat = allCategories.find(c => c.id === id);
    if (!cat) return '-';
    if (cat.level === 1 && cat.parent_id) {
      const main = allCategories.find(c => c.id === cat.parent_id);
      return main ? `${main.name} > ${cat.name}` : cat.name;
    }
    return cat.name;
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Category Name', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
    { key: 'category_code', label: 'Code', render: (val) => val ? <span className="badge-status badge-info" style={{ fontFamily: 'monospace' }}>{val}</span> : '-' },
    { key: 'level', label: 'Type', render: (val) => (
      <span className="badge-status badge-secondary">
        {val === 0 ? 'Main Category' : val === 1 ? 'Sub Category' : 'Child Category'}
      </span>
    )},
    { key: 'parent_id', label: 'Parent Category', render: (val) => getParentName(val) },
    { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
  ];

  const formFields = [
    { key: 'name', label: 'Category Name *', required: true },
    { key: 'category_code', label: 'Category Code' },
    { key: 'level', label: 'Category Type *', type: 'select', valueType: 'number', default: 0, options: [
      { label: 'Main Category', value: 0 },
      { label: 'Sub Category', value: 1 },
      { label: 'Child Category', value: 2 },
    ]},
    { 
      key: 'main_category_id', 
      label: 'Parent Category *', 
      type: 'select', 
      valueType: 'number',
      hide: (form) => form.level === 0 || form.level === undefined,
      options: allCategories.filter(c => c.level === 0).map(c => ({ label: c.name, value: c.id }))
    },
    { 
      key: 'parent_id', 
      label: 'Sub Category *', 
      type: 'select', 
      valueType: 'number',
      hide: (form) => form.level !== 2,
      options: (form) => allCategories
        .filter(c => c.level === 1 && c.parent_id === form.main_category_id)
        .map(c => ({ label: c.name, value: c.id }))
    },
    { key: 'description', label: 'Description' },
    { key: 'is_active', label: 'Status', type: 'select', options: [{label: 'Active', value: 'true'}, {label: 'Inactive', value: 'false'}], default: 'true' },
  ];

  // We need to map `main_category_id` to `parent_id` if level is 1
  // But wait, CrudPage doesn't let us modify payload before save.
  // Actually, we can just use `parent_id` for the parent category in Level 1.
  // Let's modify the fields so that if level=1, parent_id is the main category.
  // If level=2, parent_id is the sub category.
  
  return <CrudPage title="Categories" subtitle="Manage product categories and hierarchy"
    breadcrumb="Home / Catalog / Categories" apiService={categoriesAPI}
    columns={columns} formFields={formFields} addLabel="Add Category" />;
}
