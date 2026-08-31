const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  examTitle: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    default: 'Online',
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed'],
    default: 'upcoming',
  },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);