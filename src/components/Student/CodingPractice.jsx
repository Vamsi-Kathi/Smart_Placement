import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Code2, Play, CheckCircle2, AlertTriangle, ShieldAlert, BookOpen, Send, ListTree, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useAppContext } from '../../context/AppContext';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const CodingPractice = () => {
  const { currentUser, theme } = useAppContext();
  const [problems, setProblems] = useState([]);
  const [userProgress, setUserProgress] = useState({}); // { probId: { highestScore: int, solved: boolean } }
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [viewState, setViewState] = useState('list');
  const [activeProblem, setActiveProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [codeTemplate, setCodeTemplate] = useState('');
  
  // Execution State
  const [loading, setLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState(null);

  // Lock down the Monaco Instance directly
  const handleEditorDidMount = (editor, monaco) => {
    editor.updateOptions({ contextmenu: false }); // Disable Right Click natively
    
    editor.onKeyDown((e) => {
      // 86 is KeyV, 67 is KeyC
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 52 /* V */ || e.keyCode === 33 /* C */)) {
        e.preventDefault();
        e.stopPropagation();
        alert("SECURITY TRIGGER: Copy and Paste strictly prohibited in test mode.");
      }
    });
  };

  useEffect(() => {
    const fetchCoreData = async () => {
      try {
        // Fetch All Problems
        const snapshot = await getDocs(collection(db, "problems"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const getWeight = (l) => {
           if (!l) return 6;
           const str = l.toLowerCase();
           if (str === 'easy') return 1;
           if (str === 'medium') return 2;
           if (str === 'hard') return 3;
           if (str === 'hard core') return 4;
           if (str === 'expert') return 5;
           return 6;
        };
        
        const sortedArray = data.sort((a,b) => {
           const wA = getWeight(a.level);
           const wB = getWeight(b.level);
           if (wA !== wB) return wA - wB;
           return a.id.localeCompare(b.id);
        });
        
        setProblems([...sortedArray]);

        // Fetch Current User Progress
        if (currentUser?.uid === 'admin-bypass') {
          const cachedProgress = localStorage.getItem('adminProgress');
          if (cachedProgress) {
            setUserProgress(JSON.parse(cachedProgress));
          }
        } else if (currentUser?.uid) {
          const uDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (uDoc.exists()) {
            setUserProgress(uDoc.data().codingProgress || {});
          }
        }
      } catch (err) {
        console.error("Failed fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoreData();
  }, [currentUser]);

  useEffect(() => {
    if (activeProblem) {
      const cacheKey = `code_${activeProblem.id}_${language}`;
      const savedCode = localStorage.getItem(cacheKey);
      
      if (savedCode) {
        setCodeTemplate(savedCode);
      } else {
        if (language === 'python') setCodeTemplate(`def solve():\n    # Write your optimized solution here\n    pass`);
        if (language === 'javascript') setCodeTemplate(`function solve() {\n    // Write your optimized solution here\n    return null;\n}`);
        if (language === 'java') setCodeTemplate(`class Solution {\n    public static void main(String[] args) {\n        // Write your optimized solution here\n    }\n}`);
        if (language === 'cpp') setCodeTemplate(`#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your optimized solution here\n    return 0;\n}`);
      }
    }
  }, [activeProblem, language]);

  const handleRunCode = async () => {
    if (codeTemplate.length < 5) return alert("Write some code first!");
    setIsExecuting(true);
    setTerminalOutput(null);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        Act strictly as a code compiler sandbox. Do NOT output markdown or conversational text. Look at this exactly like a server terminal.
        Language: ${language}
        Code:
        """${codeTemplate}"""
        Public Test Input: ${activeProblem.publicCases?.[0]?.input || "None provided"}
        Expected Output: ${activeProblem.publicCases?.[0]?.output || "None provided"}
        
        Mentally execute the code against ONLY this public input. Determine if it logically prints the Expected Output, or if there is a Syntax Error or Runtime Crash.
        Return raw plain text.
      `;
      const result = await model.generateContent(prompt);
      setTerminalOutput({ type: 'run', text: result.response.text().trim() });
    } catch (err) {
      console.error(err);
      setTerminalOutput({ type: 'run', text: `Internal Sandbox Error: ${err.message || "Failed to contact Gemini."}` });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (codeTemplate.length < 5) return alert("Write some code first!");
    setIsExecuting(true);
    setTerminalOutput(null);
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const prompt = `
        You are an elite automated code grading AI for HackerRank.
        Student Language: ${language}
        Problem: ${activeProblem.title}
        Public Cases: ${JSON.stringify(activeProblem.publicCases || [])}
        Hidden Cases: ${JSON.stringify(activeProblem.hiddenCases || [])}
        Student Code:
        """${codeTemplate}"""
        
        Return a strict JSON object mapping strictly to this schema:
        {
          "passedPublic": true/false,
          "passedHidden": true/false,
          "plagiarismRisk": "Low" | "High",
          "score": integer (0 to 100),
          "feedback": "1 short specific sentence explaining why it passed or failed."
        }
      `;
      const result = await model.generateContent(prompt);
      let rawText = result.response.text().trim();
      
      // Fallback robust json extractor if Google decides to prepend text
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        rawText = rawText.substring(jsonStart, jsonEnd + 1);
      }
      
      const parsedReport = JSON.parse(rawText);
      
      setTerminalOutput({ type: 'submit', data: parsedReport });

      // Live Database Tracking (Logic for Only Highest Score)
      if (currentUser?.uid) {
        const existingRecord = userProgress[activeProblem.id] || { highestScore: -1 };
        const finalScore = Number(parsedReport.score) || 0;
        
        if (finalScore >= existingRecord.highestScore) {
           const updatedProgressMap = {
             ...userProgress,
             [activeProblem.id]: {
               highestScore: finalScore,
               solved: finalScore >= 95 || existingRecord.solved === true,
               lastSubmitted: new Date().toISOString()
             }
           };

           // Push to Firebase directly for active students
           if (currentUser.uid !== 'admin-bypass') {
             const userRef = doc(db, "users", currentUser.uid);
             await setDoc(userRef, { codingProgress: updatedProgressMap }, { merge: true });
           } else {
             // Save to cache for Admin bypassing so problems don't reset to unattempted on reload
             localStorage.setItem('adminProgress', JSON.stringify(updatedProgressMap));
           }
           
           // Update Local State instantly so UI reflects it!
           setUserProgress(updatedProgressMap);
        }
      }

    } catch (err) {
      console.error("AI JSON Parse Error:", err);
      setTerminalOutput({ type: 'run', text: `AI Evaluation Failed to parse JSON. Error: ${err.message}` });
    } finally {
      setIsExecuting(false);
    }
  };

  const getDifficultyColor = (level) => {
    if(level === 'Easy') return 'var(--success)';
    if(level === 'Medium') return 'var(--warning)';
    if(level === 'Hard Core') return '#8b5cf6'; // Vivid Purple
    if(level === 'Expert') return '#db2777'; // Pure Pink
    return 'var(--danger)'; // Default Hard
  };

  if (viewState === 'list') {
    const filteredProblems = problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="heading-lg">Coding Challenge Arena</h1>
            <p className="text-body" style={{ marginTop: '0.5rem' }}>Select an elite algorithm scenario to practice your logic.</p>
          </div>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search problems..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)', outline: 'none' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
             <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Syncing Server Problems...</div>
          ) : (
            <div style={{ overflowX: 'auto', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-color)', position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid var(--panel-border)' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Title</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Score</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((prob, idx) => {
                    const probData = userProgress[prob.id];
                    return (
                    <motion.tr 
                      key={prob.id} 
                      onClick={() => { setActiveProblem(prob); setViewState('solve'); setTerminalOutput(null); }}
                      style={{ borderBottom: '1px solid var(--panel-border)', cursor: 'pointer', transition: 'background 0.2s ease' }}
                      whileHover={{ backgroundColor: 'var(--overlay-bg)' }}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                         {probData?.solved ? (
                           <CheckCircle2 size={20} color="var(--success)" title="Solved" />
                         ) : probData?.highestScore >= 0 ? (
                           <AlertTriangle size={18} color="var(--warning)" title="Attempted" />
                         ) : (
                           <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'transparent', border: '2px solid var(--text-secondary)', opacity: 0.3 }} title="Unattempted" />
                         )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>{prob.title}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                         {probData ? `${probData.highestScore}/100` : '-'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: getDifficultyColor(prob.level) }}>{prob.level}</td>
                    </motion.tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 120px)', width: '100%' }}>
      
      {/* ⬅ LEFT PANE: Description */}
      <div className="glass-panel" style={{ width: '35%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--panel-border)', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <button onClick={() => setViewState('list')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
             &larr; Problem List
           </button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
          <h2 className="heading-md" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{activeProblem.title}</h2>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '15px', background: 'var(--overlay-bg)', color: getDifficultyColor(activeProblem.level) }}>{activeProblem.level}</span>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '15px', background: 'var(--overlay-bg)', color: 'var(--text-secondary)' }}>{activeProblem.category}</span>
          </div>
          <p className="text-body" style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{activeProblem.description}</p>
          
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Example 1:</h4>
          <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.9rem', border: '1px solid var(--panel-border)' }}>
            <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Input:</strong> {activeProblem.publicCases?.[0]?.input || "None"}</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Output:</strong> {activeProblem.publicCases?.[0]?.output || "None"}</div>
          </div>
        </div>
      </div>

      {/* ➡ RIGHT PARENT: Split Editor / Terminal */}
      <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* TOP RIGHT: Monaco Editor */}
        <div className="glass-panel" style={{ flex: 1.8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--panel-border)', background: 'var(--panel-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', padding: '0.35rem 0.75rem', borderRadius: '4px', outline: 'none', fontSize: '0.85rem' }}>
              <option value="python">Python3</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="javascript">JavaScript</option>
            </select>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleRunCode} disabled={isExecuting} className="btn-secondary" style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                 <Play size={14} /> Run
              </button>
              <button onClick={handleSubmitCode} disabled={isExecuting} className="btn-primary" style={{ padding: '0.35rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                 {isExecuting ? 'Judging...' : <><Send size={14} /> Submit</>}
              </button>
            </div>
          </div>
          
          <div 
             style={{ flexGrow: 1, width: '100%', background: 'var(--panel-bg)', position: 'relative' }}
             onCopy={(e) => { e.preventDefault(); alert("Copying code is strictly disabled."); }}
             onPaste={(e) => { e.preventDefault(); alert("Pasting code is strictly prohibited during test assessments."); }}
             onContextMenu={(e) => e.preventDefault()}
          >
            <div style={{ position: 'absolute', top: 5, right: 15, zIndex: 10, fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 'bold' }}>
              <ShieldAlert size={12} style={{ display: 'inline', marginRight: '4px' }} />Anti-Cheat Active
            </div>
            <Editor
              height="100%"
              theme={theme === 'light' ? 'light' : 'vs-dark'}
              language={language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'javascript'}
              value={codeTemplate}
              onChange={(val) => {
                setCodeTemplate(val);
                localStorage.setItem(`code_${activeProblem.id}_${language}`, val);
              }}
              onMount={handleEditorDidMount}
              options={{ minimap: { enabled: false }, fontSize: 15, padding: { top: 16 }, scrollBeyondLastLine: false, smoothScrolling: true, contextmenu: false }}
            />
          </div>
        </div>

        {/* BOTTOM RIGHT: Terminal / Output */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-color)' }}>
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', gap: '1.5rem', background: 'var(--panel-bg)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: terminalOutput ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Test Cases</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: terminalOutput ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Execution Result</span>
          </div>
          
          <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
            
            {!terminalOutput && !isExecuting && (
              <div style={{ color: 'var(--text-secondary)' }}>
                <h5 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Run constraints against Public Input:</h5>
                <pre style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '4px' }}>{activeProblem.publicCases?.[0]?.input || "No test cases established."}</pre>
              </div>
            )}

            {isExecuting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--warning)', fontWeight: 'bold' }}>
                <span className="loader"></span> ⚙️ AI Engine Executing Code...
              </div>
            )}

            {terminalOutput?.type === 'run' && (
              <div style={{ color: terminalOutput.text.includes('Accepted') ? 'var(--success)' : 'var(--danger)', fontSize: '0.95rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {terminalOutput.text}
              </div>
            )}

            {terminalOutput?.type === 'submit' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <h2 style={{ color: terminalOutput.data.score === 100 ? 'var(--success)' : 'var(--danger)', fontSize: '1.5rem', fontWeight: 800 }}>
                   {terminalOutput.data.score === 100 ? 'Accepted' : 'Wrong Answer'}
                 </h2>
                 <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
                    <span style={{ color: terminalOutput.data.passedHidden ? 'var(--success)' : 'var(--danger)' }}>Hidden Cases: {terminalOutput.data.passedHidden ? 'Passed' : 'Failed'}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Plagiarism Risk: {terminalOutput.data.plagiarismRisk}</span>
                    <span style={{ color: 'var(--text-primary)' }}>Score Achieved: {terminalOutput.data.score}/100</span>
                 </div>
                 <div style={{ padding: '1rem', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                   " {terminalOutput.data.feedback} "
                 </div>
               </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default CodingPractice;
