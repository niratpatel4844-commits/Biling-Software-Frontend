import { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';

export default function LedgerPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await financeAPI.getAccounts();
        setAccounts(res.data);
      } catch {
        toast.error('Failed to load accounts');
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccountId) {
      setData(null);
      return;
    }
    const fetchLedger = async () => {
      setLoading(true);
      try {
        const res = await financeAPI.getLedger(selectedAccountId);
        setData(res.data);
      } catch {
        toast.error('Failed to load ledger');
      }
      setLoading(false);
    };
    fetchLedger();
  }, [selectedAccountId]);

  const columns = [
    { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'reference', label: 'Reference', render: (val) => val || '-' },
    { key: 'description', label: 'Description' },
    { key: 'item_description', label: 'Line Detail', render: (val) => val || '-' },
    { key: 'debit', label: 'Debit (₹)', render: (val) => val > 0 ? val.toFixed(2) : '-' },
    { key: 'credit', label: 'Credit (₹)', render: (val) => val > 0 ? val.toFixed(2) : '-' },
    { key: 'balance', label: 'Running Balance (₹)', render: (val) => <span style={{ fontWeight: 600 }}>{val.toFixed(2)}</span> },
  ];

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="breadcrumb">Home / Finance / Ledger</div>
          <h1 className="page-title">General Ledger</h1>
          <p className="page-subtitle">View detailed transactions for any account</p>
        </div>
        <div>
          <select 
            className="form-select" 
            value={selectedAccountId} 
            onChange={e => setSelectedAccountId(e.target.value)}
            style={{ width: '300px' }}
          >
            <option value="">-- Select an Account --</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.group?.type})</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="loading-spinner"><div className="spinner"></div></div>}
      
      {!loading && !data && selectedAccountId && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>
      )}

      {!loading && !selectedAccountId && (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Please select an account from the dropdown above to view its ledger.
        </div>
      )}

      {!loading && data && (
        <>
          <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-title">Account Name</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '8px' }}>{data.account.name}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Account Type</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '8px' }}>{data.account.type}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Current Balance</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '8px', color: 'var(--primary)' }}>₹{data.current_balance.toFixed(2)}</div>
            </div>
          </div>

          <DataTable 
            title={`Transactions - ${data.account.code}`} 
            columns={columns} 
            data={data.transactions} 
            pagination={false}
          />
        </>
      )}
    </div>
  );
}
