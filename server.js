const express = require('express'), mongoose = require('mongoose'), cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors(), express.json());
app.use('/api/exams', require('./routes/exams'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/students', require('./routes/students'));
app.use('/api/schedules', require('./routes/schedules'));
app.get('/', (req, res) => res.json({ message: 'QuizPro Backend is running! 🚀' }));

// Connect to MongoDB (safe to call multiple times — mongoose caches the connection)
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected!'))
    .catch(err => console.log('❌ MongoDB connection failed:', err));
}

// Only listen locally — Vercel handles this in production
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 5000, () =>
    console.log(`✅ Server running on port ${process.env.PORT || 5000}`)
  );
}

module.exports = app;