import { useState, useEffect } from 'react';
import CustomMathEditor from '../components/CustomMathEditor';

export default function Questions() {
  const [exams, setExams] = useState([]);
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    examId: '',
    examTitle: '',
    type: 'mcq',
    text: '',
    marks: 2,
    options: ['', '', '', ''],
    correctIndex: 0,
    tfCorrect: 0,
    correctAnswer: '',
  });

  useEffect(() => {
    fetch('/api/exams').then(r => r.json()).then(setExams).catch(console.log);
    fetch('/api/questions').then(r => r.json()).then(setList).catch(console.log);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setOpt = (i, v) => setForm(f => {
    const options = [...f.options];
    options[i] = v;
    return { ...f, options };
  });

  const resetForm = () => setForm({
    examId: '',
    examTitle: '',
    type: 'mcq',
    text: '',
    marks: 2,
    options: ['', '', '', ''],
    correctIndex: 0,
    tfCorrect: 0,
    correctAnswer: '',
  });

  const handleExamChange = (e) => {
    const exam = exams.find(ex => ex._id === e.target.value);
    setForm(f => ({
      ...f,
      examId: e.target.value,
      examTitle: exam ? exam.title : '',
    }));
  };

  const save = async () => {
    if (!form.examId) return alert('Please select an exam!');
    if (!form.text || form.text === '<br>' || form.text === '<p><br></p>') return alert('Please enter question text!');
    if (form.type === 'fillblank' && !form.correctAnswer.trim()) return alert('Please enter the correct answer!');

    let options = [];
    let correctIndex = -1;
    let correctAnswer = '';

    if (form.type === 'mcq') {
      options = form.options;
      correctIndex = parseInt(form.correctIndex);
    } else if (form.type === 'truefalse') {
      options = ['True', 'False'];
      correctIndex = parseInt(form.tfCorrect);
    } else if (form.type === 'fillblank') {
      correctAnswer = form.correctAnswer.trim().toLowerCase();
    }

    setLoading(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: form.examId,
          examTitle: form.examTitle,
          type: form.type,
          text: form.text,
          options,
          correctIndex,
          correctAnswer,
          marks: parseInt(form.marks),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setList(prev => [...prev, data]);
        setShowModal(false);
        resetForm();
        alert('Question added! ✅');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const deleteQ = async (id) => {
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      alert('Could not delete.');
    }
  };

  const typeBadge = { mcq: 'badge-blue', truefalse: 'badge-amber', fillblank: 'badge-gray' };
  const typeLabel = { mcq: 'MCQ', truefalse: 'True/False', fillblank: 'Fill Blank' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Question Bank</h1>
        <p className="page-subtitle">Add and manage questions for each exam</p>
      </div>

      {/* Action Row */}
      <div className="action-row">
        <span style={{ color: '#9ca3af' }}>{list.length} questions total</span>
        <div style={{ display: 'flex', gap: 10 }}>
         
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Question
          </button>
        </div>
      </div>

      {/* Question List */}
      {list.length === 0 && (
        <div className="empty-state">
          <p>No questions yet. Click Add Question to get started.</p>
        </div>
      )}

      {list.map((q, i) => (
        <div className="question-card" key={q._id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="question-meta">
              <span>Q{i + 1}</span> · <span>{q.examTitle}</span> ·
              <span className={`badge ${typeBadge[q.type]}`}>{typeLabel[q.type]}</span> ·
              <span>{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
            </div>
            <button className="btn btn-sm btn-danger" onClick={() => deleteQ(q._id)}>
              🗑 Delete
            </button>
          </div>

          <div
            className="question-text"
            dangerouslySetInnerHTML={{ __html: q.text }}
          />

          {(q.type === 'mcq' || q.type === 'truefalse') && q.options.map((opt, j) => (
            <div key={j} className={`option-row ${j === q.correctIndex ? 'correct' : ''}`}>
              <strong>{String.fromCharCode(65 + j)}.</strong>
              <span dangerouslySetInnerHTML={{ __html: opt }} />
              {j === q.correctIndex && (
                <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓ Correct</span>
              )}
            </div>
          ))}

          {q.type === 'fillblank' && (
            <div style={{ fontSize: 13, color: '#4b5563', padding: '8px 12px', background: '#f9fafb', borderRadius: 6, marginTop: 4 }}>
              ✏️ Student types their answer
            </div>
          )}
        </div>
      ))}

      {/* ADD QUESTION MODAL */}
      {showModal && (
        <div
          className="modal-backdrop"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <div className="modal-title">Add Question</div>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>✕</button>
            </div>

            {/* Exam selector */}
            <div className="form-group">
              <label className="form-label">Select Exam *</label>
              <select
                className="form-select"
                value={form.examId}
                onChange={handleExamChange}
              >
                <option value="">— Choose exam —</option>
                {exams.map(e => (
                  <option key={e._id} value={e._id}>{e.title}</option>
                ))}
              </select>
            </div>

            {/* Type and Marks */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Question Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={e => set('type', e.target.value)}
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="truefalse">True / False</option>
                  <option value="fillblank">Fill in the Blank</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.marks}
                  onChange={e => set('marks', e.target.value)}
                  min="1"
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <CustomMathEditor
                value={form.text}
                onChange={v => set('text', v)}
                placeholder={
                  form.type === 'fillblank'
                    ? "Use ___ for the blank. ."
                    : "Type your question "
                }
              />
              {form.type === 'fillblank' && (
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                  💡 Use ___ to show where the blank is
                </div>
              )}
            </div>

            {/* MCQ Options */}
            {form.type === 'mcq' && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#4b5563', marginBottom: 10 }}>
                  Options — click the circle to mark correct answer
                </div>
                {form.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div
                      onClick={() => set('correctIndex', i)}
                      style={{
                        width: 20, height: 20,
                        borderRadius: '50%',
                        border: `2px solid ${i === parseInt(form.correctIndex) ? '#1d4ed8' : '#d1d5db'}`,
                        background: i === parseInt(form.correctIndex) ? '#1d4ed8' : 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: 8,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <CustomMathEditor
                        value={opt}
                        onChange={v => setOpt(i, v)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* True / False */}
            {form.type === 'truefalse' && (
              <div className="form-group">
                <label className="form-label">Correct Answer</label>
                <select
                  className="form-select"
                  value={form.tfCorrect}
                  onChange={e => set('tfCorrect', e.target.value)}
                >
                  <option value={0}>True</option>
                  <option value={1}>False</option>
                </select>
              </div>
            )}

            {/* Fill in blank */}
            {form.type === 'fillblank' && (
              <div className="form-group">
                <label className="form-label">Correct Answer *</label>
                <input
                  className="form-input"
                  value={form.correctAnswer}
                  onChange={e => set('correctAnswer', e.target.value)}
                  placeholder="e.g. New Delhi"
                />
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                  💡 Answer checking is case insensitive
                </div>
              </div>
            )}

            <hr className="divider" />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={loading}
              >
                {loading ? 'Saving...' : '✓ Save Question'}
              </button>
              <button
                className="btn"
                onClick={() => { setShowModal(false); resetForm(); }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
