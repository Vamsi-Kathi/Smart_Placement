import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { useAppContext } from '../../context/AppContext';

const AptitudeTest = () => {
  const { currentUser } = useAppContext();
  const [category, setCategory] = useState('Quantitative');
  const [level, setLevel] = useState('Easy');
  const [testSetName, setTestSetName] = useState('Standard Test');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);

  const levels = ['Easy', 'Medium', 'Hard', 'Hard Core', 'Expert'];

  const fetchQuestions = async (selectedLevel, selectedCategory, selectedTestSet) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "aptitude_questions"), 
        where("level", "==", selectedLevel), 
        where("category", "==", selectedCategory),
        where("testSetName", "==", selectedTestSet)
      );
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setQuestions(fetched);
      setCurrentIndex(0);
      setScore(0);
      setUserAnswers([]);
      setIsFinished(false);
      setSelectedOption(null);
      if(fetched.length > 0) {
        setTimeLeft(fetched[0].timerSeconds || 60);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(level, category, testSetName);
  }, [level, category, testSetName]);

  useEffect(() => {
    if (questions.length === 0 || isFinished || loading) return;

    if (timeLeft === 0) {
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, questions, loading]);

  const handleNext = async () => {
    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setUserAnswers(prev => [...prev, {
      question: currentQ.question,
      options: currentQ.options,
      selected: selectedOption,
      correct: currentQ.correctOptionIndex
    }]);

    if (currentIndex < questions.length - 1) {
      const nextQ = questions[currentIndex + 1];
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(nextQ.timerSeconds || 60);
    } else {
      setIsFinished(true);
      // Sync the exact aptitude score (out of 100) to Firebase for Dashboards
      const calculatedScore = Math.floor(((isCorrect ? score + 1 : score) / questions.length) * 100);
      try {
         if (currentUser?.uid && currentUser.uid !== 'admin-bypass') {
            await setDoc(doc(db, "users", currentUser.uid), {
               performance: { aptitudeScore: calculatedScore }
            }, { merge: true });
         }
      } catch (err) {
         console.error("Failed to sync score to global telemetry", err);
      }
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', margin: '5rem 0' }}><div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Selectors Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--panel-border)' }}>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)', minWidth: '80px' }}>Category:</span>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {['Quantitative', 'Logical', 'Verbal'].map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 600,
                  background: category === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                  color: category === cat ? 'white' : 'var(--text-primary)',
                  boxShadow: category === cat ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)', minWidth: '80px' }}>Level:</span>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {levels.map(lvl => (
              <button 
                key={lvl}
                onClick={() => setLevel(lvl)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                  background: level === lvl ? 'var(--text-primary)' : 'rgba(255,255,255,0.05)',
                  color: level === lvl ? 'var(--bg-color)' : 'var(--text-secondary)'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)', minWidth: '80px' }}>Test Set:</span>
          <select value={testSetName} onChange={e => setTestSetName(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}>
            <option value="Standard Test" style={{ background: '#0b0f19', color: 'white' }}>Standard Test</option>
            <option value="Test 1" style={{ background: '#0b0f19', color: 'white' }}>Test 1</option>
            <option value="Test 2" style={{ background: '#0b0f19', color: 'white' }}>Test 2</option>
            <option value="TCS NQT Pattern" style={{ background: '#0b0f19', color: 'white' }}>TCS NQT Pattern</option>
            <option value="Infosys Alpha" style={{ background: '#0b0f19', color: 'white' }}>Infosys Alpha</option>
          </select>
        </div>

      </div>

      {questions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          No questions found for {testSetName} - {level}. Admin needs to add some!
        </div>
      ) : isFinished ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle2 color="var(--success)" size={64} style={{ margin: '0 auto 1rem' }} />
          <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>Test Completed</h2>
          <p className="text-body" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>You scored <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.5rem' }}>{score}</span> out of {questions.length}</p>
          
          <div style={{ textAlign: 'left', marginTop: '2rem', marginBottom: '2rem', borderTop: '1px solid var(--panel-border)', paddingTop: '2rem' }}>
            <h3 className="heading-sm" style={{ marginBottom: '1.5rem' }}>Detailed Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {userAnswers.map((ans, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: `1px solid ${ans.selected === ans.correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
                  <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Q{idx+1}. {ans.question}</p>
                  <p style={{ fontSize: '0.9rem', color: ans.selected === ans.correct ? 'var(--success)' : 'var(--danger)', marginBottom: '0.5rem' }}>
                    Your Answer: {ans.selected !== null ? ans.options[ans.selected] : 'Skipped'}
                  </p>
                  {ans.selected !== ans.correct && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--success)' }}>Correct Answer: {ans.options[ans.correct]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={() => fetchQuestions(level, category, testSetName)}>Retake Test</button>
        </motion.div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="heading-md">{questions[currentIndex].category} Reasoning</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: timeLeft < 15 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.1)', color: timeLeft < 15 ? 'var(--danger)' : 'var(--accent-primary)', padding: '0.5rem 1.5rem', borderRadius: '2rem', transition: 'all 0.3s' }}>
              <Clock size={18} />
              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.2rem' }}>00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>Question {currentIndex + 1} of {questions.length}</span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>Difficulty: <span style={{ color: 'white' }}>{level}</span></span>
            </div>

            <h3 className="heading-sm" style={{ marginBottom: '2.5rem', lineHeight: 1.6 }}>
              {questions[currentIndex].question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions[currentIndex].options.map((opt, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedOption(idx)}
                  style={{
                    padding: '1.25rem',
                    border: `2px solid ${selectedOption === idx ? 'var(--accent-primary)' : 'var(--panel-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: selectedOption === idx ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid', borderColor: selectedOption === idx ? 'var(--accent-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedOption === idx && <motion.div layoutId="dot" style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                  </div>
                  <span className="text-body" style={{ color: selectedOption === idx ? 'white' : 'var(--text-secondary)', fontSize: '1.05rem' }}>{opt}</span>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
              <button onClick={handleNext} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                {currentIndex === questions.length - 1 ? 'Submit Test' : 'Next Question'} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AptitudeTest;
