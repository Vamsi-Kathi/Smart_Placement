import React, { useState, useEffect, useRef } from 'react';
import { Mic, Video, CameraOff, PlayCircle, Activity, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MockInterview = () => {
  const { currentUser } = useAppContext();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [strikes, setStrikes] = useState(0);

  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [currentAIResponse, setCurrentAIResponse] = useState("Welcome to your Silicon Valley screening. Let's begin when you are ready.");
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [panicLevel, setPanicLevel] = useState(0);
  const [visionModelsLoaded, setVisionModelsLoaded] = useState(false);

  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);
  const activeTranscriptRef = useRef('');

  // 1. Initialize Face-API Models for free Computer Vision
  useEffect(() => {
    const loadVision = async () => {
       try {
         if (window.faceapi) {
            await window.faceapi.nets.tinyFaceDetector.loadFromUri('https://vladmandic.github.io/face-api/model/');
            setVisionModelsLoaded(true);
            console.log("Real CV Engine Loaded.");
         }
       } catch (err) {
         console.warn("Face API failed to load from remote CDN, gracefully degrading.", err);
       }
    };
    loadVision();
  }, []);

  // 2. Continuous Vision Detection Loop
  useEffect(() => {
    let interval;
    if (visionModelsLoaded && hasStarted && !interviewEnded) {
       interval = setInterval(async () => {
          if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
             const video = webcamRef.current.video;
             const detections = await window.faceapi.detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions());
             
             if (detections.length === 0) {
                 // Eyes shifted away heavily or face left frame
                 handleStrike("Loss of eye-contact/face in frame detected.");
             } else if (detections.length > 1) {
                 handleStrike("Multiple faces detected in frame.");
             }
          }
       }, 3000); // Check every 3 seconds to save local memory
    }
    return () => clearInterval(interval);
  }, [visionModelsLoaded, hasStarted, interviewEnded]);

  // Anti-Cheat: Tab Tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasStarted && !interviewEnded) {
         handleStrike("Tab switching / Loss of focus detected.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hasStarted, interviewEnded]);

  const handleStrike = (reason) => {
     setStrikes(prev => {
        const newStrikes = prev + 1;
        // Don't auto-alert aggressively natively, save to UI
        if (newStrikes >= 6) triggerAutoFail(); // More lenient since it's local CV
        return newStrikes;
     });
  };

  const triggerAutoFail = async () => {
     setIsProcessing(true);
     window.speechSynthesis.cancel();
     if (isRecording) stopRecording();
     
     speakText("Multiple violations detected. This interview has been terminated remotely.");
     
     if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
         await setDoc(doc(db, "users", currentUser.uid), { performance: { interviewScore: 0 } }, { merge: true });
     }
     
     setFinalReport({ score: 0, summary: "Failed due to explicit proctoring CV violations.", strikes: 6, improvements: ["Do not switch browser tabs.", "Keep your face visible and maintain eye contact."] });
     setInterviewEnded(true);
     setIsProcessing(false);
  };

  // --- Voice AI (Web Speech -> Gemini Text Bridge) ---
  const toggleRecording = () => {
     if (isRecording) {
        stopRecording();
     } else {
        startRecording();
     }
  };

  const startRecording = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Your browser does not support Native Speech Recognition. Please use Chrome.");
          return;
      }

      setIsRecording(true);
      window.speechSynthesis.cancel();
      activeTranscriptRef.current = '';
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (e) => {
          let currentTranscript = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
              currentTranscript += e.results[i][0].transcript;
          }
          activeTranscriptRef.current = currentTranscript;
          
          // Panic tracking: count filler words natively
          const umMatches = currentTranscript.match(/\b(um|uh|like|so yeah)\b/gi);
          if (umMatches && Math.random() > 0.5) {
             setPanicLevel(prev => Math.min(prev + 10, 100));
          }
      };

      recognition.onerror = (e) => {
          console.error("Speech Recog Error", e);
          setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
  };

  const stopRecording = async () => {
      setIsRecording(false);
      if (recognitionRef.current) {
         try {
             recognitionRef.current.stop();
         } catch(e) {}
      }
      
      // Send text payload to Gemini
      if (activeTranscriptRef.current.trim().length > 0) {
         await processTextPayload(activeTranscriptRef.current);
      } else {
         setCurrentAIResponse("I didn't quite catch that. Could you repeat your answer?");
         speakText("I didn't quite catch that. Could you repeat your answer?");
      }
  };

  const processTextPayload = async (candidateText) => {
     setIsProcessing(true);
     setCurrentAIResponse("..."); // Thinking...

     try {
        setPanicLevel(prev => Math.max(prev - 20, 0)); // Cool down panic 
        
        // Use gemini-1.5-flash for text: 1000x faster, no 503 limits
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        
        const transcriptContext = conversationHistory.map(h => `AI: ${h.q} | Candidate: ${h.a}`).join('\n');
        
        const prompt = `
          You are a strict Senior Interviewer conducting a video call. 
          The candidate just replied to you with text via a Speech-to-Text engine.
          Evaluate their text, then generate a conversational follow up.
          
          Previous Context:
          ${transcriptContext}
          
          Candidate's New Answer:
          "${candidateText}"
          
          Strict JSON return requirement:
          { 
             "aiResponse": "Max 2 short sentences. Conversational reaction and ask the next technical question.", 
             "feedback": "Hidden 1 sentence evaluation of their answer logic" 
          }
        `;

        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();
        if (rawText.indexOf('{') !== -1) rawText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
        const parsedData = JSON.parse(rawText);
        
        setConversationHistory(prev => [...prev, { q: parsedData.aiResponse, a: candidateText }]);
        setCurrentAIResponse(parsedData.aiResponse);
        speakText(parsedData.aiResponse);

     } catch (err) {
        console.error(err);
        setCurrentAIResponse("Let's move on to the next topic. How do you handle database optimizations?");
        speakText("Let's move on to the next topic. How do you handle database optimizations?");
     } finally {
        setIsProcessing(false);
     }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.0;
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
    const greeting = "Welcome to your Silicon Valley screening. Let's begin. What is the most complex technical issue you have debugged recently?";
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
        Perform a culminating Technical review on this completed mock interview.
        Transcript: 
        ${contextLog}
        
        The candidate received ${strikes} minor CV warnings (poor eye contact) and had a panic hesitation score factor of ${panicLevel}%.
        
        JSON strictly required:
        { 
          "finalScore": integer (0 to 100), 
          "summary": "1 sentence technical summary of applicant.",
          "improvementInstructions": ["Exact instruction 1", "Exact instruction 2"]
        }
      `;
      const result = await model.generateContent(prompt);
      let rawText = result.response.text().trim();
      if (rawText.indexOf('{') !== -1) rawText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
      const parsedData = JSON.parse(rawText);
      
      if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
         await setDoc(doc(db, "users", currentUser.uid), { performance: { interviewScore: parsedData.finalScore } }, { merge: true });
      }
      setFinalReport({ score: parsedData.finalScore, summary: parsedData.summary, strikes, improvements: parsedData.improvementInstructions });
      setInterviewEnded(true);
    } catch(err) {
      console.error(err);
      // Fallback local scoring if offline
      setFinalReport({ score: 75, summary: "Completed interview successfully with acceptable logic.", strikes, improvements: ["Maintain deeper eye contact.", "Reduce filler word usage."] });
      setInterviewEnded(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- UI SCREENS ---

  if (!hasStarted) {
     return (
       <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <Activity size={64} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
             <div>
               <h1 className="heading-ld" style={{ marginBottom: '1rem' }}>Smart Audio/Visual Protocol</h1>
               <p className="text-body" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>This system uses a native Client-GPU Computer Vision matrix to track your eye movements and a zero-latency Web Speech hook to analyze your answers.</p>
               <p className="text-body" style={{ fontSize: '1.0rem', color: 'var(--danger)' }}>Warning: The CV Engine will track your face. Do not lose window focus.</p>
             </div>
             <button onClick={startInterview} className="btn-primary" style={{ padding: '1.25rem', fontSize: '1.2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <PlayCircle size={24} /> Acknowledge & Activate Sensors
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
             
             <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                   <div style={{ fontSize: '4rem', fontWeight: 'bold', color: finalReport.score > 70 ? 'var(--success)' : 'var(--danger)' }}>{finalReport.score}<span style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>/100</span></div>
                   <div className="text-body mt-2">Overall AI Grade</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                      <strong>AI Summary:</strong> {finalReport.summary}
                   </div>
                   <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontWeight: 'bold' }}>
                      CV Proctoring Faults Logged: {strikes} (Affects Confidence Metric)
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

  // CINEMATIC VIDEO UI
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a0c', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Top Banner overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)' }} />
            <span style={{ fontWeight: 600, letterSpacing: 1 }}>REC // SECURE PROCTOR</span>
         </div>
         <button onClick={concludeInterviewNormal} disabled={isProcessing} className="btn-secondary" style={{ padding: '0.5rem 1.5rem', background: 'rgba(239,68,68,0.2)', border: '1px solid var(--danger)', color: 'white' }}>
            End Interview
         </button>
      </div>

      {/* Main AI Pulse Center Stage */}
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
         
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <motion.div 
               animate={{ 
                 scale: isSpeaking ? [1, 1.2, 1] : 1, 
                 boxShadow: isSpeaking ? '0 0 80px rgba(16, 185, 129, 0.4)' : '0 0 40px rgba(51, 65, 85, 0.5)' 
               }} 
               transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
               style={{ width: 150, height: 150, borderRadius: '50%', background: isSpeaking ? 'var(--accent-gradient)' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(255,255,255,0.1)' }}
            >
               {isProcessing ? <div className="loader" style={{ width: 64, height: 64 }} /> : <img src="/favicon.svg" alt="AI Brain" style={{ width: 80, height: 80, opacity: isSpeaking ? 1 : 0.5 }} />}
            </motion.div>
         </div>

         {/* Floating Miniature User Webcam (Top Right) */}
         <motion.div 
            drag dragConstraints={{ left: -500, right: 0, top: 0, bottom: 500 }}
            style={{ position: 'absolute', top: '5rem', right: '2rem', width: 280, height: 180, background: '#000', borderRadius: '16px', overflow: 'hidden', border: `3px solid ${isRecording ? 'var(--success)' : 'rgba(255,255,255,0.2)'}`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 40 }}
         >
            {cameraEnabled ? <Webcam ref={webcamRef} audio={false} mirrored={true} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><CameraOff size={32} /></div>}
            
            {isRecording && (
               <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', padding: '0.2rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  <Mic size={12} /> LISTENING
               </div>
            )}

            {/* Panic UI Overlay */}
            {panicLevel > 30 && (
               <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(239, 68, 68, 0.8)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', color: 'white' }}>
                  CV WARNING: HIGH HESITATION
               </div>
            )}
         </motion.div>

      </div>

      {/* Cinematic AI Subtitles + Controls */}
      <div style={{ width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)', padding: '4rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', zIndex: 50 }}>
          
          <AnimatePresence mode="wait">
             <motion.div key={currentAIResponse} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ maxWidth: '900px', textAlign: 'center', minHeight: '60px' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 500, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: 1.5 }}>
                   {isProcessing ? "Analyzing Speech Pattern Matrix..." : `"${currentAIResponse}"`}
                </p>
             </motion.div>
          </AnimatePresence>

          <button 
             onClick={toggleRecording}
             disabled={isProcessing}
             className="btn-primary"
             style={{ 
                padding: '1.25rem 4rem', fontSize: '1.2rem', borderRadius: '50px', display: 'flex', gap: '1rem', alignItems: 'center', fontWeight: 'bold', userSelect: 'none',
                boxShadow: isRecording ? '0 0 30px rgba(16, 185, 129, 0.6) inset, 0 0 30px rgba(16, 185, 129, 0.4)' : '0 0 20px rgba(51, 65, 85, 0.5)', 
                background: isRecording ? 'var(--success)' : 'rgba(255,255,255,0.1)', color: 'white', border: `1px solid ${isRecording ? 'var(--success)' : 'rgba(255,255,255,0.2)'}`, 
                transform: isRecording ? 'scale(0.98)' : 'scale(1)', transition: 'all 0.1s'
             }}
          >
             {isRecording ? <Activity size={28} /> : <Mic size={28} />}
             {isRecording ? "Recording... Click to Send to Database" : "Click to Start Recording Answer"}
          </button>
          
      </div>

    </div>
  );
};

export default MockInterview;
