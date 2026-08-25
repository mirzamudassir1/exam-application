import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const setL = (k, v) => setLoginForm(f => ({ ...f, [k]: v }));
  const setR = (k, v) => setRegisterForm(f => ({ ...f, [k]: v }));
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    const newErrors = {};
    if (!loginForm.email) newErrors.email = 'Email is required';
    else if (!validateEmail(loginForm.email)) newErrors.email = 'Enter a valid email address';
    if (!loginForm.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('student', JSON.stringify(data.student));
        localStorage.setItem('token', data.token);
        navigate('/student-dashboard');
      } else {
        setErrors({ general: data.message });
      }
    } catch (err) {
      setErrors({ general: 'Could not connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const newErrors = {};
    if (!registerForm.name.trim()) newErrors.name = 'Name is required';
    if (!registerForm.email) newErrors.email = 'Email is required';
    else if (!validateEmail(registerForm.email)) newErrors.email = 'Enter a valid email address';
    if (!registerForm.password) newErrors.password = 'Password is required';
    else if (registerForm.password.length < 6) newErrors.password = 'Min 6 characters';
    if (registerForm.password !== registerForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('student', JSON.stringify(data.student));
        localStorage.setItem('token', data.token);
        navigate('/student-dashboard');
      } else {
        setErrors({ general: data.message });
      }
    } catch (err) {
      setErrors({ general: 'Could not connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Back button */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af', cursor: 'pointer', marginBottom: 24 }}
        >
          ← Back to Home
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: '#059669',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 12px',
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Student Portal</h1>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>Login or register to take exams</p>
        </div>

        <div className="card">
          <div className="tabs" style={{ marginBottom: 20 }}>
            <div className={`tab ${tab === 0 ? 'active' : ''}`} onClick={() => { setTab(0); setErrors({}); }}>Login</div>
            <div className={`tab ${tab === 1 ? 'active' : ''}`} onClick={() => { setTab(1); setErrors({}); }}>Register</div>
          </div>

          {errors.general && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
              ⚠️ {errors.general}
            </div>
          )}

          {/* LOGIN */}
          {tab === 0 && (
            <div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={loginForm.email} onChange={e => setL('email', e.target.value)} placeholder="your@email.com" style={{ borderColor: errors.email ? '#dc2626' : '' }} />
                {errors.email && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠️ {errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={loginForm.password} onChange={e => setL('password', e.target.value)} placeholder="Enter your password" style={{ borderColor: errors.password ? '#dc2626' : '' }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                {errors.password && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠️ {errors.password}</div>}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }} onClick={handleLogin} disabled={loading}>
                {loading ? 'Logging in...' : '🔐 Login'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
                Don't have an account?{' '}
                <span style={{ color: '#059669', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setTab(1); setErrors({}); }}>Register here</span>
              </div>
            </div>
          )}

          {/* REGISTER */}
          {tab === 1 && (
            <div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={registerForm.name} onChange={e => setR('name', e.target.value)} placeholder="e.g. Arjun Kumar" style={{ borderColor: errors.name ? '#dc2626' : '' }} />
                {errors.name && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠️ {errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={registerForm.email} onChange={e => setR('email', e.target.value)} placeholder="your@email.com" style={{ borderColor: errors.email ? '#dc2626' : '' }} />
                {errors.email && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠️ {errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={registerForm.password} onChange={e => setR('password', e.target.value)} placeholder="Min 6 characters" style={{ borderColor: errors.password ? '#dc2626' : '' }} />
                {errors.password && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠️ {errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" value={registerForm.confirmPassword} onChange={e => setR('confirmPassword', e.target.value)} placeholder="Repeat your password" style={{ borderColor: errors.confirmPassword ? '#dc2626' : '' }} onKeyDown={e => e.key === 'Enter' && handleRegister()} />
                {errors.confirmPassword && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠️ {errors.confirmPassword}</div>}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', background: '#059669', borderColor: '#059669' }} onClick={handleRegister} disabled={loading}>
                {loading ? 'Registering...' : '✅ Create Account'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
                Already have an account?{' '}
                <span style={{ color: '#059669', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setTab(0); setErrors({}); }}>Login here</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}