import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import api from '../utils/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isDemo, showToast } = useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState({ field: '', value: '' });

  const stats = [
    { label: 'Member Since', value: 'June 2026' },
    { label: 'Transactions', value: user?.isDemo ? '30+' : 'Cloud Sync' },
    { label: 'Goals', value: user?.isDemo ? '4' : 'Active' },
  ];

  const handleChangePhoto = () => {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      showToast('Photo upload coming soon! 📸');
    } else {
      showToast('Camera not available', 'error');
    }
  };

  const handleEditField = (field, currentValue) => {
    setEditField({ field, value: currentValue });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editField.value.trim()) {
      showToast('Please enter a value', 'error');
      return;
    }
    
    if (isDemo) {
      showToast(`${editField.field} updated (demo mode) ✨`);
    } else {
      // API call would go here
      showToast(`${editField.field} updated successfully!`);
    }
    
    setShowEditModal(false);
  };

  const handleChangePin = async () => {
    const newPin = prompt("Enter new 4-digit security PIN:");
    if (newPin === null) return;
    if (!/^\d{4}$/.test(newPin)) {
      showToast('PIN must be exactly 4 digits.', 'error');
      return;
    }
    if (isDemo) {
      showToast('PIN set (demo mode) ✨');
    } else {
      try {
        await api.post('/auth/set-pin', { pin: newPin });
        showToast('PIN set successfully! 🔐');
        useStore.setState((s) => ({ user: { ...s.user, pinEnabled: true } }));
      } catch (err) {
        showToast('Failed to set PIN', 'error');
      }
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your data. Continue?')) {
        showToast('Account deleted. Redirecting...', 'error');
        setTimeout(() => {
          useStore.getState().logout();
          navigate('/login');
        }, 2000);
      }
    }
  };

  const profileFields = [
    { label: 'Full Name', value: user?.name || 'Karan Sharma', icon: '👤', editable: true },
    { label: 'Email', value: user?.email || 'karan@example.com', icon: '📧', editable: true },
    { label: 'Phone', value: user?.phone || 'Not provided', icon: '📱', editable: true },
    { label: 'Currency', value: '₹ Indian Rupee (INR)', icon: '💱', editable: false },
    { label: 'Language', value: 'English', icon: '🌐', editable: false },
  ];

  return (
    <div>
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>←</button>
        <h2>Profile & Security</h2>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), #A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, color: 'white',
            boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
          }}>{user?.name?.[0] || 'K'}</div>
          <button 
            onClick={handleChangePhoto}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Change Photo
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 10, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-primary)' }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="card">
          {profileFields.map((row, i) => (
            <div 
              key={i} 
              className={row.editable ? 'settings-row' : ''}
              onClick={row.editable ? () => handleEditField(row.label, row.value) : undefined}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                padding: '12px 16px', 
                borderBottom: i < profileFields.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                cursor: row.editable ? 'pointer' : 'default'
              }}>
              <span style={{ fontSize: 20 }}>{row.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{row.value}</p>
              </div>
              {row.editable && <span style={{ color: 'var(--text-muted)' }}>›</span>}
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="card">
          {[
            { icon: '🔐', label: 'Change PIN', sub: '4-digit security PIN', action: handleChangePin },
            { icon: '🫆', label: 'Biometric', sub: 'Fingerprint / Face ID', action: () => showToast('Biometric authentication coming soon! 🔒') },
            { icon: '🔒', label: 'App Lock', sub: 'Lock on background', action: () => showToast('App lock feature coming soon! 🔐') },
          ].map((item, i) => (
            <div key={i} className="settings-row" onClick={item.action}>
              <div className="settings-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>{item.icon}</div>
              <div className="settings-text">
                <p className="settings-title">{item.label}</p>
                <p className="settings-subtitle">{item.sub}</p>
              </div>
              <span>›</span>
            </div>
          ))}
        </div>

        <button className="btn btn-danger btn-full" onClick={handleDeleteAccount}>
          ⚠️ Delete Account
        </button>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div className="sheet-overlay" onClick={() => setShowEditModal(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>Edit {editField.field}</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
            </div>
            <div className="sheet-body">
              <div className="form-group">
                <label className="form-label">{editField.field}</label>
                <input 
                  className="form-input" 
                  value={editField.value}
                  onChange={(e) => setEditField({ ...editField, value: e.target.value })}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-full" onClick={handleSaveEdit}>Save</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
