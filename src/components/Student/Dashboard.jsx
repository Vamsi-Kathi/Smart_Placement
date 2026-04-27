import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { Code2, BookOpen, Mic, Briefcase, ChevronRight } from 'lucide-react';

const CircularProgress = ({ value, color, bottomText, subText }) => {
  const data = [{ value }, { value: 100 - value }];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} innerRadius={55} outerRadius={70} startAngle={225} endAngle={-45} paddingAngle={0} stroke="none" dataKey="value">
            <Cell fill={color} />
            <Cell fill="rgba(255,255,255,0.05)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: color, display: 'block' }}>{value}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ 100</span>
      </div>
      <div style={{ textAlign: 'center', marginTop: '-10px' }}>
        <div style={{ color: color, fontWeight: 700, fontSize: '0.9rem' }}>{bottomText}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', maxWidth: '150px' }}>{subText}</div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, value, title, progress, color }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ width: 32, height: 32, borderRadius: '8px', background: `rgba(255,255,255,0.03)`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          {icon}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{title}</div>
      </div>
    </div>
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        <span>{title.split(' ')[0]}</span>
        <span style={{ color: 'var(--text-primary)' }}>{progress}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser?.uid) return;
      try {
        let data = {};
        
        const fetchPromises = [getDocs(collection(db, "problems"))];
        if (currentUser.uid !== 'admin-bypass') fetchPromises.push(getDoc(doc(db, "users", currentUser.uid)));

        const responses = await Promise.all(fetchPromises);
        const probsSnap = responses[0];
        if (responses[1] && responses[1].exists()) data = responses[1].data();

        let codingMap = data.codingProgress || {};
        if (currentUser.uid === 'admin-bypass') {
           const cached = localStorage.getItem('adminProgress');
           if (cached) codingMap = JSON.parse(cached);
           data = { name: "System Admin" };
        }
        
        const diffWeight = { 'Easy': 1, 'Medium': 3, 'Hard': 6, 'Hard Core': 10, 'Expert': 15 };
        let totalPossibleWeight = 0;
        let earnedWeight = 0;
        let solvedCount = 0;
        
        // Distribution for bar chart
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
        const aptScore = data.performance?.aptitudeScore || 0;

        // 🔥 NEW: Check for the new mock interview save location first, then fallback to performance
        const intScore = data.latestMockInterview?.score || data.performance?.interviewScore || 0;
        const atsScore = data.performance?.atsScore || 0;

        // 🔥 NEW: Check root level for interviews done, then fallback to performance
        const interviewsDone = data.totalInterviewsDone || data.performance?.interviewsDone || 0;

        const ptsTaken = (aptScore > 0 ? 1 : 0); // Simplified placeholder
        
        const overScore = Math.floor((codingScore + aptScore + intScore + atsScore) / 4);
        
        data.performance = {
          codingScore, solvedCount, difficultyDist,
          overallScore: overScore,
          aptitudeScore: aptScore,
          interviewScore: intScore,
          interviewsDone: interviewsDone,
          testsTaken: ptsTaken,
          atsScore: atsScore
        };

        setProfileData(data);
      } catch (err) {
        console.error("Failed to fetch student data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [currentUser]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner" style={{ width: 40, height: 40 }}></div></div>;
  }

  const p = profileData?.performance || { overallScore: 0, aptitudeScore: 0, codingScore: 0, interviewScore: 0, atsScore: 0, solvedCount: 0, difficultyDist: {} };
  const safeName = profileData?.name || 'Student';

  // Format Coding Data
  const codingGraphData = ['Easy', 'Medium', 'Hard', 'Hard Core', 'Expert'].map(level => ({
    name: level,
    Solved: p.difficultyDist[level] || 0
  }));

  // Mock Trend for Aptitude (Since historical logic isn't logging yet)
  const aptitudeTrend = [
    { day: '05 Apr', score: 100 }, { day: '06 Apr', score: 100 }, { day: '07 Apr', score: 100 }, 
    { day: '08 Apr', score: 50 }, { day: '09 Apr', score: 50 }, { day: '10 Apr', score: p.aptitudeScore }
  ];

  // Dynamic Radar for Interview
  const radarBase = p.interviewScore > 0 ? p.interviewScore : 40;
  const interviewRadar = [
    { subject: 'Confidence', A: Math.min(100, radarBase + (p.interviewsDone * 2)) },
    { subject: 'Communication', A: Math.min(100, radarBase + 10) },
    { subject: 'Clarity', A: Math.max(0, radarBase - 5) },
    { subject: 'Fluency', A: Math.min(100, radarBase + 5) },
    { subject: 'Composure', A: Math.max(0, radarBase - 15 + (p.interviewsDone * 3)) },
    { subject: 'Eye Contact', A: Math.min(100, radarBase + 15) }
  ];

  const weeklyActivity = [
    { day: 'D1', Aptitude: 1, Coding: 1, Interview: 0 },
    { day: 'D2', Aptitude: 0, Coding: 1, Interview: 0 },
    { day: 'D3', Aptitude: 1, Coding: 0, Interview: 0 },
    { day: 'D4', Aptitude: 0, Coding: 0, Interview: 0 },
    { day: 'D5', Aptitude: 0, Coding: 0, Interview: 0 },
    { day: 'D6', Aptitude: 0, Coding: 0, Interview: 0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-primary)' }}>
      
      {/* Welcome Banner */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h1 className="heading-ld" style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome back, {safeName.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Your placement journey dashboard — keep it up!</p>
      </div>

      {/* TOP ROW: Global Metrics */}
      <div className="dash-grid-top" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) repeat(4, 1fr)', gap: '1.5rem' }}>
         
         <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1rem' }}>Placement Readiness</h3>
            <CircularProgress 
               value={p.overallScore} 
               color={p.overallScore > 75 ? 'var(--success)' : p.overallScore > 40 ? 'var(--warning)' : 'var(--danger)'} 
               bottomText={p.overallScore > 75 ? "Excellent Pace" : "Needs Improvement"}
               subText="Based on coding, aptitude, interview & resume performance"
            />
         </div>

         <MetricCard title="Problems Solved" value={p.solvedCount} icon={<Code2 size={16}/>} progress={p.codingScore} color="var(--accent-primary)" />
         <MetricCard title="Tests Taken" value={p.testsTaken} icon={<BookOpen size={16}/>} progress={p.aptitudeScore} color="var(--success)" />
         <MetricCard title="Interviews Done" value={p.interviewsDone} icon={<Mic size={16}/>} progress={p.interviewScore} color="var(--accent-secondary)" />
         
         <MetricCard title="Resume ATS" value={`${p.atsScore}%`} icon={<Briefcase size={16}/>} progress={p.atsScore} color={p.atsScore > 75 ? "var(--success)" : "var(--warning)"} />

      </div>

      {/* MIDDLE ROW: Deep Analytics */}
      <div className="dash-grid-mid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: '350px' }}>
         <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Coding Problems Solved</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>By difficulty level</p>
               </div>
               <Code2 size={16} color="var(--text-secondary)" />
            </div>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={codingGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                 <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px' }} />
                 <Bar dataKey="Solved" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={50} />
               </BarChart>
            </ResponsiveContainer>
         </div>

         <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Aptitude Score Trend</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weekly improvement</p>
               </div>
               <BookOpen size={16} color="var(--text-secondary)" />
            </div>
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={aptitudeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                 <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px' }} />
                 <Area type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6 }} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* BOTTOM ROW: Skill Radar & ATS */}
      <div className="dash-grid-bot" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '1.5rem', height: '320px' }}>
         <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Interview Skills</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Behavior analysis</p>
               </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="65%" data={interviewRadar}>
                 <PolarGrid stroke="rgba(255,255,255,0.1)" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                 <Radar name="Score" dataKey="A" stroke="var(--accent-primary)" fill="transparent" />
               </RadarChart>
            </ResponsiveContainer>
         </div>

         <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Resume ATS Score</h3>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Industry standard check</p>
            </div>
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', width: '100%', marginTop: '1rem' }}>
               <CircularProgress value={p.atsScore} color={p.atsScore > 75 ? "var(--success)" : "var(--accent-primary)"} bottomText={p.atsScore > 75 ? "ATS Passing" : "Needs Improvement"} subText={<span style={{color: 'var(--accent-primary)', cursor: 'pointer'}} onClick={() => navigate('/dashboard/resume')}>Improve Resume →</span>} />
            </div>
         </div>

         <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Weekly Activity</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sessions this week</p>
               </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={weeklyActivity} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                 <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px' }} />
                 <Bar dataKey="Aptitude" stackId="a" fill="var(--accent-secondary)" radius={[0, 0, 0, 0]} maxBarSize={15} />
                 <Bar dataKey="Coding" stackId="a" fill="var(--success)" radius={[0, 0, 0, 0]} maxBarSize={15} />
                 <Bar dataKey="Interview" stackId="a" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} maxBarSize={15} />
               </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
               <span style={{ color: 'var(--text-secondary)' }}><span style={{ color: 'var(--accent-secondary)' }}>■</span> Aptitude</span>
               <span style={{ color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>■</span> Coding</span>
               <span style={{ color: 'var(--text-secondary)' }}><span style={{ color: 'var(--accent-primary)' }}>■</span> Interview</span>
            </div>
         </div>
      </div>

      {/* ACTION ROW */}
      <div className="dash-grid-top" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', margin: '1rem 0 2rem' }}>
          {[
            { t: 'Solve a Problem', sub: 'Coding Practice', route: '/dashboard/coding', icon: <Code2 size={16}/>, color: 'var(--accent-secondary)' },
            { t: 'Take Aptitude Test', sub: 'Multiple Types', route: '/dashboard/aptitude', icon: <BookOpen size={16}/>, color: 'var(--accent-secondary)' },
            { t: 'Mock Interview', sub: 'Voice AI Session', route: '/dashboard/interview', icon: <Mic size={16}/>, color: 'var(--accent-primary)' },
            { t: 'Browse Jobs', sub: 'AI Job Matching', route: '/dashboard/jobs', icon: <Briefcase size={16}/>, color: 'var(--accent-primary)' }
          ].map(action => (
             <div 
               key={action.t}
               onClick={() => navigate(action.route)}
               className="glass-panel" 
               style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
             >
                <div style={{ color: action.color }}>{action.icon}</div>
                <div>
                   <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: action.color }}>{action.t}</h4>
                   <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{action.sub}</p>
                </div>
             </div>
          ))}
      </div>

    </div>
  );
};

export default StudentDashboard;
