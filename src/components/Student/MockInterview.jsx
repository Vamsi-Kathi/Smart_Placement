import React, { useState, useEffect, useRef } from 'react';
import { Mic, Video, CameraOff, PlayCircle, Activity, CheckCircle2, XCircle, BrainCircuit, ShieldAlert, Zap, Aperture, Settings, FileText } from 'lucide-react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MockInterview = () => {
  const { currentUser } = useAppContext();
  
  // Setup & Config
  const [hasStarted, setHasStarted] = useState(false);
  const [interviewMode, setInterviewMode] = useState('Technical'); // Technical, Behavioral, Scenario
  const [customStack, setCustomStack] = useState('React, Node.js, MongoDB');
  const [resumeContext, setResumeContext] = useState('');
  const [interviewsDone, setInterviewsDone] = useState(0);

  // Core Flow
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [strikes, setStrikes] = useState(0);

  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [currentAIResponse, setCurrentAIResponse] = useState("");
  const [coachFeedback, setCoachFeedback] = useState(""); // Silent Coach feedback
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Telemetry States
  const [confidenceIndex, setConfidenceIndex] = useState(100);
  const [panicLevel, setPanicLevel] = useState(0);
  const [gazeLock, setGazeLock] = useState(100);
  
  const [visionModelsLoaded, setVisionModelsLoaded] = useState(false);

  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);
  const activeTranscriptRef = useRef('');

  useEffect(() => {
    // Load User Firebase Data (Resume context)
    const fetchUserData = async () => {
       if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
          try {
             const d = await getDoc(doc(db, "users", currentUser.uid));
             if (d.exists() && d.data().performance?.resumeContext) {
                 setResumeContext(d.data().performance.resumeContext);
             }
             if (d.exists() && d.data().performance?.interviewsDone) {
                 setInterviewsDone(d.data().performance.interviewsDone);
             }
          } catch(e) {}
       }
    };
    fetchUserData();
  }, [currentUser]);

  // 1. Initialize Face-API
  useEffect(() => {
    const loadVision = async () => {
       try {
         if (window.faceapi) {
            await window.faceapi.nets.tinyFaceDetector.loadFromUri('https://vladmandic.github.io/face-api/model/');
            setVisionModelsLoaded(true);
         }
       } catch (err) {
         console.warn("Face API failed to load from remote CDN, gracefully degrading.", err);
       }
    };
    loadVision();
  }, []);

  // 2. Continuous Vision & Telemetry Loop
  useEffect(() => {
    let interval;
    if (visionModelsLoaded && hasStarted && !interviewEnded) {
       interval = setInterval(async () => {
          setConfidenceIndex(prev => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))));
          
          if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
             const video = webcamRef.current.video;
             const detections = await window.faceapi.detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions());
             
             if (detections.length === 0) {
                 setGazeLock(0);
                 // REMOVED INSTANT STRIKE FOR FACE MOVEMENT (Too buggy/sensitive for laptop keyboards)
             } else if (detections.length > 1) {
                 handleStrike("Multiple faces detected in frame.");
             } else {
                 setGazeLock(100);
             }
          }
       }, 3000); 
    }
    return () => clearInterval(interval);
  }, [visionModelsLoaded, hasStarted, interviewEnded]);

  // Anti-Cheat: Tab Tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasStarted && !interviewEnded) {
         triggerAutoFail("Immediate Tab Switch Detected.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hasStarted, interviewEnded]);

  const handleStrike = (reason) => {
     setStrikes(prev => {
        const newStrikes = prev + 1;
        if (newStrikes >= 6) triggerAutoFail(); 
        return newStrikes;
     });
     setPanicLevel(prev => Math.min(100, prev + 15));
  };

  const triggerAutoFail = async (reason = "Multiple violations detected.") => {
     setIsProcessing(true);
     window.speechSynthesis.cancel();
     if (isRecording) stopRecording();
     
     speakText(`${reason} This interview has been terminated remotely.`);
     
     if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
         await setDoc(doc(db, "users", currentUser.uid), { 
             performance: { 
                 interviewScore: 0, 
                 interviewsDone: interviewsDone + 1 
             } 
         }, { merge: true });
     }
     
     setFinalReport({ score: 0, summary: "Failed due to explicit proctoring CV violations.", strikes: 6, improvements: ["Do not switch browser tabs.", "Keep your face visible and maintain eye contact."] });
     setInterviewEnded(true);
     setIsProcessing(false);
  };

  const toggleRecording = () => {
     if (isRecording) stopRecording();
     else startRecording();
  };

  const startRecording = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Your browser does not support Native Speech Recognition. Please use Google Chrome.");
          return;
      }
      setIsRecording(true);
      window.speechSynthesis.cancel();
      activeTranscriptRef.current = '';
      setLiveTranscript('');
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (e) => {
          let interimTranscript = "";
          let finalTranscriptChunk = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
              if (e.results[i].isFinal) finalTranscriptChunk += e.results[i][0].transcript;
              else interimTranscript += e.results[i][0].transcript;
          }
          activeTranscriptRef.current += finalTranscriptChunk;
          const currentDisplay = activeTranscriptRef.current + interimTranscript;
          setLiveTranscript(currentDisplay);
          
          const umMatches = currentDisplay.match(/\b(um|uh|like|so yeah)\b/gi);
          if (umMatches && Math.random() > 0.5) {
             setPanicLevel(prev => Math.min(prev + 5, 100));
             setConfidenceIndex(prev => Math.max(prev - 2, 0));
          }
      };

      recognition.onerror = (e) => {
          setIsRecording(false);
      };
      recognition.start();
      recognitionRef.current = recognition;
  };

  const stopRecording = async () => {
      setIsRecording(false);
      if (recognitionRef.current) {
         try { recognitionRef.current.stop(); } catch(e) {}
      }
      
      const payload = liveTranscript.trim() || activeTranscriptRef.current.trim();
      setLiveTranscript(payload);

      if (payload.length > 5) {
         await processTextPayload(payload);
      } else {
         setCurrentAIResponse("I didn't quite catch that. Could you give a more complete answer?");
         speakText("I didn't quite catch that. Could you give a more complete answer?");
      }
  };

  const processTextPayload = async (candidateText) => {
     setIsProcessing(true);
     setCurrentAIResponse("..."); 

     try {
        setPanicLevel(prev => Math.max(prev - 5, 0)); 
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        
        const transcriptContext = conversationHistory.map(h => `AI: ${h.q} | Candidate: ${h.a}`).join('\n');
        
        const prompt = `
          You are a supportive interviewer conducting a beginner-level mock interview for a ${customStack} Software Engineer.
          Topic/Focus: ${interviewMode}
          Candidate Resume Context: ${resumeContext || 'None'}
          
          Your responsibilities:
          1. Ask one question at a time, beginning with simple, beginner-friendly topics (e.g., "Explain a project you worked on", "What is React used for?").
          2. Gradually increase difficulty only if the candidate answers confidently.
          3. Provide constructive feedback in plain language — highlight strengths and suggest one improvement.
          4. Avoid jargon, proctor flags, or system notes. Keep the tone encouraging and realistic.

          The candidate just replied: "${candidateText}"
          
          Past Context:
          ${transcriptContext}
          
          STRICT JSON OUTPUT REQUIREMENT (Do not return raw text, ONLY valid JSON):
          { 
             "aiResponse": "Conversational, beginner-friendly response + adaptive follow-up. 1-2 short sentences max.", 
             "coachFeedback": "Constructive, warm feedback highlighting what they did right and one simple suggestion for improvement."
          }
        `;

        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();
        if (rawText.indexOf('{') !== -1) rawText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
        const parsedData = JSON.parse(rawText);
        
        setConversationHistory(prev => [...prev, { q: parsedData.aiResponse, a: candidateText }]);
        setCurrentAIResponse(parsedData.aiResponse);
        setCoachFeedback(parsedData.coachFeedback);
        setLiveTranscript(''); 
        speakText(parsedData.aiResponse);

     } catch (err) {
        console.error("AI JSON Parse Error:", err);
        setCurrentAIResponse("Could you elaborate a bit more on that?");
        setCoachFeedback("Keep your answers detailed and clear.");
        speakText("Could you elaborate a bit more on that?");
        setLiveTranscript('');
     } finally {
        setIsProcessing(false);
     }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.95;
    utterance.rate = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const proVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Emma") || v.lang === "en-US");
    if (proVoice) utterance.voice = proVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    setHasStarted(true);
    let greeting = `Hi there! Welcome to the mock interview. This is just for practice, so relax. `;
    if (resumeContext) greeting += `I see from your background you have some great experience. To start us off, `;
    else greeting += `I'll start with a few simple questions and we'll go from there. `;
    
    greeting += `Could you briefly introduce yourself and tell me what interests you about software development?`;
    
    setCurrentAIResponse(greeting);
    speakText(greeting);
  };

  const concludeInterviewNormal = async () => {
    setIsProcessing(true);
    window.speechSynthesis.cancel();
    if (isRecording) stopRecording();
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
      const contextLog = conversationHistory.map(h => `AI: ${h.q}\nCandidate: ${h.a}`).join('\n\n');
      
      const prompt = `
        Perform a supportive, realistic review on this completed mock interview practice session.
        Transcript: 
        ${contextLog}
        
        IMPORTANT: This is a beginner-level mock interview. Be encouraging but realistic. Highlight their effort and learning potential.
        
        Strictly output valid JSON:
        { 
          "finalScore": integer (0 to 100, score them fairly but encouragingly), 
          "summary": "1 sentence warm, constructive summary of applicant's performance.",
          "improvementInstructions": ["Clear, encouraging instruction 1", "Actionable advice 2"]
        }
      `;
      const result = await model.generateContent(prompt);
      let rawText = result.response.text().trim();
      if (rawText.indexOf('{') !== -1) rawText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
      const parsedData = JSON.parse(rawText);
      
      if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
         await setDoc(doc(db, "users", currentUser.uid), { 
             performance: { 
                 interviewScore: parsedData.finalScore,
                 interviewsDone: interviewsDone + 1
             } 
         }, { merge: true });
      }
      setFinalReport({ score: parsedData.finalScore, summary: parsedData.summary, strikes, improvements: parsedData.improvementInstructions });
      setInterviewEnded(true);
    } catch(err) {
       // local fallback
      setFinalReport({ score: 65, summary: "Completed interview. Connectivity to AI evaluator interrupted.", strikes, improvements: ["Maintain deeper eye contact.", "Reduce filler word usage."] });
      setInterviewEnded(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- UI SCREENS ---

  if (!hasStarted) {
     return (
       <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             
             <div style={{ textAlign: 'center' }}>
                <Settings size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
                <h1 className="heading-ld" style={{ marginBottom: '0.5rem' }}>Configure Simulation</h1>
                <p className="text-body" style={{ fontSize: '1rem' }}>Adjust the parameters for the AI Interrogation.</p>
             </div>
             
             {resumeContext && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '1rem', borderRadius: '8px', color: 'var(--success)', display: 'flex', gap: '0.75rem', fontSize: '0.9rem' }}>
                   <FileText size={18} style={{ flexShrink: 0 }}/>
                   <span><strong>Resume Sync Active:</strong> AI will interrogate you based on your uploaded resume data.</span>
                </div>
             )}

             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Interview Mode</span>
                    <select value={interviewMode} onChange={e => setInterviewMode(e.target.value)} style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: 'white' }}>
                        <option style={{ background: '#0b0f19' }}>Technical</option>
                        <option style={{ background: '#0b0f19' }}>HR / Behavioral</option>
                        <option style={{ background: '#0b0f19' }}>Scenario Based</option>
                    </select>
                </div>
                
                {interviewMode === 'Technical' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Targeted Tech Stack</span>
                      <input 
                         value={customStack} onChange={e => setCustomStack(e.target.value)} 
                         placeholder="e.g. Java, Spring Boot, MySQL"
                         style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: 'white' }} 
                      />
                  </div>
                )}
             </div>

             <button onClick={startInterview} className="btn-primary" style={{ padding: '1.25rem', fontSize: '1.2rem', display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <PlayCircle size={24} /> Initialize HUD
             </button>
          </div>
       </div>
     );
  }

  if (interviewEnded && finalReport) {
     return (
       <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-color)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ maxWidth: '800px', width: '100%', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: finalReport.score > 70 ? 'var(--success)' : 'var(--danger)' }} />
             <h1 className="heading-ld" style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                {finalReport.score > 70 ? <CheckCircle2 size={36} color="var(--success)" /> : <XCircle size={36} color="var(--danger)" />}
                Candidate CV & Audio Review
             </h1>
             <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                   <div style={{ fontSize: '4rem', fontWeight: 'bold', color: finalReport.score > 70 ? 'var(--success)' : 'var(--danger)' }}>{finalReport.score}<span style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>/100</span></div>
                   <div className="text-body mt-2">Strict AI Grade</div>
                </div>
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                      <strong>AI Review:</strong> {finalReport.summary}
                   </div>
                   <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontWeight: 'bold' }}>
                      CV Proctoring Faults Logged: {strikes}
                   </div>
                </div>
             </div>
             {finalReport.improvements && (
                <div style={{ padding: '2rem', background: 'var(--panel-bg)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                   <h3 className="heading-sm" style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BrainCircuit /> Core Instructions
                   </h3>
                   <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {finalReport.improvements.map((imp, idx) => (
                         <li key={idx} style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{imp}</li>
                      ))}
                   </ul>
                </div>
             )}
             <button onClick={() => window.location.reload()} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                Conclude Evaluation
             </button>
          </div>
       </div>
     );
  }

  // MATRIX HUD UI
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#070a13', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Top Banner overlay */}
      <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)' }} />
            <span style={{ fontWeight: 700, letterSpacing: 2, fontSize: '0.9rem' }}>SECURE LIVE PROCTOR // {interviewMode.toUpperCase()}</span>
         </div>
         <button onClick={concludeInterviewNormal} disabled={isProcessing} className="btn-secondary" style={{ padding: '0.5rem 1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: 'var(--danger)' }}>
            Terminate Feed
         </button>
      </div>

      <div className="mock-interview-layout" style={{ flexGrow: 1, display: 'flex', position: 'relative' }}>
         
         {/* LEFT SCREEN: HUD Telemetry */}
         <div className="telemetry-panel" style={{ width: '320px', background: 'rgba(0,0,0,0.4)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 30, overflowY: 'auto' }}>
            
            <div>
               <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: '1rem' }}>System Sensors</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                       <span style={{ color: 'var(--accent-primary)' }}>Confidence Index</span>
                       <span style={{ color: 'white' }}>{confidenceIndex.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                       <motion.div animate={{ width: `${confidenceIndex}%` }} style={{ height: '100%', background: 'var(--accent-primary)' }}/>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                       <span style={{ color: gazeLock > 50 ? 'var(--success)' : 'var(--danger)' }}>Gaze Alignment</span>
                       <span style={{ color: 'white' }}>{gazeLock}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                       <motion.div animate={{ width: `${gazeLock}%` }} style={{ height: '100%', background: gazeLock > 50 ? 'var(--success)' : 'var(--danger)' }}/>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                       <span style={{ color: panicLevel > 50 ? 'var(--warning)' : 'var(--success)' }}>Vocal Stress</span>
                       <span style={{ color: 'white' }}>{panicLevel.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                       <motion.div animate={{ width: `${panicLevel}%` }} style={{ height: '100%', background: panicLevel > 50 ? 'var(--warning)' : 'var(--success)' }}/>
                    </div>
                  </div>
               </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: strikes > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                  <ShieldAlert size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Proctor Flags</span>
               </div>
               <div style={{ fontSize: '2rem', fontWeight: 800, color: strikes > 0 ? 'var(--warning)' : 'white' }}>{strikes} / 6</div>
            </div>

         </div>

         {/* CENTER SCREEN: AI Main Stage */}
         <div className="mock-main-stage" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '4rem' }}>
                <motion.div 
                   animate={{ scale: isSpeaking ? [1, 1.3, 1] : 1, rotate: isSpeaking ? 360 : 0 }} 
                   transition={{ repeat: Infinity, duration: isSpeaking ? 4 : 20, ease: 'linear' }}
                   style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', border: '1px dashed rgba(59, 130, 246, 0.2)' }}
                />
                <motion.div 
                   animate={{ scale: isSpeaking ? [1.1, 0.9, 1.1] : 1, rotate: isSpeaking ? -360 : 0 }} 
                   transition={{ repeat: Infinity, duration: isSpeaking ? 3 : 15, ease: 'linear' }}
                   style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', border: '2px solid rgba(16, 185, 129, 0.1)' }}
                />
                <motion.div 
                  animate={{ boxShadow: isSpeaking ? '0 0 100px rgba(16, 185, 129, 0.6)' : isProcessing ? '0 0 60px rgba(59, 130, 246, 0.6)' : '0 0 40px rgba(0,0,0, 0.8)' }} 
                  style={{ width: 140, height: 140, borderRadius: '50%', background: isProcessing ? 'var(--accent-primary)' : isSpeaking ? 'var(--success)' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative' }}
                >
                   {isProcessing ? <Activity size={50} color="white" /> : <BrainCircuit size={60} color="white" style={{ opacity: isSpeaking ? 1 : 0.5 }} />}
                </motion.div>
            </div>

            <div style={{ width: '100%', maxWidth: '800px', padding: '0 2rem', textAlign: 'center', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <AnimatePresence mode="wait">
                   <motion.div key={currentAIResponse} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ minHeight: '80px' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.8)', lineHeight: 1.5 }}>
                         {isProcessing ? <span style={{ color: 'var(--accent-primary)' }}>Parsing Cognitive Inputs...</span> : `"${currentAIResponse}"`}
                      </p>
                   </motion.div>
                </AnimatePresence>
                
                {/* Silent Coach Panel */}
                {coachFeedback && !isProcessing && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: 'var(--accent-secondary)' }}>
                      <strong>Silent Coach Note:</strong> {coachFeedback}
                   </motion.div>
                )}

                <div style={{ minHeight: '60px', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${isRecording ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                   <p style={{ fontSize: '1.1rem', color: isRecording ? 'var(--success)' : 'var(--text-secondary)', fontStyle: 'italic', transition: 'all 0.2s' }}>
                      {liveTranscript || (isRecording ? "Listening..." : "Waiting for your response...")}
                   </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                  <button 
                     onClick={toggleRecording}
                     disabled={isProcessing}
                     className="btn-primary"
                     style={{ 
                        padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px', display: 'flex', gap: '1rem', alignItems: 'center', fontWeight: 'bold',
                        boxShadow: isRecording ? '0 0 30px rgba(16, 185, 129, 0.4)' : '0 10px 20px rgba(0,0,0, 0.2)', 
                        background: isRecording ? 'var(--success)' : 'var(--accent-primary)'
                     }}
                  >
                     {isRecording ? <Activity size={24} /> : <Mic size={24} />}
                     {isRecording ? "Transmitting Answer" : "Hold & Speak Answer"}
                  </button>
                </div>
            </div>

            <motion.div 
               className="miniature-webcam"
               drag dragConstraints={{ left: -600, right: 0, top: 0, bottom: 400 }}
               style={{ position: 'absolute', top: '2rem', right: '2rem', width: 240, height: 160, background: '#000', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${gazeLock > 50 ? 'rgba(255,255,255,0.2)' : 'var(--danger)'}`, boxShadow: '0 20px 40px rgba(0,0,0,0.8)', zIndex: 100 }}
            >
               {cameraEnabled ? <Webcam ref={webcamRef} audio={false} mirrored={true} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CameraOff size={32} /></div>}
            </motion.div>

         </div>
      </div>
    </div>
  );
};

export default MockInterview;
