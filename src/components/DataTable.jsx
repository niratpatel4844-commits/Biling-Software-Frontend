import { useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react';

export default function DataTable({ title, columns, data, total, page, pageSize, totalPages, onPageChange, onSearch, onAdd, addLabel, loading, actions }) {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="data-table-wrapper">
      <div className="table-header">
        <div>
          <h3 className="table-title">{title}</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total || 0} total records</span>
        </div>
        <div className="table-actions">
          <div className="header-search" style={{ minWidth: 220 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search..." value={search} onChange={handleSearch} autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
          </div>
          {onAdd && (
            <button className="btn btn-primary btn-sm" onClick={onAdd}>
              <Plus size={16} /> {addLabel || 'Add New'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : data?.length === 0 ? (
        <div className="empty-state">
          <h3>No data found</h3>
          <p>Try adjusting your search or add a new record</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data?.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row[col.key], row, i) : row[col.key]}</td>
                ))}
                {actions && <td>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => onPageChange?.(page - 1)} disabled={page <= 1}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            if (p > totalPages) return null;
            return (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange?.(p)}>
                {p}
              </button>
            );
          })}
          <button className="page-btn" onClick={() => onPageChange?.(page + 1)} disabled={page >= totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
