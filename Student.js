const mongoose = require('mongoose');
const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  grade: String,
  exams: [{ examId: String, examTitle: String }]
});
module.exports = mongoose.model('Student', StudentSchema);