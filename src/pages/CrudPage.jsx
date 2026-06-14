import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CrudPage({ title, subtitle, breadcrumb, apiService, columns, formFields, addLabel }) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [searchTimer, setSearchTimer] = useState(null);

  const defaultForm = () => {
    const f = {};
    formFields.forEach(ff => f[ff.key] = ff.default || '');
    return f;
  };

  const fetchData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await apiService.list({ page, page_size: 20, search });
      if (Array.isArray(res.data)) {
        let items = res.data;
        if (search) {
          const s = search.toLowerCase();
          items = items.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(s)));
        }
        setData({
          items: items.slice((page - 1) * 20, page * 20),
          total: items.length,
          page,
          page_size: 20,
          total_pages: Math.ceil(items.length / 20) || 1
        });
      } else {
        setData(res.data);
      }
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  }, [apiService]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (val) => {
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchData(1, val), 400));
  };

  const openCreate = () => { setEditing(null); setForm(defaultForm()); setShowModal(true); };

  const openEdit = (row) => {
    setEditing(row);
    const f = {};
    formFields.forEach(ff => f[ff.key] = row[ff.key] ?? ff.default ?? '');
    setForm(f);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

      if (editing) { await apiService.update(editing.id, payload); toast.success('Updated successfully'); }
      else { await apiService.create(payload); toast.success('Created successfully'); }
      setShowModal(false); fetchData(data.page);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail[0].msg);
      } else {
        toast.error(detail || 'Error saving');
      }
    }
  };

  const handleDelete = (id) => {
    setDeleteModal({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await apiService.delete(deleteModal.id);
      toast.success('Deleted successfully');
      fetchData(data.page);
      setDeleteModal({ show: false, id: null });
    }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">{breadcrumb}</div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      <DataTable title={title} columns={columns} data={data.items} total={data.total}
        page={data.page} pageSize={data.page_size} totalPages={data.total_pages}
        loading={loading} onPageChange={(p) => fetchData(p)} onSearch={handleSearch}
        onAdd={openCreate} addLabel={addLabel || 'Add New'}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(row)}><Edit size={14} /></button>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => handleDelete(row.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
          </div>
        )}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? `Edit ${title.replace(/s$/, '')}` : `Add ${title.replace(/s$/, '')}`}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
          {(() => {
            const sections = {};
            const noSection = [];
            formFields.forEach(ff => {
              if (ff.hide && ff.hide(form)) return;
              if (ff.section) {
                if (!sections[ff.section]) sections[ff.section] = [];
                sections[ff.section].push(ff);
              } else {
                noSection.push(ff);
              }
            });

            const renderField = (ff) => (
              <div className="form-group" key={ff.key}>
                <label className="form-label">{ff.label}</label>
                {ff.type === 'select' ? (
                  <select className="form-select" value={form[ff.key] !== undefined && form[ff.key] !== null ? String(form[ff.key]) : ''} onChange={(e) => {
                    let val = e.target.value;
                    if (val === 'true') val = true;
                    else if (val === 'false') val = false;
                    else if (ff.valueType === 'number' && val !== '') val = Number(val);
                    setForm({ ...form, [ff.key]: val });
                  }}>
                    <option value="">Select...</option>
                    {(typeof ff.options === 'function' ? ff.options(form) : ff.options)?.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
                  </select>
                ) : (
                  <input className="form-input" type={ff.type || 'text'} value={form[ff.key] || ''}
                    onChange={(e) => setForm({ ...form, [ff.key]: ff.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value })}
                    placeholder={ff.placeholder || ''} />
                )}
              </div>
            );

            return (
              <>
                {noSection.length > 0 && (
                  <div className="grid-2">
                    {noSection.map(ff => renderField(ff))}
                  </div>
                )}
                {Object.entries(sections).map(([sectionName, fields]) => (
                  <div key={sectionName}>
                    <h4 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--primary)' }}>{sectionName}</h4>
                    <div className="grid-2">
                      {fields.map(ff => renderField(ff))}
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      </Modal>

      <Modal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, id: null })} title="Confirm Delete"
        footer={<><button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, id: null })}>Cancel</button><button className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={confirmDelete}>Delete</button></>}>
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', marginBottom: 16 }}>
            <Trash2 size={32} color="var(--danger)" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--text-primary)' }}>Are you absolutely sure?</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
            This action cannot be undone. This will permanently delete this record and remove its data from the server.
          </p>
        </div>
      </Modal>
    </div>
  );
}
