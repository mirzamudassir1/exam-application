const express = require('express'), router = express.Router(), Student = require('../models/Student'), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'quizpro_secret_key';
const h = fn => (req, res) => fn(req, res).catch(e => res.status(500).json({ message: e.message }));
const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
router.get('/', h(async (req, res) => res.json(await Student.find().select('-password'))));
router.get('/grade/:grade', h(async (req, res) => res.json(await Student.find({ grade }).select('-password'))));
router.post('/', h(async (req, res) => {
  const { name, email, grade } = req.body;
  if (!name || !grade) return res.status(400).json({ message: 'Name and grade required' });
  if (email && await Student.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
  res.status(201).json(await new Student({ name, email, grade, exams: [] }).save());
}));


router.post('/allot', h(async (req, res) => {
  const { grade, examId, examTitle } = req.body;
  if (!grade || !examId) return res.status(400).json({ message: 'Grade and exam required' });
  const students = await Student.find({ grade });
  for (const s of students) {
    if (!s.exams.find(e => e.examId === examId)) {
      s.exams.push({ examId, examTitle });
      await s.save();
    }
  }
  res.json({ message: `Allotted to ${students.length} students` });
}));


router.post('/register', h(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
  if (password.length < 6) return res.status(400).json({ message: 'Min 6 chars' });
  if (await Student.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
  const student = await new Student({ name, email, password: await bcrypt.hash(password, 10), exams: [] }).save();
  const token = jwt.sign({ id: student._id, email: student.email }, JWT_SECRET, { expiresIn: '7d' });
  const obj = student.toObject();
  delete obj.password;
  res.status(201).json({ token, student: obj });
}));


router.post('/login', h(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const student = await Student.findOne({ email });
  if (!student) return res.status(400).json({ message: 'No account' });
  if (!await bcrypt.compare(password, student.password)) return res.status(400).json({ message: 'Wrong password' });
  const token = jwt.sign({ id: student._id, email: student.email }, JWT_SECRET, { expiresIn: '7d' });
  const obj = student.toObject();
  delete obj.password;
  res.json({ token, student: obj });
}));

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Student deleted'
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.put('/:id/exam-result', h(async (req, res) => {
  const { examId, score, status } = req.body, student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Not found' });
  const idx = student.exams.findIndex(e => e.examId.toString() === examId);
  if (idx > -1) { student.exams[idx].score = score; student.exams[idx].status = status; }
  else student.exams.push({ examId, score, status });
  await student.save();
  res.json({ message: 'Saved' });
}));

module.exports = router;