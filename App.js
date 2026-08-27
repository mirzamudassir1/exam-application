import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CreateExam from './pages/CreateExam';
import ScheduleExam from './pages/ScheduleExam';
import Questions from './pages/Questions';
import AllotStudents from './pages/AllotStudents';
import Reports from './pages/Reports';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import TakeExam from './pages/TakeExam';


const AdminLayout = () => {
  const isAdmin = localStorage.getItem('isAdmin');
  if (!isAdmin) return <Navigate to="/admin-login" />;
  return <div className="app-layout"><Sidebar /><main className="main-content"><Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/create-exam" element={<CreateExam />} />
    <Route path="/schedule" element={<ScheduleExam />} />
    <Route path="/questions" element={<Questions />} />
    <Route path="/students" element={<AllotStudents />} />
    <Route path="/reports" element={<Reports />} />
  </Routes></main></div>;
};

export default function App() {
  return <HashRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route path="/student-login" element={<StudentLogin />} />
    <Route path="/student-dashboard" element={<StudentDashboard />} />
    <Route path="/take-exam/:examId" element={<TakeExam />} />
    <Route path="/admin/*" element={<AdminLayout />} />
  </Routes></HashRouter>;
}
