import { useState, useEffect, useCallback } from 'react';
import { usersAPI, rolesAPI, companiesAPI, branchesAPI } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Edit, Trash2, RotateCcw, LogOut, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', mobile: '', password: '', confirm_password: '', role_id: '', company_id: '', branch_id: '', is_active: true });
  const [searchTimer, setSearchTimer] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetModal, setResetModal] = useState({ show: false, userId: null, password: '', confirm_password: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await usersAPI.list({ page, page_size: 20, search });
      setData(res.data);
    } catch (err) { toast.error('Failed to load users'); }
    setLoading(false);
  }, []);

  useEffect(() => { 
    fetchUsers(); 
    rolesAPI.list().then(r => setRoles(r.data)).catch(() => {}); 
    companiesAPI.list({ page_size: 100 }).then(r => setCompanies(r.data.items || r.data || [])).catch(() => {});
    branchesAPI.list({ page_size: 100 }).then(r => setBranches(r.data.items || r.data || [])).catch(() => {});
  }, [fetchUsers]);

  const handleSearch = (val) => {
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchUsers(1, val), 400));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ full_name: '', email: '', mobile: '', password: '', confirm_password: '', role_id: '', company_id: '', branch_id: '', is_active: true });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ full_name: user.full_name, email: user.email, mobile: user.mobile || '', role_id: user.role_id || '', company_id: user.company_id || '', branch_id: user.branch_id || '', is_active: user.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing && form.password !== form.confirm_password) {
      return toast.error('Passwords do not match');
    }
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

      if (editing) {
        await usersAPI.update(editing.id, payload);
        toast.success('User updated');
      } else {
        await usersAPI.create(payload);
        toast.success('User created');
      }
      setShowModal(false);
      fetchUsers(data.page);
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
    setDeleteModal({ show: true, userId: id });
  };

  const confirmDelete = async () => {
    try { 
      await usersAPI.delete(deleteModal.userId); 
      toast.success('User deleted'); 
      fetchUsers(data.page); 
      setDeleteModal({ show: false, userId: null });
    }
    catch (err) { toast.error('Failed to delete'); }
  };

  const openResetPassword = (id) => {
    setResetModal({ show: true, userId: id, password: '', confirm_password: '' });
  };

  const submitResetPassword = async () => {
    if (resetModal.password !== resetModal.confirm_password) {
      return toast.error('Passwords do not match');
    }
    if (resetModal.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      await usersAPI.resetPassword(resetModal.userId, { password: resetModal.password });
      toast.success('Password reset successfully');
      setResetModal({ show: false, userId: null, password: '', confirm_password: '' });
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  const columns = [
    { key: 'id', label: 'ID', render: (val, row, index) => ((data.page - 1) * data.page_size) + index + 1 },
    { key: 'full_name', label: 'Name', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{val?.charAt(0)}</div>
        <div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.designation || ''}</div></div>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'is_active', label: 'Status', render: (val) => (
      <span className={`badge-status ${val ? 'badge-active' : 'badge-inactive'}`}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
        {val ? 'Active' : 'Inactive'}
      </span>
    )},
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Management / Users</div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all system users and their access</p>
        </div>
      </div>

      <DataTable
        title="Users" columns={columns} data={data.items}
        total={data.total} page={data.page} pageSize={data.page_size}
        totalPages={data.total_pages} loading={loading}
        onPageChange={(p) => fetchUsers(p)} onSearch={handleSearch}
        onAdd={openCreate} addLabel="Add User"
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(row)} title="Edit"><Edit size={14} /></button>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openResetPassword(row.id)} title="Reset Password"><RotateCcw size={14} /></button>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => handleDelete(row.id)} title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
          </div>
        )}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit User' : 'Create User'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save</button></>}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile</label>
            <input className="form-input" value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})} />
          </div>
          {!editing && <>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type={showPassword ? 'text' : 'password'} value={form.confirm_password} onChange={(e) => setForm({...form, confirm_password: e.target.value})} />
            </div>
          </>}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role_id} onChange={(e) => setForm({...form, role_id: e.target.value ? parseInt(e.target.value) : ''})}>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.display_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <select className="form-select" value={form.company_id || ''} onChange={(e) => setForm({...form, company_id: e.target.value ? parseInt(e.target.value) : '', branch_id: ''})}>
              <option value="">Select Company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Branch</label>
            <select className="form-select" value={form.branch_id || ''} onChange={(e) => setForm({...form, branch_id: e.target.value ? parseInt(e.target.value) : ''})} disabled={!form.company_id}>
              <option value="">Select Branch</option>
              {branches.filter(b => b.company_id === form.company_id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.is_active ? 'true' : 'false'} onChange={(e) => setForm({...form, is_active: e.target.value === 'true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal isOpen={resetModal.show} onClose={() => setResetModal({ ...resetModal, show: false })} title="Reset Password"
        footer={<><button className="btn btn-secondary" onClick={() => setResetModal({ ...resetModal, show: false })}>Cancel</button><button className="btn btn-primary" onClick={submitResetPassword}>Save</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPassword ? 'text' : 'password'} value={resetModal.password} onChange={(e) => setResetModal({...resetModal, password: e.target.value})} style={{ paddingRight: 40 }} autoComplete="new-password" data-lpignore="true" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type={showPassword ? 'text' : 'password'} value={resetModal.confirm_password} onChange={(e) => setResetModal({...resetModal, confirm_password: e.target.value})} autoComplete="new-password" data-lpignore="true" />
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, userId: null })} title="Confirm Delete"
        footer={<><button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, userId: null })}>Cancel</button><button className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={confirmDelete}>Delete</button></>}>
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', marginBottom: 16 }}>
            <Trash2 size={32} color="var(--danger)" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--text-primary)' }}>Are you absolutely sure?</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
            This action cannot be undone. This will permanently delete the user's account and remove their data from the server.
          </p>
        </div>
      </Modal>
    </div>
  );
}
