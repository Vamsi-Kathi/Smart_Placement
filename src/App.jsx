import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { LayoutDashboard, Code, BookOpen, Mic, FileText, Briefcase, Users, LogOut, Database } from 'lucide-react';
import './App.css';

// Public Components
import Home from './components/Public/Home';

// Placeholder Student Components
import StudentDashboard from './components/Student/Dashboard';
import CodingPractice from './components/Student/CodingPractice';
import AptitudeTest from './components/Student/AptitudeTest';
import MockInterview from './components/Student/MockInterview';
import ResumeAnalyzer from './components/Student/ResumeAnalyzer';
import JobPortal from './components/Student/JobPortal';

// Placeholder Admin Components
import AdminDashboard from './components/Admin/Dashboard';
import UserManagement from './components/Admin/UserManagement';
import CodingSetter from './components/Admin/CodingSetter';
import AptitudeSetter from './components/Admin/AptitudeSetter';
import JobSetter from './components/Admin/JobSetter';

// Shared Components
import AIChatAssistant from './components/Student/AIChatAssistant';

import AuthSplit from './components/Public/AuthSplit';

// Sidebar for Dashboard
const Sidebar = () => {
  const { userRole, logoutUser } = useAppContext();
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Coding Practice', path: '/dashboard/coding', icon: <Code size={20} /> },
    { name: 'Aptitude Test', path: '/dashboard/aptitude', icon: <BookOpen size={20} /> },
    { name: 'Mock Interview', path: '/dashboard/interview', icon: <Mic size={20} /> },
    { name: 'Resume Analyzer', path: '/dashboard/resume', icon: <FileText size={20} /> },
    { name: 'Job Portal', path: '/dashboard/jobs', icon: <Briefcase size={20} /> },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', path: '/dashboard/users', icon: <Users size={20} /> },
    { name: 'AI Problem Setter', path: '/dashboard/setter', icon: <Database size={20} /> },
    { name: 'Aptitude Setter', path: '/dashboard/aptitude-setter', icon: <BookOpen size={20} /> },
    { name: 'Job Setter', path: '/dashboard/job-setter', icon: <Briefcase size={20} /> },
  ];

  const links = userRole === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">SP</div>
        <span>Smart Placement</span>
      </div>
      <div className="sidebar-nav">
        {links.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 'auto' }}>
        <button 
          className="btn-secondary" 
          style={{ width: '100%', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => logoutUser()}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

// Topbar for Dashboard
const TopBar = () => {
  const { mockStudentData, userRole } = useAppContext();
  return (
    <div className="top-bar">
      <h2 className="heading-sm">{userRole === 'admin' ? 'Administrator Panel' : 'Student Portal'}</h2>
      <div className="user-profile">
        <div className="text-body" style={{ textAlign: 'right', marginLeft: '1rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{userRole === 'admin' ? 'Admin User' : mockStudentData.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{userRole === 'admin' ? 'System Maintainer' : 'Premium Student'}</div>
        </div>
        <div className="avatar">
           {userRole === 'admin' ? 'AD' : 'AJ'}
        </div>
      </div>
    </div>
  );
};

// Protected Dashboard Layout
const DashboardLayout = ({ children }) => {
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div style={{ height: '100%' }}>
          {children}
        </div>
      </div>
      
      {/* Floating AI Assistant Widget */}
      <AIChatAssistant />
    </div>
  );
};

// Public Layout
const PublicLayout = ({ children }) => {
  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
};

const AppContent = () => {
  const { userRole } = useAppContext();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/auth" element={<AuthSplit />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard/*" element={
          <DashboardLayout>
            <Routes>
              {userRole === 'student' ? (
                <>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/coding" element={<CodingPractice />} />
                  <Route path="/aptitude" element={<AptitudeTest />} />
                  <Route path="/interview" element={<MockInterview />} />
                  <Route path="/resume" element={<ResumeAnalyzer />} />
                  <Route path="/jobs" element={<JobPortal />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/setter" element={<CodingSetter />} />
                  <Route path="/aptitude-setter" element={<AptitudeSetter />} />
                  <Route path="/job-setter" element={<JobSetter />} />
                  <Route path="*" element={<AdminDashboard />} />
                </>
              )}
            </Routes>
          </DashboardLayout>
        } />
      </Routes>
    </Router>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', color: 'red', background: '#fff', minHeight: '100vh', zIndex: 999999 }}>
          <h2>React Application Crashed</h2>
          <p>{this.state.error.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
