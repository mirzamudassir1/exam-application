import { useState, useEffect } from 'react';

export default function Reports() {
  const [exams, setExams] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/exams')
      .then(r => r.json())
      .then(data => {
        const completed = data.filter(e => e.status === 'completed');
        setExams(completed);
        if (completed.length > 0) {
          setSelectedId(completed[0]._id);
          loadQuestions(completed[0]._id);
        }
      })
      .catch(console.log);
  }, []);

  const loadQuestions = async (examId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions/exam/${examId}`);
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExamChange = (e) => {
    setSelectedId(e.target.value);
    loadQuestions(e.target.value);
  };

  const selectedExam = exams.find(e => e._id === selectedId);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Per exam performance analytics</p>
      </div>

      {exams.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>No completed exams yet.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Mark an exam as completed to see reports.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="action-row">
            <select className="form-select" style={{ width: 220 }} value={selectedId} onChange={handleExamChange}>
              {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>

          {selectedExam && (
            <>
              <div className="report-banner">
                <h2>{selectedExam.title}</h2>
                <p>{selectedExam.subject} · {selectedExam.grade} · {selectedExam.duration} mins · {selectedExam.totalMarks} marks</p>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Total Marks</div>
                  <div className="metric-value" style={{ color: '#1d4ed8' }}>{selectedExam.totalMarks}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Duration</div>
                  <div className="metric-value" style={{ color: '#b45309' }}>{selectedExam.duration} min</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Passing Score</div>
                  <div className="metric-value" style={{ color: '#15803d' }}>{selectedExam.passingScore}%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Questions</div>
                  <div className="metric-value">{questions.length}</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Questions in this Exam</div>
                {loading ? (
                  <p style={{ color: '#9ca3af' }}>Loading...</p>
                ) : questions.length === 0 ? (
                  <div className="empty-state"><p>No questions added yet.</p></div>
                ) : (
                  questions.map((q, i) => (
                    <div key={q._id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
                        Q{i + 1} · <span className={`badge ${q.type === 'mcq' ? 'badge-blue' : 'badge-amber'}`}>{q.type}</span> · {q.marks} mark{q.marks > 1 ? 's' : ''}
                      </div>
                      <div style={{ fontWeight: 500, marginBottom: 8 }}>{q.text}</div>
                      {q.options.map((opt, j) => (
                        <div key={j} className={`option-row ${j === q.correctIndex ? 'correct' : ''}`}>
                          <strong>{String.fromCharCode(65 + j)}.</strong> {opt}
                          {j === q.correctIndex && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓ Correct</span>}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
