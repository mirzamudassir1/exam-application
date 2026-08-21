import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examsRes = await fetch('/api/exams');
        const examsData = await examsRes.json();
        setExams(examsData);

        const schedulesRes = await fetch('/api/schedules');
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData);
      } catch (err) {
        console.log('Backend not connected');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completed = exams.filter(e => e.status === 'completed').length;
  const scheduled = exams.filter(e => e.status === 'scheduled').length;
  const draft = exams.filter(e => e.status === 'draft').length;

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of all your exams</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Exams</div>
          <div className="metric-value" style={{ color: '#1d4ed8' }}>{exams.length}</div>
          <div className="metric-sub">All time</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Scheduled</div>
          <div className="metric-value" style={{ color: '#b45309' }}>{scheduled}</div>
          <div className="metric-sub">Upcoming</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Completed</div>
          <div className="metric-value" style={{ color: '#15803d' }}>{completed}</div>
          <div className="metric-sub">With results</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Draft</div>
          <div className="metric-value" style={{ color: '#9ca3af' }}>{draft}</div>
          <div className="metric-sub">Not published</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">All Exams</div>
          {exams.length === 0 ? (
            <div className="empty-state">
              <p>No exams yet.</p>
              <p>Go to Create Exam to add one.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(e => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 500 }}>{e.title}</td>
                    <td>{e.subject}</td>
                    <td>
                      <span className={`badge ${
                        e.status === 'completed' ? 'badge-green' :
                        e.status === 'scheduled' ? 'badge-blue' : 'badge-amber'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td>{e.totalMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-title">Exams by Status</div>
          {exams.length === 0 ? (
            <div className="empty-state"><p>No data yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: 'Draft', count: draft },
                { name: 'Scheduled', count: scheduled },
                { name: 'Completed', count: completed },
              ]}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">Upcoming Schedules</div>
        {schedules.length === 0 ? (
          <div className="empty-state"><p>No schedules yet.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Date</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 500 }}>{s.examTitle}</td>
                  <td>{s.startDate}</td>
                  <td>{s.startTime} – {s.endTime}</td>
                  <td>{s.venue}</td>
                  <td>
                    <span className={`badge ${s.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}