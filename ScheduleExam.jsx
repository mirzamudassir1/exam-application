import { useState, useEffect } from 'react';

export default function ScheduleExam() {
  const [exams, setExams] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    examId: '', examTitle: '',
    startDate: '', startTime: '', endTime: '', venue: 'Online',
  });

  useEffect(() => {
    fetch('/api/exams').then(r => r.json()).then(setExams).catch(console.log);
    fetch('/api/schedules').then(r => r.json()).then(setList).catch(console.log);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleExamChange = (e) => {
    const exam = exams.find(ex => ex._id === e.target.value);
    setForm(f => ({ ...f, examId: e.target.value, examTitle: exam ? exam.title : '' }));
  };

  const add = async () => {
    if (!form.examId) return alert('Please select an exam!');
    if (!form.startDate) return alert('Please select a date!');
    if (!form.startTime) return alert('Please select a start time!');
    if (!form.endTime) return alert('Please select an end time!');
    setLoading(true);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setList(prev => [...prev, data]);
        setForm({ examId: '', examTitle: '', startDate: '', startTime: '', endTime: '', venue: 'Online' });
        alert('Exam scheduled! ✅');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert('Could not delete.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Schedule Exam</h1>
        <p className="page-subtitle">Set date and time for an exam</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-title">New Schedule</div>
          <div className="form-group">
            <label className="form-label">Select Exam *</label>
            <select className="form-select" value={form.examId} onChange={handleExamChange}>
              <option value="">— Choose an exam —</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input type="date" className="form-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input type="time" className="form-input" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">End Time *</label>
            <input type="time" className="form-input" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Venue / Mode</label>
            <select className="form-select" value={form.venue} onChange={e => set('venue', e.target.value)}>
              <option>Online</option>
              <option>Offline - Room A</option>
              <option>Offline - Room B</option>
              <option>Hybrid</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={add} disabled={loading}>
            {loading ? 'Saving...' : '📅 Schedule Exam'}
          </button>
        </div>

        <div className="card">
          <div className="card-title">All Schedules ({list.length})</div>
          {list.length === 0 ? (
            <div className="empty-state"><p>No schedules yet.</p></div>
          ) : (
            list.map(s => (
              <div key={s._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.examTitle}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>📅 {s.startDate}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>⏰ {s.startTime} – {s.endTime}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>📍 {s.venue}</div>
                    <span className={`badge ${s.status === 'completed' ? 'badge-green' : 'badge-blue'}`} style={{ marginTop: 6, display: 'inline-block' }}>
                      {s.status}
                    </span>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(s._id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}