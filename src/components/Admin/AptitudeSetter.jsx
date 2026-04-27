import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { BookOpen, PlusCircle, CheckCircle2, Trash2, Send } from 'lucide-react';

const sections = ['Logical', 'Reasoning', 'Grammar', 'Mathematics'];

const AptitudeSetter = () => {
  const [testSetName, setTestSetName] = useState('Standard Test');
  const [level, setLevel] = useState('Easy');
  const [activeSection, setActiveSection] = useState('Logical');
  const [batchQuestions, setBatchQuestions] = useState([]);
  const [draft, setDraft] = useState({ question: '', options: ['', '', '', ''], correctOptionIndex: 0 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const timerMap = {
    'Easy': 60,
    'Medium': 90,
    'Hard': 120,
    'Hard Core': 150,
    'Expert': 180
  };

  const getSectionCount = (section) => batchQuestions.filter(q => q.section === section).length;
  const totalQuestions = batchQuestions.length;

  const addQuestionToSection = () => {
    if (!draft.question.trim()) {
      alert("Please enter a question.");
      return;
    }
    if (draft.options.some(o => !o.trim())) {
      alert("Please fill all 4 options.");
      return;
    }
    if (getSectionCount(activeSection) >= 5) {
      alert(`${activeSection} already has 5 questions. Choose another section.`);
      return;
    }
    setBatchQuestions([...batchQuestions, { ...draft, section: activeSection }]);
    setDraft({ question: '', options: ['', '', '', ''], correctOptionIndex: 0 });
  };

  const removeQuestion = (index) => {
    const updated = [...batchQuestions];
    updated.splice(index, 1);
    setBatchQuestions(updated);
  };

  const updateDraftOption = (idx, value) => {
    const updated = [...draft.options];
    updated[idx] = value;
    setDraft({ ...draft, options: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (batchQuestions.length === 0) {
      alert("Please add at least one question before deploying.");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const promises = batchQuestions.map(q => 
        addDoc(collection(db, "aptitude_questions"), {
          question: q.question,
          category: q.section,
          level,
          testSetName,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          timerSeconds: timerMap[level],
          createdAt: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      
      setSuccess(true);
      setBatchQuestions([]);
      setDraft({ question: '', options: ['', '', '', ''], correctOptionIndex: 0 });
    } catch (err) {
      console.error(err);
      alert("Failed to save questions to Database.");
    } finally {
      setLoading(false);
    }
  };

  const sectionQuestions = batchQuestions.filter(q => q.section === activeSection);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen color="var(--accent-primary)" /> Aptitude Question Setter
        </h1>
        <p className="text-body" style={{ marginTop: '0.5rem' }}>Build full test batches with multiple sections. Add 15–20 questions split across Logical, Reasoning, Grammar, and Mathematics.</p>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--success)', fontWeight: 600 }}>
          <CheckCircle2 size={24} /> {batchQuestions.length} questions successfully deployed to the Student Database!
        </div>
      )}

      {/* Top Settings */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="text-body" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Test Set Name</span>
          <input value={testSetName} onChange={e => setTestSetName(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. TCS NQT, Infosys Alpha" />
        </div>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="text-body" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Difficulty Level</span>
          <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
            <option style={{ background: '#0b0f19', color: 'white' }}>Easy</option>
            <option style={{ background: '#0b0f19', color: 'white' }}>Medium</option>
            <option style={{ background: '#0b0f19', color: 'white' }}>Hard</option>
            <option style={{ background: '#0b0f19', color: 'white' }}>Hard Core</option>
            <option style={{ background: '#0b0f19', color: 'white' }}>Expert</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Auto-Timer: {timerMap[level]} seconds per question</span>
        </div>
        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL QUESTIONS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{totalQuestions}</div>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {sections.map(sec => {
          const count = getSectionCount(sec);
          const isActive = activeSection === sec;
          return (
            <button 
              key={sec}
              onClick={() => setActiveSection(sec)}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: isActive ? 'white' : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {sec} 
              <span style={{ 
                fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '1rem',
                background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                color: isActive ? 'white' : 'var(--text-secondary)'
              }}>
                {count}/5
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Already added questions for this section */}
        {sectionQuestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{activeSection} — Added Questions</h4>
            {sectionQuestions.map((q, idx) => {
              const globalIdx = batchQuestions.findIndex(bq => bq === q);
              return (
                <div key={globalIdx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Q{idx+1}. {q.question}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {q.options.map((opt, oidx) => (
                        <span key={oidx} style={{ fontSize: '0.8rem', color: q.correctOptionIndex === oidx ? 'var(--success)' : 'var(--text-secondary)' }}>
                          {String.fromCharCode(65 + oidx)}. {opt} {q.correctOptionIndex === oidx && '✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeQuestion(globalIdx)}
                    style={{ padding: '0.5rem', background: 'rgba(244, 63, 94, 0.1)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', cursor: 'pointer' }}
                    title="Remove Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Draft Form */}
        <div style={{ borderTop: sectionQuestions.length > 0 ? '1px solid var(--panel-border)' : 'none', paddingTop: sectionQuestions.length > 0 ? '1.5rem' : '0' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Add Question to {activeSection} ({getSectionCount(activeSection)}/5)
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea 
              value={draft.question} 
              onChange={e => setDraft({ ...draft, question: e.target.value })} 
              rows={3} 
              style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }} 
              placeholder={`Enter ${activeSection} question here...`} 
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[0, 1, 2, 3].map(idx => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="radio" 
                    name="draftCorrect" 
                    checked={draft.correctOptionIndex === idx} 
                    onChange={() => setDraft({ ...draft, correctOptionIndex: idx })} 
                    style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                  />
                  <input 
                    value={draft.options[idx]} 
                    onChange={e => updateDraftOption(idx, e.target.value)} 
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`} 
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: draft.correctOptionIndex === idx ? '2px solid var(--success)' : '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                  />
                </div>
              ))}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>* Select the radio button next to the correct answer.</p>
            </div>

            <button 
              type="button"
              onClick={addQuestionToSection}
              disabled={getSectionCount(activeSection) >= 5}
              style={{ 
                padding: '0.75rem 1.5rem', background: getSectionCount(activeSection) >= 5 ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)', 
                border: 'none', borderRadius: 'var(--radius-md)', color: 'white', cursor: getSectionCount(activeSection) >= 5 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600,
                opacity: getSectionCount(activeSection) >= 5 ? 0.5 : 1
              }}
            >
              <PlusCircle size={18} /> Add to {activeSection}
            </button>
          </div>
        </div>
      </div>

      {/* Deploy Button */}
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading || batchQuestions.length === 0} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: loading || batchQuestions.length === 0 ? 0.6 : 1, padding: '1rem' }}>
          <Send size={20} /> {loading ? 'Deploying Batch...' : `Deploy Full Batch (${totalQuestions} Questions)`}
        </button>
      </form>

    </div>
  );
};

export default AptitudeSetter;

