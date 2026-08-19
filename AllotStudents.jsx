import { useState, useEffect } from 'react';

export default function AllotStudents() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', roll: '', email: '' });
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    fetch('/api/exams')
      .then(r => r.json())
      .then(data => {
        setExams(data);
        // Extract unique grades from exams
        const uniqueGrades = [...new Set(data.map(e => e.grade))];
        setGrades(uniqueGrades);
      })
      .catch(console.log);

    fetch('/api/students')
      .then(r => r.json())
      .then(setAllotments)
      .catch(console.log);
  }, []);

  const loadStudentsByGrade = async (grade) => {
    setSelectedGrade(grade);
    try {
      const res = await fetch(`/api/students/grade/${encodeURIComponent(grade)}`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.log(err);
    }
  };

  const addStudent = async () => {
    if (!newStudent.name.trim()) return alert('Please enter student name!');
    if (!selectedGrade) return alert('Please select a grade first!');

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStudent, grade: selectedGrade }),
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(prev => [...prev, data]);
        setAllotments(prev => [...prev, data]);
        setNewStudent({ name: '', roll: '', email: '' });
        setShowAddStudent(false);
        alert('Student added! ✅');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Could not connect to server.');
    }
  };

  const allot = async () => {
    if (!selectedExam) return alert('Please select an exam!');
    if (!selectedGrade) return alert('Please select a grade!');
    if (students.length === 0) return alert('No students in this grade. Add students first!');

    const exam = exams.find(e => e._id === selectedExam);
    setLoading(true);
    try {
      const res = await fetch('/api/students/allot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          examId: selectedExam,
          examTitle: exam.title,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message + ' ✅');
        fetch('/api/students').then(r => r.json()).then(setAllotments);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      setStudents(prev => prev.filter(s => s._id !== id));
      setAllotments(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert('Could not delete.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Allot Students</h1>
        <p className="page-subtitle">Assign students to exams</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>

        {/* Left - Allot Form */}
        <div className="card">
          <div className="card-title">Allot to Exam</div>

          {/* Select Exam */}
          <div className="form-group">
            <label className="form-label">Select Exam *</label>
            <select
              className="form-select"
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
            >
              <option value="">— Choose an exam —</option>
              {exams.map(e => (
                <option key={e._id} value={e._id}>
                  {e.title} ({e.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Select Grade — comes from exams */}
          <div className="form-group">
            <label className="form-label">Select Grade</label>
            <select
              className="form-select"
              value={selectedGrade}
              onChange={e => loadStudentsByGrade(e.target.value)}
            >
              <option value="">— Choose a grade —</option>
              {grades.map(g => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Students in selected grade */}
          {selectedGrade && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#4b5563' }}>
                  Students in {selectedGrade} ({students.length})
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => setShowAddStudent(!showAddStudent)}
                >
                  {showAddStudent ? '✕ Cancel' : '+ Add Student'}
                </button>
              </div>

              {/* Add student form */}
              {showAddStudent && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      className="form-input"
                      value={newStudent.name}
                      onChange={e => setNewStudent(s => ({ ...s, name: e.target.value }))}
                      placeholder="e.g. Arjun S"
                    />

                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      value={newStudent.email}
                      onChange={e => setNewStudent(s => ({ ...s, email: e.target.value }))}
                      placeholder="e.g. student@school.edu"
                    />
                  </div>
                  <button className="btn btn-primary" onClick={addStudent}>
                    Save Student
                  </button>
                </div>
              )}

              {/* Student chips */}
              {students.length === 0 ? (
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  No students yet. Click + Add Student above.
                </div>
              ) : (
                students.map(s => (
                  <span
                    key={s._id}
                    className="student-chip"
                    style={{ position: 'relative' }}
                  >
                    {s.roll} — {s.name}
                    <span
                      onClick={() => removeStudent(s._id)}
                      style={{ marginLeft: 4, cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}
                    >
                      ×
                    </span>
                  </span>
                ))
              )}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={allot}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Allotting...' : '👥 Allot Class to Exam'}
          </button>
        </div>

        {/* Right - All students table */}
        <div className="card">
          <div className="card-title">All Students ({allotments.length})</div>
          {allotments.length === 0 ? (
            <div className="empty-state">
              <p>No students yet.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                Select a grade on the left and add students.
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll</th>
                  <th>Grade</th>
                  <th>Exams Allotted</th>
                </tr>
              </thead>
              <tbody>
                {allotments.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td style={{ fontSize: 12 }}>{s.roll}</td>
                    <td>{s.grade}</td>
                    <td>
                      <span className="badge badge-blue">
                        {s.exams?.length || 0} exams
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}