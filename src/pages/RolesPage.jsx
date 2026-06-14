import { useState, useEffect } from 'react';
import { rolesAPI } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Edit, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, roleId: null });
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [form, setForm] = useState({ name: '', display_name: '', description: '', allow_company: true, allow_branch: false, allow_franchise: false, allow_warehouse: false });

  useEffect(() => {
    Promise.all([rolesAPI.list(), rolesAPI.listPermissions()])
      .then(([r, p]) => { setRoles(r.data); setPermissions(p.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      if (editing) { await rolesAPI.update(editing.id, form); toast.success('Updated'); }
      else { await rolesAPI.create(form); toast.success('Created'); }
      setShowModal(false);
      const r = await rolesAPI.list(); setRoles(r.data);
    } catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = (id) => {
    setDeleteModal({ show: true, roleId: id });
  };

  const confirmDelete = async () => {
    try { 
      await rolesAPI.delete(deleteModal.roleId); 
      toast.success('Deleted'); 
      const r = await rolesAPI.list(); 
      setRoles(r.data); 
      setDeleteModal({ show: false, roleId: null });
    }
    catch (err) { toast.error(err.response?.data?.detail || 'Cannot delete'); }
  };

  const openPermissions = (role) => { setSelectedRole(role); setSelectedPerms([]); setShowPermModal(true); };

  const savePermissions = async () => {
    try {
      await rolesAPI.assignPermissions(selectedRole.id, { permission_ids: selectedPerms });
      toast.success('Permissions updated');
      setShowPermModal(false);
    } catch (err) { toast.error('Failed'); }
  };

  const togglePerm = (id) => {
    setSelectedPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  // Group permissions by module
  const groupedPerms = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'display_name', label: 'Role', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span> },
    { key: 'name', label: 'Slug', render: (val) => <span className="badge-status badge-info" style={{ fontFamily: 'monospace' }}>{val}</span> },
    { key: 'is_system', label: 'Type', render: (val) => <span className={`badge-status ${val ? 'badge-pending' : 'badge-active'}`}>{val ? 'System' : 'Custom'}</span> },
    { key: 'is_active', label: 'Status', render: (val) => <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>{val ? 'Active' : 'Inactive'}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Management / Roles</div>
          <h1 className="page-title">Roles & Permissions</h1>
          <p className="page-subtitle">Manage roles and granular access control</p>
        </div>
      </div>

      <DataTable title="Roles" columns={columns}
        data={roles.filter(r => r.display_name.toLowerCase().includes(searchQuery.toLowerCase()) || r.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
        total={roles.filter(r => r.display_name.toLowerCase().includes(searchQuery.toLowerCase()) || r.name.toLowerCase().includes(searchQuery.toLowerCase())).length} 
        page={1} pageSize={100} totalPages={1}
        loading={loading} onSearch={(val) => setSearchQuery(val)} onAdd={() => { setEditing(null); setForm({ name: '', display_name: '', description: '', allow_company: true, allow_branch: false, allow_franchise: false, allow_warehouse: false }); setShowModal(true); }}
        addLabel="Add Role"
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openPermissions(row)} title="Permissions"><Shield size={14} /></button>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditing(row); setForm({ name: row.name, display_name: row.display_name, description: row.description || '', allow_company: row.allow_company ?? true, allow_branch: row.allow_branch ?? false, allow_franchise: row.allow_franchise ?? false, allow_warehouse: row.allow_warehouse ?? false }); setShowModal(true); }}><Edit size={14} /></button>
            {!row.is_system && <button className="btn btn-secondary btn-sm btn-icon" onClick={() => handleDelete(row.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>}
          </div>
        )}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Role' : 'Create Role'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save</button></>}>
        <div className="form-group"><label className="form-label">Role Name (slug)</label><input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. regional_manager" /></div>
        <div className="form-group"><label className="form-label">Display Name</label><input className="form-input" value={form.display_name} onChange={(e) => setForm({...form, display_name: e.target.value})} /></div>
        <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
        
        <div style={{ marginTop: 24, marginBottom: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)' }}>Assignment Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.allow_company} onChange={(e) => setForm({...form, allow_company: e.target.checked})} style={{ accentColor: 'var(--accent)' }} />
            Company Assignment
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.allow_branch} onChange={(e) => setForm({...form, allow_branch: e.target.checked})} style={{ accentColor: 'var(--accent)' }} />
            Branch Assignment
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.allow_franchise} onChange={(e) => setForm({...form, allow_franchise: e.target.checked})} style={{ accentColor: 'var(--accent)' }} />
            Franchise Assignment
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.allow_warehouse} onChange={(e) => setForm({...form, allow_warehouse: e.target.checked})} style={{ accentColor: 'var(--accent)' }} />
            Warehouse Assignment
          </label>
        </div>
      </Modal>

      <Modal isOpen={showPermModal} onClose={() => setShowPermModal(false)} title={`Permissions: ${selectedRole?.display_name}`}
        footer={<><button className="btn btn-secondary" onClick={() => setShowPermModal(false)}>Cancel</button><button className="btn btn-primary" onClick={savePermissions}>Save Permissions</button></>}>
        {Object.entries(groupedPerms).map(([module, perms]) => (
          <div key={module} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>{module.replace('_', ' ')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {perms.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: selectedPerms.includes(p.id) ? 'var(--accent-glow)' : 'var(--bg-input)', border: `1px solid ${selectedPerms.includes(p.id) ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={selectedPerms.includes(p.id)} onChange={() => togglePerm(p.id)} style={{ accentColor: 'var(--accent)' }} />
                  {p.action}
                </label>
              ))}
            </div>
          </div>
        ))}
      </Modal>

      <Modal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, roleId: null })} title="Confirm Delete"
        footer={<><button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, roleId: null })}>Cancel</button><button className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={confirmDelete}>Delete</button></>}>
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', marginBottom: 16 }}>
            <Trash2 size={32} color="var(--danger)" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--text-primary)' }}>Are you absolutely sure?</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
            This action cannot be undone. This will permanently delete the role and remove its permissions from the server.
          </p>
        </div>
      </Modal>
    </div>
  );
}
