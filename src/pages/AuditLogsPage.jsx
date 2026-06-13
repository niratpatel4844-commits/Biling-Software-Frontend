import { useState, useEffect, useCallback } from 'react';
import { auditLogsAPI } from '../services/api';
import DataTable from '../components/DataTable';
import { Clock, User, Globe, Monitor } from 'lucide-react';

export default function AuditLogsPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 50, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTimer, setSearchTimer] = useState(null);

  const fetch = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try { const r = await auditLogsAPI.list({ page, page_size: 50, search }); setData(r.data); }
    catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (val) => {
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetch(1, val), 400));
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'action', label: 'Action', render: (val) => {
      const colors = { login: 'badge-active', logout: 'badge-info', create: 'badge-active', update: 'badge-pending', delete: 'badge-inactive' };
      return <span className={`badge-status ${colors[val] || 'badge-info'}`}>{val}</span>;
    }},
    { key: 'module', label: 'Module' },
    { key: 'details', label: 'Details', render: (val) => <span style={{ maxWidth: 300, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span> },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'user_id', label: 'User ID' },
    { key: 'created_at', label: 'Timestamp', render: (val) => val ? new Date(val).toLocaleString() : '-' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / System / Audit Logs</div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track all system activities and user actions</p>
        </div>
      </div>
      <DataTable title="Audit Trail" columns={columns} data={data.items}
        total={data.total} page={data.page} pageSize={data.page_size}
        totalPages={data.total_pages} loading={loading}
        onPageChange={(p) => fetch(p)} onSearch={handleSearch} />
    </div>
  );
}
