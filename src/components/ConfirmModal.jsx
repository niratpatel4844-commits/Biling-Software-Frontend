import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'primary', loading = false }) {
  const getIconColor = () => {
    if (type === 'danger') return 'var(--danger)';
    if (type === 'warning') return 'var(--warning)';
    return 'var(--primary)';
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, width: '100%' }}>
      <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button className={`btn btn-${type}`} onClick={onConfirm} disabled={loading}>
        {loading ? 'Processing...' : confirmText}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ 
          background: `${getIconColor()}15`, 
          color: getIconColor(),
          padding: 12, 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle size={24} />
        </div>
        <div style={{ paddingTop: 4 }}>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}
