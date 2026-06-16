import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Settings, Building2, Receipt, Palette, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, description: 'Basic application settings' },
    { id: 'company', label: 'Company Profile', icon: Building2, description: 'Business details and logo' },
    { id: 'finance', label: 'Finance & Taxes', icon: Receipt, description: 'Currency, taxation rules' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and branding' }
  ];

  // Default structure to ensure inputs always have a controlled value
  const defaultSettings = {
    general: {
      app_name: { value: 'Biling ERP', description: 'Name of the application' },
      timezone: { value: 'UTC', description: 'System timezone' },
      date_format: { value: 'YYYY-MM-DD', description: 'Format for displaying dates' }
    },
    company: {
      company_name: { value: '', description: 'Official registered company name' },
      company_address: { value: '', description: 'Primary business address' },
      contact_email: { value: '', description: 'Primary contact email' },
      contact_phone: { value: '', description: 'Primary contact phone number' }
    },
    finance: {
      currency: { value: 'INR', description: 'Base currency for all transactions' },
      currency_symbol: { value: '₹', description: 'Symbol to display for currency' },
      default_tax_rate: { value: '18', description: 'Default tax rate percentage' }
    },
    appearance: {
      primary_color: { value: '#4F46E5', description: 'Main accent color' },
      enable_dark_mode: { value: 'true', description: 'Enable dark mode toggle' }
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.getSettings();
      const fetchedSettings = res.data.reduce((acc, curr) => {
        acc[curr.key] = curr;
        return acc;
      }, {});
      
      // Merge fetched settings into our structured format
      const merged = JSON.parse(JSON.stringify(defaultSettings));
      
      Object.keys(merged).forEach(group => {
        Object.keys(merged[group]).forEach(key => {
          if (fetchedSettings[key]) {
            merged[group][key].value = fetchedSettings[key].value || '';
            merged[group][key].id = fetchedSettings[key].id;
          }
        });
      });
      
      setSettings(merged);
    } catch (error) {
      toast.error('Failed to load settings');
    }
    setLoading(false);
  };

  const handleChange = (group, key, value) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: {
          ...prev[group][key],
          value
        }
      }
    }));
  };

  const handleSave = async (group) => {
    setSaving(true);
    try {
      const groupSettings = settings[group];
      const promises = Object.keys(groupSettings).map(key => {
        return settingsAPI.updateSetting(key, {
          value: groupSettings[key].value,
          group: group,
          description: groupSettings[key].description
        });
      });
      
      await Promise.all(promises);
      toast.success(`${tabs.find(t => t.id === group).label} settings saved successfully`);
    } catch (error) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="animate-in" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Loader2 className="spinner" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / System / Settings</div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure application-wide preferences and defaults</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
        
        {/* Settings Navigation */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    border: 'none',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    textAlign: 'left'
                  }}
                  className={!isActive ? 'hover-bg-card-hover' : ''}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>
          
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
              {Object.keys(settings[activeTab] || {}).map(key => {
                const setting = settings[activeTab][key];
                // Human readable label from key
                const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                
                return (
                  <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ marginBottom: '6px' }}>{label}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {key === 'enable_dark_mode' ? (
                        <select 
                          className="form-select" 
                          value={setting.value} 
                          onChange={(e) => handleChange(activeTab, key, e.target.value)}
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      ) : key === 'company_address' ? (
                        <textarea 
                          className="form-input" 
                          rows={3}
                          value={setting.value} 
                          onChange={(e) => handleChange(activeTab, key, e.target.value)}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          style={{ resize: 'vertical' }}
                        />
                      ) : (
                        <input 
                          type="text" 
                          className="form-input" 
                          value={setting.value} 
                          onChange={(e) => handleChange(activeTab, key, e.target.value)}
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      )}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{setting.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSave(activeTab)}
                disabled={saving}
                style={{ padding: '10px 24px' }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
      
      {/* Add hover styling missing in standard CSS via inline style block for this specific interaction */}
      <style>{`
        .hover-bg-card-hover:hover {
          background-color: var(--bg-card-hover) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
