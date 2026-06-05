import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function Profile() {
  const { user, setUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    email: user?.email || '',
    institution: user?.profile?.institution || '',
    bio: user?.profile?.bio || '',
  });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password1: '', new_password2: '' });
  const [infoMsg, setInfoMsg] = useState(null); // { type:'success'|'error', text }
  const [pwMsg, setPwMsg] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const avatarInitial = user?.profile?.avatar_initial || user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U';

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoMsg(null);
    try {
      let dataToSend;
      if (avatarFile) {
        dataToSend = new FormData();
        dataToSend.append('first_name', form.first_name);
        dataToSend.append('last_name', form.last_name);
        dataToSend.append('username', form.username);
        dataToSend.append('email', form.email);
        dataToSend.append('institution', form.institution);
        dataToSend.append('bio', form.bio);
        dataToSend.append('avatar', avatarFile);
      } else {
        dataToSend = {
          first_name: form.first_name,
          last_name: form.last_name,
          username: form.username,
          email: form.email,
          institution: form.institution,
          bio: form.bio,
        };
      }

      const updated = await authApi.updateProfile(dataToSend);
      setUser(updated);
      setAvatarFile(null);
      setInfoMsg({ type: 'success', text: '✅ Profile updated successfully!' });
    } catch (err) {
      const errData = err?.data || {};
      const firstErr = Object.values(errData)[0] || 'Failed to update profile.';
      setInfoMsg({ type: 'error', text: firstErr });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.new_password1 !== pwForm.new_password2) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await authApi.changePassword({
        old_password: pwForm.old_password,
        new_password1: pwForm.new_password1,
        new_password2: pwForm.new_password2,
      });
      setPwMsg({ type: 'success', text: '✅ Password changed successfully!' });
      setPwForm({ old_password: '', new_password1: '', new_password2: '' });
    } catch (err) {
      const errData = err?.data || {};
      const firstErr = Object.values(errData)[0] || 'Failed to change password.';
      setPwMsg({ type: 'error', text: firstErr });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      <div className="page-header anim-fade-up">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal info, avatar, and account settings.</p>
      </div>

      <div className="profile-layout">
        {/* ── Left Sidebar ── */}
        <aside className="profile-sidebar anim-fade-up">
          {/* Avatar Card */}
          <div className="profile-avatar-card">
            <div className="profile-avatar-ring" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-upload').click()}>
              {avatarPreview || user?.profile?.avatar_url
                ? <img src={avatarPreview || user.profile.avatar_url} alt="Avatar" className="profile-avatar-img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <div className="profile-avatar-initials">{avatarInitial}</div>}
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                <i className="bi bi-camera-fill"></i>
              </div>
            </div>
            <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <div className="profile-name">{form.first_name} {form.last_name || user?.username}</div>
            <div className="profile-username">@{form.username}</div>
            {form.institution && (
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="bi bi-building"></i>{form.institution}
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="profile-stats-card anim-fade-up" style={{ animationDelay: '.1s' }}>
            <div className="profile-stat">
              <div className="profile-stat-val">{user?.profile?.interaction_count ?? 0}</div>
              <div className="profile-stat-lbl">Topics Studied</div>
            </div>
            <div className="profile-stat-divider"></div>
            <div className="profile-stat">
              <div className="profile-stat-val" style={{ textTransform: 'capitalize', fontSize: '1rem' }}>
                {user?.profile?.preferred_style
                  ? <span className={`style-chip chip-${user.profile.preferred_style}`}>{user.profile.preferred_style.charAt(0).toUpperCase() + user.profile.preferred_style.slice(1)}</span>
                  : 'Balanced'}
              </div>
              <div className="profile-stat-lbl">Learning Style</div>
            </div>
            <div className="profile-stat-divider"></div>
            <div className="profile-stat">
              <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.875rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                <i className="bi bi-grid-1x2"></i>Dashboard
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main Panel ── */}
        <div className="profile-main anim-fade-up" style={{ animationDelay: '.1s' }}>
          {/* Tabs */}
          <div className="profile-tabs">
            <button className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
              <i className="bi bi-person"></i>Personal Info
            </button>
            <button className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
              <i className="bi bi-lock"></i>Password
            </button>
          </div>

          {/* ── Info Tab ── */}
          <div className={`profile-tab-pane ${activeTab === 'info' ? 'active' : ''}`}>
            {infoMsg && (
              <div className={`pl-alert ${infoMsg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 20 }}>
                <i className={`bi ${infoMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <span>{infoMsg.text}</span>
              </div>
            )}
            <form onSubmit={handleInfoSave}>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input id="profile-first-name" type="text" className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} disabled={infoLoading} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input id="profile-last-name" type="text" className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} disabled={infoLoading} />
                </div>
                <div className="form-group">
                  <label className="form-label">Username <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input id="profile-username" type="text" className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required disabled={infoLoading} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input id="profile-email" type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={infoLoading} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">College / Institution</label>
                  <input id="profile-institution" type="text" className="form-input" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} placeholder="Your college or university" disabled={infoLoading} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Bio</label>
                  <textarea id="profile-bio" className="form-input" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="A short bio about yourself..." style={{ resize: 'vertical' }} disabled={infoLoading} />
                </div>
              </div>
              <div className="profile-form-actions">
                <button id="profile-save" type="submit" className="btn-primary" disabled={infoLoading}>
                  {infoLoading
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'plSpin 0.8s linear infinite' }}></span>Saving…</>
                    : <><i className="bi bi-check2"></i>Save Changes</>}
                </button>
                <Link to="/dashboard" className="btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>

          {/* ── Password Tab ── */}
          <div className={`profile-tab-pane ${activeTab === 'password' ? 'active' : ''}`}>
            {pwMsg && (
              <div className={`pl-alert ${pwMsg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 20 }}>
                <i className={`bi ${pwMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <span>{pwMsg.text}</span>
              </div>
            )}
            <form onSubmit={handlePwSave}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input id="pw-current" type="password" className="form-input" value={pwForm.old_password} onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })} placeholder="Current password" autoComplete="current-password" disabled={pwLoading} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input id="pw-new" type="password" className="form-input" value={pwForm.new_password1} onChange={e => setPwForm({ ...pwForm, new_password1: e.target.value })} placeholder="New password (min 8 chars)" autoComplete="new-password" disabled={pwLoading} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input id="pw-confirm" type="password" className="form-input" value={pwForm.new_password2} onChange={e => setPwForm({ ...pwForm, new_password2: e.target.value })} placeholder="Repeat new password" autoComplete="new-password" disabled={pwLoading} />
              </div>
              <div className="profile-form-actions">
                <button id="pw-save" type="submit" className="btn-primary" disabled={pwLoading}>
                  {pwLoading
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'plSpin 0.8s linear infinite' }}></span>Changing…</>
                    : <><i className="bi bi-shield-lock"></i>Change Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
