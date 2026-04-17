import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, Target, AlertTriangle, ExternalLink, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAppContext } from '../../context/AppContext';

const JobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { mockStudentData } = useAppContext();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "job_postings"));
      const fetched = [];
      querySnapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setJobs(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // AI Matching Simulation
  const getSimulatedMatchScore = (job) => {
    // Just a fun heuristic based on mock data and job text
    let score = mockStudentData.overallScore || 70;
    const desc = job.description?.toLowerCase() || '';
    
    // Penalize if strict words are present but student score is low
    if ((desc.includes('senior') || desc.includes('expert')) && score < 85) score -= 20;
    if (desc.includes('junior') || desc.includes('intern')) score += 15;
    
    // Random jitter for simulation
    score += (job.id.charCodeAt(0) % 15) - 7; 
    
    return Math.min(Math.max(score, 30), 98);
  };

  const filteredJobs = jobs.filter(j => 
    j.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="heading-md">AI Job Matches</h2>
        <button className="btn-secondary" onClick={fetchJobs} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCcw size={16} /> Refresh Market
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search jobs, skills, or companies..." 
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>No jobs found matching your criteria.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredJobs.map((job) => {
            const matchScore = getSimulatedMatchScore(job);
            const isMismatch = matchScore < 70;
            
            return (
              <motion.div 
                key={job.id}
                className="glass-panel"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: isMismatch ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--panel-border)' }}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{job.role}</h3>
                    <div className="text-body" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                      <Building size={14} /> {job.company}
                    </div>
                  </div>
                  <div 
                    style={{ 
                      background: `rgba(${isMismatch ? '239,68,68' : matchScore > 85 ? '16,185,129' : '245,158,11'}, 0.15)`, 
                      color: isMismatch ? 'var(--danger)' : matchScore > 85 ? 'var(--success)' : 'var(--warning)', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Target size={14} /> {matchScore}% Match
                  </div>
                </div>

                <div className="text-body" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {job.location} ({job.jobType})</span>
                  <span>•</span>
                  <span>{job.salary}</span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>
                
                {isMismatch && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <AlertTriangle color="var(--danger)" size={16} style={{ flexShrink: 0, marginTop: '2px' }}/>
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger)', lineHeight: 1.4 }}>
                      <strong>Low ATS Score Predicted.</strong> Your resume lacks key skills required for this role. Use the AI Resume Analyzer to re-align your keywords before applying.
                    </span>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <a href={job.applyLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', flex: 1 }}>
                    <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      Apply via Portal <ExternalLink size={16} />
                    </button>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobPortal;
