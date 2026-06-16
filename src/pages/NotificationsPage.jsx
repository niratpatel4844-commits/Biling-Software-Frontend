import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Bell, Check, CheckCircle2, Clock, Info, AlertTriangle, XCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { is_read: false } : {};
      const res = await notificationsAPI.list(params);
      setNotifications(res.data.items || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      if (filter === 'unread') {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (filter === 'unread') {
        setNotifications([]);
      }
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'success': return <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />;
      case 'warning': return <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />;
      case 'error': return <XCircle size={20} style={{ color: 'var(--danger)' }} />;
      case 'info':
      default: return <Info size={20} style={{ color: 'var(--info)' }} />;
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / System / Notifications</div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ 
                background: 'var(--danger)', 
                color: '#fff', 
                fontSize: '0.9rem', 
                padding: '2px 10px', 
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="page-subtitle">Stay updated with important system alerts and activities</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="dropdown" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px', display: 'flex' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ 
                padding: '6px 16px', 
                background: filter === 'all' ? 'var(--bg-card)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: filter === 'all' ? 600 : 500,
                cursor: 'pointer',
                boxShadow: filter === 'all' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              style={{ 
                padding: '6px 16px', 
                background: filter === 'unread' ? 'var(--bg-card)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: filter === 'unread' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: filter === 'unread' ? 600 : 500,
                cursor: 'pointer',
                boxShadow: filter === 'unread' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              Unread
            </button>
          </div>
          
          <button 
            className="btn btn-outline" 
            onClick={handleMarkAllAsRead}
            disabled={notifications.length === 0 || unreadCount === 0}
          >
            <Check size={16} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>All caught up!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You don't have any {filter === 'unread' ? 'unread ' : ''}notifications at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notification, index) => (
              <div 
                key={notification.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px 24px',
                  borderBottom: index < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  background: notification.is_read ? 'transparent' : 'var(--bg-card-hover)',
                  transition: 'background-color 0.2s',
                  position: 'relative'
                }}
              >
                {!notification.is_read && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--accent)' }}></div>
                )}
                
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--bg-input)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getIconForType(notification.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: notification.is_read ? 500 : 700, 
                      color: 'var(--text-primary)',
                      margin: 0
                    }}>
                      {notification.title}
                    </h4>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      fontSize: '0.8rem', 
                      color: 'var(--text-muted)' 
                    }}>
                      <Clock size={12} />
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
                    {notification.message}
                  </p>
                  
                  {!notification.is_read && (
                    <div style={{ marginTop: '12px' }}>
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'var(--accent)', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
