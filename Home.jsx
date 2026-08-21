import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const cardStyle = { flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 1px 3px rgba(0,0,0,.06)' };
  const btnStyle = { color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, display: 'inline-block' };
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ width: 64, height: 64, background: '#1d4ed8', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>📝</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>QuizPro</h1>
        <p style={{ fontSize: 16, color: '#9ca3af' }}>Online Exam Platform</p>
      </div>
      <div style={{ display: 'flex', gap: 24, width: '100%', maxWidth: 600 }}>
        <div onClick={() => navigate('/admin')} style={cardStyle} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(29,78,216,.15)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Admin</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>Create exams, add questions, manage students and view reports</div>
          <div style={{ ...btnStyle, background: '#1d4ed8' }}>Admin Login →</div>
        </div>
        <div onClick={() => navigate('/student-login')} style={cardStyle} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,.15)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Student</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>Register or login to take exams and view your results</div>
          <div style={{ ...btnStyle, background: '#059669' }}>
            Student Login →
          </div>
        </div>

      </div>

    </div>
  );
}