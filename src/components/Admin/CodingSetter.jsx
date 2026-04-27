import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Database, PlusCircle, CheckCircle2, Trash2 } from 'lucide-react';

const CodingSetter = () => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Easy');
  const [category, setCategory] = useState('Arrays');
  const [description, setDescription] = useState('');
  
  const [publicInput, setPublicInput] = useState('');
  const [publicOutput, setPublicOutput] = useState('');
  
  const [hiddenCases, setHiddenCases] = useState([{ input: '', output: '' }]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addHiddenCase = () => {
    setHiddenCases([...hiddenCases, { input: '', output: '' }]);
  };

  const removeHiddenCase = (index) => {
    if (hiddenCases.length === 1) {
      setHiddenCases([{ input: '', output: '' }]);
      return;
    }
    setHiddenCases(hiddenCases.filter((_, i) => i !== index));
  };

  const updateHiddenCase = (index, field, value) => {
    const updated = [...hiddenCases];
    updated[index][field] = value;
    setHiddenCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Filter out empty hidden cases
    const validHiddenCases = hiddenCases.filter(c => c.input.trim() !== '' && c.output.trim() !== '');
    if (validHiddenCases.length === 0) {
      alert("Please provide at least one complete hidden test case.");
      setLoading(false);
      return;
    }

    try {
      const qId = `q_custom_${Date.now()}`;
      await setDoc(doc(db, "problems", qId), {
        title,
        level,
        category,
        description,
        publicCases: [{ input: publicInput, output: publicOutput }],
        hiddenCases: validHiddenCases,
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
      setTitle(''); 
      setDescription(''); 
      setPublicInput(''); 
      setPublicOutput(''); 
      setHiddenCases([{ input: '', output: '' }]);
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
          <Database color="var(--accent-primary)" /> AI Problem Setter
        </h1>
        <p className="text-body" style={{ marginTop: '0.5rem' }}>Inject new algorithmic challenges directly into the Student IDE platform.</p>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--success)', fontWeight: 600 }}>
          <CheckCircle2 size={24} /> New problem successfully deployed to the Student Database!
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Problem Title</span>
            <input required value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. Reverse Linked List" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Difficulty</span>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
              <option>Easy</option><option>Medium</option><option>Hard</option><option>Hard Core</option><option>Expert</option>
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-body" style={{ fontWeight: 600 }}>Category</span>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
              <option>Arrays</option><option>Strings</option><option>Dynamic Programming</option><option>Graphs</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="text-body" style={{ fontWeight: 600 }}>Problem Description</span>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }} placeholder="Explain the problem scenario..." />
        </div>

        {/* Public Test Case */}
        <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.02)', border: '1px dashed var(--panel-border)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Public Test Case</h4>
            <input required value={publicInput} onChange={e => setPublicInput(e.target.value)} placeholder="Input (e.g. nums=[1,2])" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} />
            <input required value={publicOutput} onChange={e => setPublicOutput(e.target.value)} placeholder="Expected Output (e.g. 3)" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Hidden Test Cases (Gemini Graded) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(244, 63, 94, 0.03)', border: '1px dashed rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ color: 'var(--danger)', fontWeight: 700 }}>Hidden Test Cases (Gemini Graded)</h4>
            <button 
              type="button"
              onClick={addHiddenCase}
              style={{ 
                padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--danger)', 
                borderRadius: 'var(--radius-sm)', color: 'var(--danger)', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 
              }}
            >
              <PlusCircle size={16} /> Add Hidden Case
            </button>
          </div>
          
          {hiddenCases.map((hc, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  value={hc.input} 
                  onChange={e => updateHiddenCase(idx, 'input', e.target.value)} 
                  placeholder={`Hidden Input ${idx + 1}`} 
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                />
                <input 
                  value={hc.output} 
                  onChange={e => updateHiddenCase(idx, 'output', e.target.value)} 
                  placeholder={`Expected Output ${idx + 1}`} 
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
                />
              </div>
              <button 
                type="button"
                onClick={() => removeHiddenCase(idx)}
                style={{ 
                  padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', border: 'none', 
                  borderRadius: 'var(--radius-sm)', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' 
                }}
                title="Remove Hidden Case"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>* At least one hidden test case with both input and output is required.</p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
           <PlusCircle size={20} /> {loading ? 'Injecting...' : 'Deploy Problem to Students'}
        </button>

      </form>
    </div>
  );
};

export default CodingSetter;

