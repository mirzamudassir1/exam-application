import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleLogin = () => {
    if (!form.username) return setError('Username is required');
    if (!form.password) return setError('Password is required');
    setLoading(true);
    setTimeout(() => {
      if (form.username === 'admin' && form.password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        setError('Invalid username or password!');
      }
      setLoading(false);
    }, 500);
  };
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af', cursor: 'pointer', marginBottom: 24 }}>← Back to Home</div>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: '#1d4ed8', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px' }}>🛡️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Login</h1>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>QuizPro Management Panel</p>
        </div>
        <div className="card">
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="Enter admin username" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Enter admin password" onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 14 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : '🔐 Login as Admin'}
          </button>
        </div>

      </div>
    </div>
  );
}