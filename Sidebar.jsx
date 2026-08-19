import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('isAdmin'); navigate('/'); };
  const Link = ({ to, label }) => <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{label}</NavLink>;
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><h2>QuizPro</h2><p>Admin Panel</p></div>
      <div className="sidebar-section">Main</div>
      <Link to="/admin" label="🏠 Dashboard" />
      <div className="sidebar-section">Exams</div>
      <Link to="/admin/create-exam" label="📄 Create Exam" />
      <Link to="/admin/schedule" label="📅 Schedule Exam" />
      <Link to="/admin/questions" label="❓ Questions" />
      <div className="sidebar-section">Students</div>
      <Link to="/admin/students" label="👥 Students" />
      <div className="sidebar-section">Analytics</div>
      <Link to="/admin/reports" label="📊 Reports" />
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
        <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>🚪 Logout</button>
      </div>
    </aside>
  );
}