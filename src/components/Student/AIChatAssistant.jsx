import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Interview Assistant. I can help you prepare, clarify doubts, and review resumes. Note: I will not provide direct answers for active coding or aptitude tests.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const detectCheatingAttempts = (text) => {
    const cheatingKeywords = ['answer for', 'solve this', 'write the code', 'give me the solution', 'aptitude answer', 'tell me the correct option'];
    const lowerText = text.toLowerCase();
    return cheatingKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Filter out cheating
    if (detectCheatingAttempts(userMessage.text)) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: 'I am here to help you learn and prepare, not to provide direct answers for tests or coding problems. Try breaking down the problem, and I can guide you on the concepts!' }]);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Warning: Gemini API Key is missing. Running in simulated offline mode.' }]);
        setLoading(false);
        return;
      }

      const promptContext = "You are a highly intelligent, strict but helpful Mock Interview AI. You help students practice. Do not give them answers to test questions, but explain concepts. Response should be concise.\n\nStudent asks: " + userMessage.text;
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const result = await model.generateContent(promptContext);
      const aiReply = result.response.text();
      
      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    } catch (error) {
      console.error("Gemini API Error: ", error);
      setMessages(prev => [...prev, { role: 'ai', text: `Google API Error: ${error.message} - Please try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ai-floating-btn" title="AI Assistant" onClick={() => setIsOpen(true)}>
        <MessageSquare size={28} color="white" />
      </div>

              {isOpen && (
          <div
            className="glass-panel"
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '25px',
              width: '350px',
              height: '500px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.2)', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot color="var(--accent-primary)" />
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>AI Interview Coach</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: msg.role === 'ai' ? 'row' : 'row-reverse', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'ai' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {msg.role === 'ai' ? <Bot size={16} color="var(--accent-primary)" /> : <User size={16} color="var(--success)" />}
                  </div>
                  <div style={{ 
                    maxWidth: '75%', 
                    padding: '0.75rem', 
                    borderRadius: '1rem', 
                    borderBottomLeftRadius: msg.role === 'ai' ? 0 : '1rem',
                    borderBottomRightRadius: msg.role === 'user' ? 0 : '1rem',
                    background: msg.role === 'ai' ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)',
                    color: msg.role === 'ai' ? 'var(--text-primary)' : 'white',
                    fontSize: '0.9rem',
                    lineHeight: 1.4
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={16} color="var(--accent-primary)" />
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', borderBottomLeftRadius: 0, color: 'var(--text-secondary)' }}>
                    <Loader2 size={16} className="spinner" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--panel-border)', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..." 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '2rem', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: loading || !input.trim() ? 0.5 : 1 }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
          </>
  );
};

export default AIChatAssistant;
