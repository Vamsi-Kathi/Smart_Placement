import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Database, PlusCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CodingSetter = () => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Easy');
  const [category, setCategory] = useState('Arrays');
  const [description, setDescription] = useState('');
  
  const [publicInput, setPublicInput] = useState('');
  const [publicOutput, setPublicOutput] = useState('');
  
  const [hiddenInput, setHiddenInput] = useState('');
  const [hiddenOutput, setHiddenOutput] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const qId = `q_custom_${Date.now()}`;
      await setDoc(doc(db, "problems", qId), {
        title,
        level,
        category,
        description,
        publicCases: [{ input: publicInput, output: publicOutput }],
        hiddenCases: [{ input: hiddenInput, output: hiddenOutput }],
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
      setTitle(''); setDescription(''); setPublicInput(''); setPublicOutput(''); setHiddenInput(''); setHiddenOutput('');
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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--success)', fontWeight: 600 }}>
          <CheckCircle2 size={24} /> New problem successfully deployed to the Student Database!
        </motion.div>
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

        <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.02)', border: '1px dashed var(--panel-border)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Public Test Case</h4>
            <input required value={publicInput} onChange={e => setPublicInput(e.target.value)} placeholder="Input (e.g. nums=[1,2])" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }} />
            <input required value={publicOutput} onChange={e => setPublicOutput(e.target.value)} placeholder="Expected Output (e.g. 3)" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }} />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--danger)', fontWeight: 700 }}>Hidden Test Case (Gemini Graded)</h4>
            <input required value={hiddenInput} onChange={e => setHiddenInput(e.target.value)} placeholder="Edge Case Input" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }} />
            <input required value={hiddenOutput} onChange={e => setHiddenOutput(e.target.value)} placeholder="Expected Edge Output" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
           <PlusCircle size={20} /> {loading ? 'Injecting...' : 'Deploy Problem to Students'}
        </button>

      </form>
    </div>
  );
};

export default CodingSetter;
