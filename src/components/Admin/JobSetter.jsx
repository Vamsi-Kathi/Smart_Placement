import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Briefcase, PlusCircle, CheckCircle2 } from 'lucide-react';

const JobSetter = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Office');
  const [applyLink, setApplyLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await addDoc(collection(db, "job_postings"), {
        company,
        role,
        startDate,
        endDate,
        description,
        salary,
        location,
        jobType,
        applyLink,
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
      setCompany(''); setRole(''); setStartDate(''); setEndDate(''); setDescription(''); setSalary(''); setLocation(''); setApplyLink('');
    } catch (err) {
      console.error(err);
      alert("Failed to save job posting to Database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Briefcase color="var(--accent-primary)" /> Job Portal Setter
        </h1>
        <p className="text-body" style={{ marginTop: '0.5rem' }}>Post corporate applications for student accessibility.</p>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--success)', fontWeight: 600 }}>
          <CheckCircle2 size={24} /> New Job Posting successfully deployed!
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Company Name</span>
            <input required value={company} onChange={e => setCompany(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. Google" />
          </div>
          <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Job Title / Role</span>
            <input required value={role} onChange={e => setRole(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. Frontend Engineer" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Application Start</span>
            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Application End</span>
            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="text-body" style={{ fontWeight: 600 }}>Job Description</span>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }} placeholder="Detail the requirements, responsibilities, etc..." />
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Salary</span>
            <input required value={salary} onChange={e => setSalary(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. $120,000 / 12 LPA" />
          </div>
          <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Location</span>
            <input required value={location} onChange={e => setLocation(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. San Francisco, CA" />
          </div>
          <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Job Type</span>
            <select value={jobType} onChange={e => setJobType(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
              <option>Remote</option><option>Office</option><option>Hybrid</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="text-body" style={{ fontWeight: 600 }}>External Application Link</span>
          <input required type="url" value={applyLink} onChange={e => setApplyLink(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. https://careers.google.com/..." />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1, marginTop: '1rem' }}>
           <PlusCircle size={20} /> {loading ? 'Saving...' : 'Deploy Job Listing'}
        </button>

      </form>
    </div>
  );
};

export default JobSetter;
