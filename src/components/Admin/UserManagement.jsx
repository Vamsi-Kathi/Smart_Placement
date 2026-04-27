import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { Search, Trash2, UserX, Eye, X, Code2, BookOpen, Mic, Briefcase, BarChart3, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const UserManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const querySnapshot = await getDocs(q);
      
      const fetchedStudents = [];
      querySnapshot.forEach((document) => {
        fetchedStudents.push({ id: document.id, ...document.data() });
      });

      setStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}'s profile completely?`)) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setStudents(students.filter(s => s.id !== userId));
        if (selectedStudent?.id === userId) {
          setSelectedStudent(null);
          setStudentDetails(null);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Check console.");
      }
    }
  };

  const openStudentDetails = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    setActiveTab('profile');
    try {
      // Fetch problems to compute coding stats
      const probsSnap = await getDocs(collection(db, "problems"));
      const codingMap = student.codingProgress || {};
      
      const diffWeight = { 'Easy': 1, 'Medium': 3, 'Hard': 6, 'Hard Core': 10, 'Expert': 15 };
      let totalPossibleWeight = 0;
      let earnedWeight = 0;
      let solvedCount = 0;
      const difficultyDist = { 'Easy': 0, 'Medium': 0, 'Hard': 0, 'Hard Core': 0, 'Expert': 0 };

      probsSnap.docs.forEach(doc => {
        const pData = doc.data();
        const weight = diffWeight[pData.level] || 1;
        totalPossibleWeight += weight;
        if (codingMap[doc.id]?.solved) {
          earnedWeight += weight;
          solvedCount++;
          difficultyDist[pData.level] = (difficultyDist[pData.level] || 0) + 1;
        }
      });

      const codingScore = totalPossibleWeight > 0 ? Math.floor((earnedWeight / totalPossibleWeight) * 100) : 0;
      const perf = student.performance || {};
      const aptScore = perf.aptitudeScore || 0;
      const intScore = student.latestMockInterview?.score || perf.interviewScore || 0;
      const atsScore = perf.atsScore || 0;
      const interviewsDone = student.totalInterviewsDone || perf.interviewsDone || 0;
      const overallScore = Math.floor((codingScore + aptScore + intScore + atsScore) / 4);

      setStudentDetails({
        codingScore,
        solvedCount,
        difficultyDist,
        aptitudeScore: aptScore,
        interviewScore: intScore,
        atsScore,
        interviewsDone,
        overallScore,
        testsTaken: perf.testsTaken || 0
      });
    } catch (err) {
      console.error("Error fetching student details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.primaryLanguage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const codingGraphData = studentDetails ? ['Easy', 'Medium', 'Hard', 'Hard Core', 'Expert'].map(level => ({
    name: level,
    Solved: studentDetails.difficultyDist[level] || 0
  })) : [];

  const MetricCard = ({ icon, value, title, color, sub }) => (
    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: color }}>
        {icon}
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="heading-lg">User Management</h1>
          <p className="text-body" style={{ marginTop: '0.5rem' }}>View, manage, and filter the platform's registered students.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search name, email, or language..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
             Fetching Database...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '1rem' }}>
             <UserX size={48} opacity={0.5} />
             <span>No students found.</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', overflowY: 'auto', flexGrow: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.02)', position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid var(--panel-border)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Student Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Degree & Year</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Role</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Weakness (AI Target)</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id}
                    style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.05)' }}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{student.name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{student.email}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.9rem' }}>{student.profile?.degree || 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.profile?.year || 'Unknown'} • {student.profile?.primaryLanguage || 'Language TBD'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>{student.profile?.careerGoal || 'Not Set'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {student.profile?.weakness || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          onClick={() => openStudentDetails(student)}
                          style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id, student.name)}
                          style={{ padding: '0.5rem', background: 'rgba(244, 63, 94, 0.1)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'var(--bg-color)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedStudent.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedStudent.email}</p>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--panel-border)' }}>
              <button 
                onClick={() => setActiveTab('profile')}
                style={{ 
                  padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'profile' ? 'var(--accent-primary)' : 'transparent'}`, 
                  color: activeTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' 
                }}
              >
                <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Profile
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                style={{ 
                  padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'stats' ? 'var(--accent-primary)' : 'transparent'}`, 
                  color: activeTab === 'stats' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' 
                }}
              >
                <BarChart3 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Stats & Reports
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem', overflowY: 'auto', flexGrow: 1 }}>
              {detailsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)' }}>
                  Loading student analytics...
                </div>
              ) : activeTab === 'profile' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Basic Info</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full Name</div>
                        <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedStudent.name || 'N/A'}</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</div>
                        <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedStudent.email || 'N/A'}</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Degree</div>
                        <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedStudent.profile?.degree || 'Not Set'}</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Year</div>
                        <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedStudent.profile?.year || 'Not Set'}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Career & Skills</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Career Goal</div>
                        <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedStudent.profile?.careerGoal || 'Not Set'}</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target Company</div>
                        <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedStudent.profile?.targetCompany || 'Not Set'}</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Primary Language</div>
                        <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedStudent.profile?.primaryLanguage || 'Not Set'}</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Target Weakness</div>
                        <div style={{ fontWeight: 600, marginTop: '0.25rem', color: 'var(--danger)' }}>{selectedStudent.profile?.weakness || 'General'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Overall Readiness */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--panel-border)' }}>
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: studentDetails?.overallScore > 75 ? 'var(--success)' : studentDetails?.overallScore > 40 ? 'var(--warning)' : 'var(--danger)' }}>
                        {studentDetails?.overallScore || 0}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ 100</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Placement Readiness</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Based on coding, aptitude, interview & resume performance
                      </div>
                    </div>
                  </div>

                  {/* Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <MetricCard 
                      icon={<Code2 size={18} />} 
                      value={`${studentDetails?.codingScore || 0}%`} 
                      title="Coding Score" 
                      color="var(--accent-primary)" 
                      sub={`${studentDetails?.solvedCount || 0} problems solved`}
                    />
                    <MetricCard 
                      icon={<BookOpen size={18} />} 
                      value={`${studentDetails?.aptitudeScore || 0}%`} 
                      title="Aptitude Score" 
                      color="var(--success)" 
                      sub={`${studentDetails?.testsTaken || 0} tests taken`}
                    />
                    <MetricCard 
                      icon={<Mic size={18} />} 
                      value={`${studentDetails?.interviewScore || 0}%`} 
                      title="Interview Score" 
                      color="var(--accent-secondary)" 
                      sub={`${studentDetails?.interviewsDone || 0} interviews done`}
                    />
                    <MetricCard 
                      icon={<Briefcase size={18} />} 
                      value={`${studentDetails?.atsScore || 0}%`} 
                      title="Resume ATS" 
                      color={studentDetails?.atsScore > 75 ? "var(--success)" : "var(--warning)"} 
                      sub={studentDetails?.atsScore > 75 ? "ATS Passing" : "Needs Improvement"}
                    />
                  </div>

                  {/* Coding Difficulty Chart */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Coding Problems by Difficulty</h4>
                    {studentDetails?.solvedCount === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--panel-border)', borderRadius: 'var(--radius-md)' }}>
                        No coding problems solved yet.
                      </div>
                    ) : (
                      <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={codingGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px' }} />
                            <Bar dataKey="Solved" radius={[4, 4, 0, 0]} maxBarSize={50}>
                              {codingGraphData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

