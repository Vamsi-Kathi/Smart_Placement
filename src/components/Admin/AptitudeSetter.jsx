import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { BookOpen, PlusCircle, CheckCircle2 } from 'lucide-react';

const AptitudeSetter = () => {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Mathematical');
  const [level, setLevel] = useState('Easy');
  const [testSetName, setTestSetName] = useState('Standard Test');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto calculate timer based on level
  const timerMap = {
    'Easy': 60,
    'Medium': 90,
    'Hard': 120,
    'Hard Core': 150,
    'Expert': 180
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const optionsArray = [opt1, opt2, opt3, opt4];

    try {
      await addDoc(collection(db, "aptitude_questions"), {
        question,
        category,
        level,
        testSetName,
        options: optionsArray,
        correctOptionIndex: parseInt(correctOptionIndex, 10),
        timerSeconds: timerMap[level],
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
      setQuestion(''); setOpt1(''); setOpt2(''); setOpt3(''); setOpt4(''); setCorrectOptionIndex(0);
    } catch (err) {
      console.error(err);
      alert("Failed to save problem to Database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen color="var(--accent-primary)" /> Aptitude Question Setter
        </h1>
        <p className="text-body" style={{ marginTop: '0.5rem' }}>Add new quantitative and reasoning questions to the Student portal.</p>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--success)', fontWeight: 600 }}>
          <CheckCircle2 size={24} /> New aptitude question successfully added!
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Question Type / Category</span>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
              <option style={{ background: '#0b0f19', color: 'white' }}>Quantitative</option>
              <option style={{ background: '#0b0f19', color: 'white' }}>Logical</option>
              <option style={{ background: '#0b0f19', color: 'white' }}>Verbal</option>
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Difficulty Level</span>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
              <option style={{ background: '#0b0f19', color: 'white' }}>Easy</option><option style={{ background: '#0b0f19', color: 'white' }}>Medium</option><option style={{ background: '#0b0f19', color: 'white' }}>Hard</option><option style={{ background: '#0b0f19', color: 'white' }}>Hard Core</option><option style={{ background: '#0b0f19', color: 'white' }}>Expert</option>
            </select>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Auto-Timer: {timerMap[level]} seconds</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Test Set Name</span>
            <input value={testSetName} onChange={e => setTestSetName(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. Test 1, TCS NQT" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="text-body" style={{ fontWeight: 600 }}>Question Text</span>
          <textarea required value={question} onChange={e => setQuestion(e.target.value)} rows={3} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }} placeholder="Enter the aptitude question here..." />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.02)', border: '1px dashed var(--panel-border)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Multiple Choices</h4>
          
          {[1, 2, 3, 4].map((num, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="radio" 
                name="correctOption" 
                value={idx} 
                checked={correctOptionIndex === idx} 
                onChange={() => setCorrectOptionIndex(idx)} 
                style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
              />
              <input 
                required 
                value={num === 1 ? opt1 : num === 2 ? opt2 : num === 3 ? opt3 : opt4} 
                onChange={e => {
                  if(num===1) setOpt1(e.target.value);
                  if(num===2) setOpt2(e.target.value);
                  if(num===3) setOpt3(e.target.value);
                  if(num===4) setOpt4(e.target.value);
                }} 
                placeholder={`Option ${num}`} 
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: correctOptionIndex === idx ? '2px solid var(--success)' : '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
              />
            </div>
          ))}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>* Select the radio button next to the correct answer.</p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
           <PlusCircle size={20} /> {loading ? 'Saving...' : 'Deploy Aptitude Question'}
        </button>

      </form>
    </div>
  );
};

export default AptitudeSetter;
