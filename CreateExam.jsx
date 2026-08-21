/**
 * ============================================================================
 * PAGE: CREATE EXAM - Exam Setup Interface
 * ============================================================================
 * Features:
 * - Create new exam with title, subject, duration, marks
 * - Configure exam settings (negative marking, shuffling, results display)
 * - Add exam instructions with math symbols
 * - Two-step process: Basic Info & Advanced Settings
 * ============================================================================
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomMathEditor from '../components/CustomMathEditor';

export default function CreateExam() {
//  // STATE MANAGEMENT
//
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subject: 'Mathematics',
    grade: '',
    totalMarks: 100,
    duration: 60,
    passingScore: 40,
    negativeMarking: 'none',
    shuffleQuestions: 'yes',
    showResult: 'immediately',
    instructions: '',
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (status) => {
    if (!form.title.trim()) return alert('Please enter an exam title!');
    if (!form.grade.trim()) return alert('Please enter a grade!');
    setLoading(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(status === 'draft' ? 'Saved as draft! ✅' : 'Exam created! ✅');
        navigate('/');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
  
      <div className="page-header">
        <h1 className="page-title">Create Exam</h1>
        <p className="page-subtitle">Fill in the details to create a new exam</p>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        <div className="tabs">
          {['Basic Info', 'Settings', 'Instructions'].map((t, i) => (
            <div key={i} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
              {t}
            </div>
          ))}
        </div>

        {tab === 0 && (
          <div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Exam Title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Math Final 2025" />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-select" value={form.subject} onChange={e => set('subject', e.target.value)}>
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>English</option>
                  <option>History</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Grade / Class *</label>
                <input className="form-input" value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="e.g. Grade 10-A" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input type="number" className="form-input" value={form.totalMarks} onChange={e => set('totalMarks', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-input" value={form.duration} onChange={e => set('duration', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Passing Score (%)</label>
                <input type="number" className="form-input" value={form.passingScore} onChange={e => set('passingScore', e.target.value)} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Negative Marking</label>
                <select className="form-select" value={form.negativeMarking} onChange={e => set('negativeMarking', e.target.value)}>
                  <option value="none">None</option>
                  <option value="0.25">0.25 per wrong</option>
                  <option value="0.5">0.5 per wrong</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Show Result</label>
                <select className="form-select" value={form.showResult} onChange={e => set('showResult', e.target.value)}>
                  <option value="immediately">Immediately</option>
                  <option value="after_exam">After exam ends</option>
                  <option value="manual">Manual release</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Shuffle Questions</label>
              <select className="form-select" value={form.shuffleQuestions} onChange={e => set('shuffleQuestions', e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">Instructions for Students</label>
              <CustomMathEditor value={form.instructions} onChange={v => set('instructions', v)} placeholder="1. Read all questions carefully." />
            </div>
          </div>
        )}

        <hr className="divider" />
        <div style={{ display: 'flex', gap: 10 }}>
          {tab > 0 && <button className="btn" onClick={() => setTab(t => t - 1)}>← Back</button>}
          {tab < 2 && <button className="btn btn-primary" onClick={() => setTab(t => t + 1)}>Next →</button>}
          {tab === 2 && (
            <>
              <button className="btn" onClick={() => handleSubmit('draft')} disabled={loading}>
                {loading ? 'Saving...' : '💾 Save as Draft'}
              </button>
              <button className="btn btn-primary" onClick={() => handleSubmit('scheduled')} disabled={loading}>
                {loading ? 'Saving...' : '✓ Create Exam'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
