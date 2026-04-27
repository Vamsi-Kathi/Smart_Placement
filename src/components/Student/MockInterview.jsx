import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, Video, CameraOff, PlayCircle, Activity, ShieldAlert,
  CheckCircle2, XCircle, Bot, User, StopCircle, Eye, BrainCircuit, HeartPulse
} from 'lucide-react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MockInterview = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();

  // --- SETUP STATE ---
  const [hasStarted, setHasStarted] = useState(false);
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [techStack, setTechStack] = useState('General');

  // --- INTERVIEW STATE ---
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [strikes, setStrikes] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAIResponse, setCurrentAIResponse] = useState(
    "Welcome to your Silicon Valley screening. Let's begin when you are ready."
  );
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ========== Direct Voice Recording ==========
  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      setIsRecording(true);
      window.speechSynthesis.cancel();
      audioChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          await processAudioPayload(mimeType);
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
      } catch (err) {
        alert("Hardware Error: Could not access your microphone.");
        setIsRecording(false);
      }
    }
  };

  const processAudioPayload = async (mimeType) => {
    if (audioChunksRef.current.length === 0) return;
    setIsProcessing(true);
    setCurrentAIResponse("...");
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const base64Audio = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(audioBlob);
      });

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const transcriptContext = conversationHistory.map(
        h => `AI asked: ${h.q} | Candidate responded previously.`
      ).join('\n');

      const prompt = `
You are a strict Senior Interviewer conducting an interview for the role: ${jobTitle}.
${techStack && techStack.trim().toLowerCase() !== 'general' ? `Relevant domain/topics: ${techStack}` : ''}

Listen to the candidate's RAW AUDIO response to your previous question.

Previous Context:
${transcriptContext}

Important: If the role is non-technical (like HR, Sales, Marketing, etc.), ask behavioral or situational questions. 
If the role is technical, ask technical questions based on the required skills.

Return ONLY a JSON object (no markdown):
{
  "transcriptionOfWhatTheySaid": "transcript of the audio",
  "aiResponse": "Max 2 short sentences. Conversational response and ask the next appropriate interview question.",
  "feedback": "Hidden evaluation"
}`;

      const result = await model.generateContent([prompt, {
        inlineData: { data: base64Audio, mimeType }
      }]);
      let rawText = result.response.text().trim();
      if (rawText.indexOf('{') !== -1)
        rawText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
      const parsed = JSON.parse(rawText);

      setConversationHistory(prev => [
        ...prev,
        { q: parsed.aiResponse, a: parsed.transcriptionOfWhatTheySaid }
      ]);
      setCurrentAIResponse(parsed.aiResponse);
      speakText(parsed.aiResponse);
    } catch (err) {
      console.error(err);
      setCurrentAIResponse(`Network Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== Anti-Cheat ==========
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasStarted && !interviewEnded) {
        handleStrike("Tab switching / Loss of focus detected.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hasStarted, interviewEnded, strikes]);

  const handleStrike = (reason) => {
    setStrikes(prev => {
      const newStrikes = prev + 1;
      alert(`⚠️ WARNING STRIKE: ${reason}`);
      if (newStrikes >= 3) triggerAutoFail();
      return newStrikes;
    });
  };

  const triggerAutoFail = async () => {
    setIsProcessing(true);
    window.speechSynthesis.cancel();
    if (isRecording) toggleRecording();
    speakText("Multiple violations detected. Interview terminated.");
    if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
      await setDoc(doc(db, "users", currentUser.uid),
        { performance: { interviewScore: 0 } }, { merge: true });
    }
    setFinalReport({
      score: 0,
      summary: "Failed due to proctoring violations.",
      strikes: 3,
      improvements: ["Do not switch browser tabs during a live interview."]
    });
    setInterviewEnded(true);
    setIsProcessing(false);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.0;
    utterance.rate = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const proVoice = voices.find(v =>
      v.name.includes("Google") || v.name.includes("Emma") || v.lang === "en-US"
    );
    if (proVoice) utterance.voice = proVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // First question is always "introduce yourself"
  const startInterview = () => {
    setHasStarted(true);
    const greeting = "Hello! I'm your interviewer. Could you please introduce yourself?";
    setCurrentAIResponse(greeting);
    speakText(greeting);
    setConversationHistory([{ q: greeting, a: '' }]);
  };

  const concludeInterviewNormal = async () => {
    setIsProcessing(true);
    window.speechSynthesis.cancel();
    if (isRecording) toggleRecording();
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const contextLog = conversationHistory.map(
        h => `AI: ${h.q}\nUser Audio Transcript: ${h.a}`
      ).join('\n\n');

      const prompt = `
Perform a culminating review of this mock interview.
Transcript:
${contextLog}

Return ONLY valid JSON:
{
  "finalScore": integer (0 to 100),
  "summary": "1 sentence evaluation of the candidate.",
  "improvementInstructions": ["specific improvement 1", "specific improvement 2"]
}`;

      const result = await model.generateContent(prompt);
      let rawText = result.response.text().trim();
      if (rawText.indexOf('{') !== -1)
        rawText = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
      const parsed = JSON.parse(rawText);

      const score = parsed.finalScore || 0;
      const summary = parsed.summary || '';
      const improvements = parsed.improvementInstructions || [];

      if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
          latestMockInterview: {
            date: new Date().toISOString(),
            role: jobTitle,
            stack: techStack,
            score,
            feedback: summary
          },
          totalInterviewsDone: increment(1),
          'performance.interviewScore': score
        }, { merge: true });
      }

      setFinalReport({ score, summary, strikes, improvements });
      setInterviewEnded(true);
    } catch (err) {
      console.error(err);
      alert("AI Scoring Engine Failed. Check Google Quota.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== UI SCREENS ==========

  if (!hasStarted) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <Activity size={48} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
          <h1 className="heading-ld">Mock Interview Setup</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter the role and topics – the AI will adapt.</p>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Role</label>
            <input
              type="text"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Software Engineer, HR Manager"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'white', marginTop: '0.5rem' }}
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Domain / Tech Stack</label>
            <input
              type="text"
              value={techStack}
              onChange={e => setTechStack(e.target.value)}
              placeholder="e.g. React, Node.js, Java, HR Policies, Labour Laws"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'white', marginTop: '0.5rem' }}
            />
          </div>

          <button onClick={startInterview} className="btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <PlayCircle size={20} /> Enter Interview
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
          <h1 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            {finalReport.score > 70 ? <CheckCircle2 size={36} color="var(--success)" /> : <XCircle size={36} color="var(--danger)" />}
            Interview Complete
          </h1>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: finalReport.score > 70 ? 'var(--success)' : 'var(--danger)' }}>
                {finalReport.score}<span style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>/100</span>
              </div>
              <div className="text-body mt-2">Overall Score</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                <strong>AI Summary:</strong> {finalReport.summary}
              </div>
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontWeight: 'bold' }}>
                Proctoring Violations: {strikes}/3
              </div>
            </div>
          </div>

          {finalReport.improvements && (
            <div style={{ padding: '2rem', background: 'var(--panel-bg)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BrainCircuit /> Key Improvements
              </h3>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {finalReport.improvements.map((imp, idx) => (
                  <li key={idx} style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{imp}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ flex: 1, padding: '1rem' }}
            >
              Retake Interview
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a0c', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)' }} />
          <span style={{ fontWeight: 600, letterSpacing: 1 }}>REC // SECURE PROCTOR</span>
        </div>
        <button onClick={concludeInterviewNormal} disabled={isProcessing} className="btn-secondary" style={{ padding: '0.5rem 1.5rem', background: 'rgba(239,68,68,0.2)', border: '1px solid var(--danger)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
          End Interview
        </button>
      </div>

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

        <motion.div
          drag dragConstraints={{ left: -500, right: 0, top: 0, bottom: 500 }}
          style={{ position: 'absolute', top: '5rem', right: '2rem', width: 280, height: 180, background: '#000', borderRadius: '16px', overflow: 'hidden', border: `3px solid ${isRecording ? 'var(--success)' : 'rgba(255,255,255,0.2)'}`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 40 }}
        >
          {cameraEnabled ? <Webcam audio={false} mirrored={true} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><CameraOff size={32} /></div>}
          {isRecording && (
            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', padding: '0.2rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--success)' }}>
              <Mic size={12} /> LISTENING
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)', padding: '4rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', zIndex: 50 }}>
        <AnimatePresence mode="wait">
          <motion.div key={currentAIResponse} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ maxWidth: '900px', textAlign: 'center', minHeight: '60px' }}>
            <p style={{ fontSize: '1.6rem', fontWeight: 500, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: 1.5 }}>
              {isProcessing ? "Analyzing Audio Matrix..." : `"${currentAIResponse}"`}
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
          {isRecording ? "Recording... Click to Send to AI" : "Click to Start Recording Answer"}
        </button>
      </div>
    </div>
  );
};

export default MockInterview;