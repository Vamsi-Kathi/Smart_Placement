import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Search, XCircle, ChevronRight, Activity } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const ResumeAnalyzer = () => {
  const { currentUser } = useAppContext();
  const [fileData, setFileData] = useState(null); // { base64: string, name: string, type: string }
  const [jobDescription, setJobDescription] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null); 
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setError('');
    setResults(null);
    
    // Strict format check
    if (file.type !== 'application/pdf') {
       setError("System strictly requires .pdf formats for native ATS parsing. Please upload a PDF.");
       return;
    }
    
    // Size check max 5MB to be safe
    if (file.size > 5 * 1024 * 1024) {
       setError("File is too large. Maximum PDF size is 5MB.");
       return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
       const base64String = reader.result.split(',')[1];
       setFileData({
          base64: base64String,
          name: file.name,
          mimeType: file.type
       });
    };
    reader.readAsDataURL(file);
  };

  const analyzeResume = async () => {
    if (!fileData) return;
    setIsProcessing(true);
    setError('');
    
    try {
      const model = genAI.getGenerativeModel({
         model: "gemini-2.5-flash",
         generationConfig: { responseMimeType: "application/json" }
      });
      
      const filePart = {
        inlineData: {
          data: fileData.base64,
          mimeType: fileData.mimeType
        }
      };
      
      const isTargeted = jobDescription.trim().length > 10;
      
      let prompt = '';
      if (isTargeted) {
         prompt = `
           You are an elite Applicant Tracking System (ATS) and Senior Hiring Manager. 
           I have attached a candidate's resume (PDF) and the following strictly targeted Job Description:
           ---
           ${jobDescription}
           ---
           Perform a rigorous semantic analysis. Do they possess the explicit skills required by this JD? 
           Return a strict JSON object:
           {
              "score": integer (0 to 100 representing exact alignment to JD),
              "summary": "2 sentences explaining why they are or aren't a fit for this specific job",
              "strengths": ["List of 3 strong points mapping to JD"],
              "fixes": ["List of 3 formatting or structural errors in the resume"],
              "missingKeywords": ["Array of exact technical/soft skill keywords mentioned in JD but missing from the resume"]
           }
         `;
      } else {
         prompt = `
           You are an elite Applicant Tracking System (ATS) and Senior Resume Coach.
           I have attached a candidate's resume (PDF).
           Perform a rigorous structural and impact analysis. Is this resume perfectly formatted? Do they quantify their bullet points with metrics? Are there spelling errors?
           Return a strict JSON object:
           {
              "score": integer (0 to 100 overall professional quality),
              "summary": "2 sentences explaining the overall quality and impression",
              "strengths": ["List of 3 strongest elements in this resume"],
              "fixes": ["List of exact critical fixes needed (e.g. missing metrics, weak action verbs)"],
              "missingKeywords": ["Array of generic industry keywords they probably should add based on their apparent field"]
           }
         `;
      }

      const result = await model.generateContent([prompt, filePart]);
      let rawText = result.response.text().trim();
      if (rawText.indexOf('{') !== -1) rawText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
      
      const parsedData = JSON.parse(rawText);
      setResults({ ...parsedData, mode: isTargeted ? 'Targeted' : 'Generic' });
      
      // 🔥 FIXED FIREBASE SAVE (dot notation prevents wiping other performance fields)
      if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
         try {
            await setDoc(doc(db, "users", currentUser.uid), {
               "performance.atsScore": parsedData.score,
               "performance.resumeContext": parsedData.summary + " | Strengths: " + (parsedData.strengths || []).join(", ")
            }, { merge: true });
         } catch(e) { console.error("Firebase Sync Error", e); }
      }
      
    } catch (err) {
      console.error(err);
      setError(`AI Processing Failure: ${err.message}. Usually this means the Google Free Tier quota was hit. Please wait 1 minute.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getScoreColor = (score) => {
     if (score >= 80) return 'var(--success)';
     if (score >= 60) return 'var(--warning)';
     return 'var(--danger)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Search color="var(--accent-primary)" /> AI Resume Parser</h2>
          <p className="text-body" style={{ marginTop: '0.25rem' }}>Upload your PDF to test against Silicon Valley ATS standards.</p>
        </div>
      </div>

      <div className="page-split-layout">
        
        {/* Left Side: Upload & Input Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div 
            className="glass-panel" 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              border: `2px dashed ${fileData ? 'var(--success)' : 'var(--panel-border)'}`,
              background: fileData ? 'rgba(16, 185, 129, 0.05)' : 'var(--panel-bg)',
              cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: 'var(--radius-lg)'
            }}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf" style={{ display: 'none' }} />
            
            {fileData ? (
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                     <FileText size={32} />
                  </div>
                  <h3 className="heading-sm" style={{ color: 'var(--success)' }}>Document Securely Loaded</h3>
                  <p className="text-body" style={{ fontSize: '0.9rem' }}>{fileData.name}</p>
               </div>
            ) : (
               <>
                  <UploadCloud size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                  <h3 className="heading-sm">Drop Resume PDF Here</h3>
                  <p className="text-body" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Strictly restricted to .pdf files (Max 5MB)</p>
               </>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
             <h3 className="heading-sm" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
               <span>Job Description Match <span style={{ fontSize: '0.7rem', verticalAlign: 'middle', background: 'var(--accent-gradient)', padding: '2px 8px', borderRadius: '10px', color: 'white', marginLeft: '0.5rem' }}>OPTIONAL</span></span>
             </h3>
             <p className="text-body" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Paste a specific Job Description to unlock the "Targeted" analysis mode, checking for exact keyword matches.</p>
             <textarea 
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste JD here... (If left blank, AI performs generic ATS formatting scan instead)"
                style={{ flexGrow: 1, width: '100%', minHeight: '150px', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
             />
          </div>

          <button 
             onClick={analyzeResume} 
             disabled={!fileData || isProcessing}
             className="btn-primary" 
             style={{ padding: '1.25rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', opacity: (!fileData || isProcessing) ? 0.5 : 1 }}
          >
             {isProcessing ? <div className="loader" style={{ width: 24, height: 24 }} /> : <Activity size={24} />}
             {isProcessing ? "Gemini Parsing PDF..." : "Initiate ATS Scan"}
          </button>
          
          {error && (
             <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.9rem', display: 'flex', gap: '0.5rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} /> {error}
             </div>
          )}
        </div>

        {/* Right Side: Results Dashboard */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: results ? 1 : 0.3, pointerEvents: results ? 'auto' : 'none', transition: 'all 0.4s ease' }}>
          
          {!results ? (
             <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <Search size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3 className="heading-sm">Awaiting Document Submission</h3>
                <p>Upload a PDF to generate analytics constraint matrix.</p>
             </div>
          ) : (
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                   
                   {/* Top Score Bar */}
                   <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)`, borderLeft: `6px solid ${getScoreColor(results.score)}` }}>
                      <div style={{ flexShrink: 0, textAlign: 'center' }}>
                         <div style={{ fontSize: '4rem', fontWeight: 'bold', color: getScoreColor(results.score), lineHeight: 1 }}>{results.score}</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginTop: '0.25rem' }}>ATS Score</div>
                      </div>
                      <div>
                         <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>{results.mode} Analysis</h3>
                         <p className="text-body" style={{ fontSize: '1rem', lineHeight: 1.6 }}>{results.summary}</p>
                      </div>
                   </div>

                   {/* Scrollable Data Blocks */}
                   <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.5rem' }}>
                      
                      {/* Negative / Fixes */}
                      {results.fixes && results.fixes.length > 0 && (
                         <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '1rem' }}><XCircle size={18} /> Critical Formatting Errors</h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
                               {results.fixes.map((fix, idx) => (
                                 <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <ChevronRight size={16} color="var(--danger)" style={{ marginTop: '3px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.95rem' }}>{fix}</span>
                                 </li>
                               ))}
                            </ul>
                         </div>
                      )}

                      {/* Missing Keywords (Highly valuable if targeted) */}
                      {results.missingKeywords && results.missingKeywords.length > 0 && (
                         <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '1rem' }}><Activity size={18} /> Missing System Keywords (Add These)</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                               {results.missingKeywords.map((kw, idx) => (
                                 <div key={idx} style={{ padding: '0.4rem 0.8rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>{kw}</div>
                               ))}
                            </div>
                         </div>
                      )}

                      {/* Positive / Strengths */}
                      {results.strengths && results.strengths.length > 0 && (
                         <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '1rem' }}><CheckCircle size={18} /> Validated Strengths</h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
                               {results.strengths.map((str, idx) => (
                                 <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <ChevronRight size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.95rem' }}>{str}</span>
                                 </li>
                               ))}
                            </ul>
                         </div>
                      )}

                   </div>
                </div>
                       )}

        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
