import React, { useState, useEffect } from 'react';
import { Users, Code, BookOpen, TrendingUp } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalAptitudeQuestions, setTotalAptitudeQuestions] = useState(0);
  const [avgStudentScore, setAvgStudentScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const querySnapshot = await getDocs(q);
        
        const fetchedStudents = [];
        let totalScore = 0;
        querySnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          fetchedStudents.push(data);
          const perf = data.performance || {};
          totalScore += perf.overallScore || 0;
        });
        setStudents(fetchedStudents);
        setAvgStudentScore(fetchedStudents.length > 0 ? Math.floor(totalScore / fetchedStudents.length) : 0);

        // Fetch total coding problems
        const problemsSnap = await getDocs(collection(db, "problems"));
        setTotalProblems(problemsSnap.size);

        // Fetch total aptitude questions
        const aptitudeSnap = await getDocs(collection(db, "aptitude_questions"));
        setTotalAptitudeQuestions(aptitudeSnap.size);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalStudents = students.length;
  
  // Graph 1: Year of Study
  const yearCounts = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0, 'Graduated': 0 };
  const companyCounts = {};

  students.forEach(s => {
    if (s.profile?.year && yearCounts[s.profile.year] !== undefined) {
      yearCounts[s.profile.year]++;
    }
    if (s.profile?.targetCompany) {
       companyCounts[s.profile.targetCompany] = (companyCounts[s.profile.targetCompany] || 0) + 1;
    }
  });
  
  const yearGraphData = Object.keys(yearCounts).map(year => ({
    name: year,
    Students: yearCounts[year]
  }));

  const companyGraphData = Object.keys(companyCounts).map(company => ({
    name: company.includes('FAANG') ? 'Top Tech' : (company.includes('Service') ? 'Service MNC' : 'Startups'),
    value: companyCounts[company]
  }));

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const adminMetrics = [
    { label: 'Total Registered Students', value: loading ? '...' : totalStudents, icon: <Users size={24} color="var(--accent-primary)" /> },
    { label: 'Total Coding Problems', value: loading ? '...' : totalProblems, icon: <Code size={24} color="var(--success)" /> },
    { label: 'Total Aptitude Questions', value: loading ? '...' : totalAptitudeQuestions, icon: <BookOpen size={24} color="var(--warning)" /> },
    { label: 'Avg Student Score', value: loading ? '...' : `${avgStudentScore}%`, icon: <TrendingUp size={24} color="var(--accent-secondary)" /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="heading-lg">Admin Overview</h1>
        <p className="text-body" style={{ marginTop: '0.5rem' }}>Real-time statistics fed directly from the Google Firebase Database.</p>
      </div>

      <div className="dashboard-metrics">
        {adminMetrics.map((m) => (
          <div 
            key={m.label} 
            className="glass-panel"
            style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
          >
            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
              {m.icon}
            </div>
            <div>
              <div className="text-body" style={{ fontSize: '0.9rem' }}>{m.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Graph 1 */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '280px', padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="heading-sm" style={{ marginBottom: '1.5rem' }}>Student Batch Distribution</h3>
          {loading ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading Database...</div>
          ) : students.length === 0 ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No students registered yet.</div>
          ) : (
            <div style={{ flexGrow: 1, width: '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearGraphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  <Bar dataKey="Students" radius={[6, 6, 0, 0]}>
                    {yearGraphData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Graph 2 */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '280px', padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="heading-sm" style={{ marginBottom: '1.5rem' }}>Target Company Tiers</h3>
          {loading ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading Database...</div>
          ) : companyGraphData.length === 0 ? (
             <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No target data available.</div>
          ) : (
            <div style={{ flexGrow: 1, width: '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  <Pie data={companyGraphData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {companyGraphData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[(index + 2) % colors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
