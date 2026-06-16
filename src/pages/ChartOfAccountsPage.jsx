import { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';

export default function ChartOfAccountsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await financeAPI.getAccounts();
        setData(res.data);
      } catch {
        toast.error('Failed to load accounts');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-spinner" style={{ height: '50vh' }}><div className="spinner"></div></div>;

  const columns = [
    { key: 'code', label: 'Code', render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span> },
    { key: 'name', label: 'Account Name' },
    { key: 'group.type', label: 'Account Type', render: (_, row) => (
      <span className={`badge ${row.group.type === 'Asset' ? 'badge-primary' : row.group.type === 'Liability' ? 'badge-danger' : 'badge-info'}`}>
        {row.group.type}
      </span>
    )},
    { key: 'group.name', label: 'Group' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="breadcrumb">Home / Finance / Accounts</div>
        <h1 className="page-title">Chart of Accounts</h1>
        <p className="page-subtitle">Manage your accounting ledgers</p>
      </div>

      <DataTable 
        title="All Accounts" 
        columns={columns} 
        data={data} 
      />
    </div>
  );
}
