import { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';
import DataTable from '../components/DataTable';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JournalEntriesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    items: [
      { account_id: '', debit: '', credit: '', description: '' },
      { account_id: '', debit: '', credit: '', description: '' }
    ]
  });

  useEffect(() => {
    fetchEntries();
    fetchAccounts();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await financeAPI.getJournalEntries();
      setData(res.data);
    } catch {
      toast.error('Failed to load journal entries');
    }
    setLoading(false);
  };

  const fetchAccounts = async () => {
    try {
      const res = await financeAPI.getAccounts();
      setAccounts(res.data);
    } catch {
      toast.error('Failed to load accounts');
    }
  };

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { account_id: '', debit: '', credit: '', description: '' }] });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-clear opposite field if one is filled
    if (field === 'debit' && value !== '') newItems[index]['credit'] = '';
    if (field === 'credit' && value !== '') newItems[index]['debit'] = '';
    
    setFormData({ ...formData, items: newItems });
  };

  const totalDebit = formData.items.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
  const totalCredit = formData.items.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalanced) {
      toast.error('Journal entry is not balanced. Total Debits must equal Total Credits.');
      return;
    }
    
    const hasEmptyAccount = formData.items.some(item => !item.account_id);
    if (hasEmptyAccount) {
      toast.error('Please select an account for all line items.');
      return;
    }
    
    const payload = {
      date: formData.date + 'T00:00:00.000Z',
      reference: formData.reference,
      description: formData.description,
      items: formData.items.map(item => ({
        account_id: parseInt(item.account_id),
        debit: parseFloat(item.debit) || 0,
        credit: parseFloat(item.credit) || 0,
        description: item.description
      }))
    };

    setIsSubmitting(true);
    try {
      await financeAPI.createJournalEntry(payload);
      toast.success('Journal entry created successfully!');
      setShowModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        items: [
          { account_id: '', debit: '', credit: '', description: '' },
          { account_id: '', debit: '', credit: '', description: '' }
        ]
      });
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create journal entry');
    }
    setIsSubmitting(false);
  };

  const columns = [
    { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'reference', label: 'Reference', render: (val) => <span style={{ fontWeight: 600 }}>{val || '-'}</span> },
    { key: 'description', label: 'Description' },
    { key: 'id', label: 'Total Amount', render: (_, row) => {
      const rowDebit = row.items.reduce((sum, item) => sum + item.debit, 0);
      return `₹${rowDebit.toFixed(2)}`;
    }},
    { key: 'items', label: 'Items', render: (items) => (
      <div style={{ fontSize: '0.85rem' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none', padding: '4px 0' }}>
            <span>{item.account?.name}</span>
            <span style={{ fontFamily: 'monospace' }}>
              {item.debit > 0 ? `Dr ${item.debit}` : `Cr ${item.credit}`}
            </span>
          </div>
        ))}
      </div>
    )}
  ];

  return (
    <>
      <div className="animate-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="breadcrumb">Home / Finance / Journal</div>
            <h1 className="page-title">Journal Entries</h1>
            <p className="page-subtitle">View and add manual accounting entries</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            New Journal Entry
          </button>
        </div>

        <DataTable 
          title="Recent Journal Entries" 
          columns={columns} 
          data={data} 
          loading={loading}
        />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '800px', maxWidth: '95vw' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Journal Entry</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(90vh - 70px)' }}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date <span style={{color: 'var(--danger)'}}>*</span></label>
                    <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Reference #</label>
                    <input type="text" className="form-input" placeholder="e.g. JRN-001" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                    <label className="form-label">Description <span style={{color: 'var(--danger)'}}>*</span></label>
                    <input type="text" className="form-input" placeholder="Reason for this entry" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>Line Items</h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ marginBottom: '16px', minWidth: '600px' }}>
                    <thead>
                      <tr>
                        <th width="35%">Account</th>
                        <th width="25%">Description</th>
                        <th width="15%" style={{ textAlign: 'right' }}>Debit</th>
                        <th width="15%" style={{ textAlign: 'right' }}>Credit</th>
                        <th width="10%"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <select className="form-select" value={item.account_id} onChange={e => handleItemChange(idx, 'account_id', e.target.value)} required>
                              <option value="">Select Account</option>
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input type="text" className="form-input" placeholder="Optional" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
                          </td>
                          <td>
                            <input type="number" min="0" step="0.01" className="form-input" style={{ textAlign: 'right' }} value={item.debit} onChange={e => handleItemChange(idx, 'debit', e.target.value)} disabled={item.credit !== '' && parseFloat(item.credit) > 0} />
                          </td>
                          <td>
                            <input type="number" min="0" step="0.01" className="form-input" style={{ textAlign: 'right' }} value={item.credit} onChange={e => handleItemChange(idx, 'credit', e.target.value)} disabled={item.debit !== '' && parseFloat(item.debit) > 0} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => handleRemoveItem(idx)} disabled={formData.items.length <= 2} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: formData.items.length <= 2 ? 'not-allowed' : 'pointer', opacity: formData.items.length <= 2 ? 0.5 : 1, padding: '8px', borderRadius: '4px', transition: 'background-color 0.2s' }} title="Remove item">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="5" style={{ paddingTop: '12px' }}>
                          <button type="button" className="btn btn-outline" onClick={handleAddItem} style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Plus size={14} /> Add Line
                          </button>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'right', fontWeight: 600, paddingRight: '16px' }}>Totals</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: isBalanced ? 'var(--text-primary)' : 'var(--danger)' }}>₹{totalDebit.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: isBalanced ? 'var(--text-primary)' : 'var(--danger)' }}>₹{totalCredit.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {!isBalanced && totalDebit > 0 && totalCredit > 0 && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '8px', textAlign: 'right', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                     <AlertCircle size={14} /> Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}. Entry must balance before saving.
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isBalanced || (totalDebit === 0 && totalCredit === 0)}>
                  {isSubmitting ? 'Saving...' : 'Save Journal Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
