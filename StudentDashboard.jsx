import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('student');
    if (!saved) {
      navigate('/student-login');
      return;
    }
    setStudent(JSON.parse(saved));

    // Load all available exams
    fetch('/api/exams')
      .then(r => r.json())
      .then(data => {
        setExams(data.filter(e => e.status === 'scheduled' || e.status === 'completed'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem('token');
    navigate('/student-login');
  };

  if (!student || loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* Navbar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 20 }}>📝</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>QuizPro</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Online Exam Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{student.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{student.email}</div>
          </div>
          <button className="btn btn-sm btn-danger" onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>
        <div className="page-header">
          <h1 className="page-title">Available Exams</h1>
          <p className="page-subtitle">Click on any exam to start</p>
        </div>

        {exams.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <p>No exams available yet.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Check back later.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {exams.map(e => {
              const taken = student.exams?.find(ex => ex.examId === e._id);
              return (
                <div
                  key={e._id}
                  className="card"
                  style={{ cursor: taken?.status === 'completed' ? 'default' : 'pointer' }}
                  onClick={() => {
                    if (taken?.status === 'completed') return;
                    navigate(`/take-exam/${e._id}`);
                  }}
                >
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>{e.subject}</div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
                    ⏱ {e.duration} mins &nbsp;·&nbsp; 📝 {e.totalMarks} marks &nbsp;·&nbsp; Pass: {e.passingScore}%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {taken?.status === 'completed' ? (
                      <>
                        <span className="badge badge-green">✓ Completed</span>
                        <span style={{ fontWeight: 600, color: '#15803d', fontSize: 14 }}>
                          Score: {taken.score}
                        </span>
                      </>
                    ) : (
                      <span className="badge badge-blue">Start Exam</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}