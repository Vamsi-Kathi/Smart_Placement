import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Code2, Video, FileCheck, BrainCircuit, BarChart4, Database, Briefcase, Star, LayoutDashboard, BookOpen, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeatureCard = ({ title, desc, expanded, icon, color, setModalData }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-panel" 
    style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${color}`, position: 'relative', overflow: 'hidden' }}
  >
    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: color, width: 'fit-content' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
       <span 
         onClick={() => setModalData({ title, desc: expanded, color, icon })}
         style={{ fontSize: '0.85rem', color: color, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
       >
         Learn More <ArrowRight size={14} />
       </span>
    </div>
  </motion.div>
);

const Home = () => {
  const navigate = useNavigate();
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const scrollTo = (id) => {
     const el = document.getElementById(id);
     if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-color)', overflowX: 'hidden' }}>
      
      {/* Expanded Modal */}
      <AnimatePresence>
        {modalData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setModalData(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel"
              style={{ padding: '3rem', maxWidth: '600px', width: '100%', borderTop: `4px solid ${modalData.color}`, position: 'relative' }}
            >
              <button 
                onClick={() => setModalData(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: modalData.color, width: 'fit-content', marginBottom: '1.5rem' }}>
                {modalData.icon}
              </div>
              <h2 className="heading-ld" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>{modalData.title}</h2>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                 {modalData.desc}
              </div>
              <button className="btn-primary" onClick={() => navigate('/auth')} style={{ marginTop: '2.5rem', width: '100%', background: modalData.color }}>Try it now</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', position: 'fixed', top: 0, width: '100%', background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(10px)', zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Target size={18} color="white" />
          </div>
          Smart Placement
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
           <span onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{cursor: 'pointer', color: 'var(--text-primary)'}}>Platform</span>
           <span onClick={() => scrollTo('how-it-works')} style={{cursor: 'pointer', opacity: 0.8}}>How It Works</span>
           <span onClick={() => scrollTo('contact')} style={{cursor: 'pointer', opacity: 0.8}}>Contact</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/auth')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer' }}>Login</button>
          <button onClick={() => navigate('/auth')} className="btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '20px' }}>Sign Up <ArrowRight size={16} style={{display: 'inline', verticalAlign: 'middle'}}/></button>
        </div>
      </nav>

      <main style={{ padding: '8rem 2rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* HUGE HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem' }}>
          <div style={{ background: 'rgba(255, 110, 0, 0.1)', color: 'var(--accent-primary)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-block', marginBottom: '1.5rem', border: '1px solid rgba(255, 110, 0, 0.2)' }}>
            ✨ Next-Gen Placement Intelligence Platform
          </div>
          <h1 className="heading-lg" style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Ace Your <span style={{ color: 'var(--accent-primary)' }}>Campus Placements</span> with AI
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            One platform for coding practice, aptitude tests, AI mock interviews, resume analysis, and exact job matching. Built specifically for placement-ready students.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
             <button onClick={() => navigate('/auth')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: '8px' }}>Start Preparing — Free</button>
             <button onClick={() => navigate('/auth')} className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: '8px' }}><LayoutDashboard size={18} style={{display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem'}}/> Login to Dashboard</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>✓ No Credit Card</span> <span>✓ 100% Privacy Safe</span> <span>✓ AI Powered</span>
          </div>
        </motion.div>

        {/* Global Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', padding: '3rem 0', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>10,000+</div>
             <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Placed Students</div>
           </div>
           <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
           <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>500+</div>
             <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hiring Partners</div>
           </div>
           <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
           <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>200+</div>
             <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Companies Hiring</div>
           </div>
           <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
           <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>94%</div>
             <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Placement Rate</div>
           </div>
        </div>

        {/* Feature Grid */}
        <div style={{ width: '100%', maxWidth: '1200px', margin: '6rem auto 0' }}>
           <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI-Powered Workflow</span>
              <h2 className="heading-lg" style={{ marginTop: '0.5rem' }}>Everything you need to get placed</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>An enterprise-grade execution suite covering every aspect of placement preparation.</p>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <FeatureCard setModalData={setModalData} title="AI Coding Practice" desc="Real-time plagiarism and syntax check, tracking your algorithmic logic against complexity constraints." expanded="Our Coding IDE connects to Gemini Pro to simulate a real tech screening.\n\nYou are judged not just by whether the code runs, but by Time Complexity, Space Complexity, and logical flow. \n\nWe provide hints instead of direct answers to force algorithmic mapping." icon={<Code2 size={24}/>} color="var(--accent-primary)" />
              <FeatureCard setModalData={setModalData} title="AI Mock Interview" desc="Full HD Video UI that monitors eye contact, confidence, and behavioral patterns strictly." expanded="Connect your microphone and webcam. Our Voice AI will ask dynamic HR and Technical questions based on your resume.\n\nA background heuristic engine monitors if you turn away (cheating), your voice stress indicators, and how long you hesitate before answering." icon={<Video size={24}/>} color="var(--accent-secondary)" />
              <FeatureCard setModalData={setModalData} title="AI Resume Analyzer" desc="Automated score against FAANG structure. We point out missing keywords to evade ATS rejections." expanded="Upload your PDF directly. We strip the text and run it against modern ATS string-matching rules.\n\nWe will give you a concrete score out of 100, identify missing buzzwords, and critique your bullet-point action verbs." icon={<FileCheck size={24}/>} color="var(--success)" />
              <FeatureCard setModalData={setModalData} title="AI Aptitude Tests" desc="Timed strictly under Math, Logical, Reasoning, and English constraints via dual-query selectors." expanded="Take massive 30-minute timed tests. Our dynamic selector allows you to pick the Category and Difficulty manually.\n\nAll scores are pushed directly to your Placement Readiness widget so you can secure a 100% readiness score." icon={<BookOpen size={24}/>} color="var(--warning)" />
              <FeatureCard setModalData={setModalData} title="AI Job Portal" desc="Smartly matching roles based on your dynamic overall dashboard score in real-time." expanded="Once your Placement Readiness hits > 70%, our system automatically flags your profile to live company recruiters.\n\nYou can also manually browse our verified portal of live hiring Tech giants directly matched to your framework (e.g. React, Node)." icon={<Briefcase size={24}/>} color="#a855f7" />
              <FeatureCard setModalData={setModalData} title="AI Admin Dashboard" desc="Total live aggregation across all users to identify institutional weaknesses and deploy resources." expanded="If you are an administrator, you get God-View. You can see the realtime Aptitude, Coding, and Interview graphs of every single student logged into the system to verify placements." icon={<BarChart4 size={24}/>} color="#06b6d4" />
           </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" style={{ width: '100%', maxWidth: '1000px', margin: '8rem auto 0', textAlign: 'center' }}>
           <h2 className="heading-lg" style={{ marginBottom: '4rem' }}>How It Works</h2>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', position: 'relative' }}>
              
              {/* Connecting Line */}
              <div style={{ position: 'absolute', top: '40px', left: '15%', right: '15%', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}>
                 <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--success))', opacity: 0.5 }}></div>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                 <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--panel-bg)', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(255, 110, 0, 0.2)' }}>01</div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Profile</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>List your tech stack, degree, and target companies upon secure sign up.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                 <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--panel-bg)', border: '2px solid var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>02</div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Train & Drill</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Clear all modules—Coding, Aptitude, matching your resume against ATS.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                 <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--panel-bg)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>03</div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Get Hired</h3>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Achieve an 80% Readiness score to automatically enter the premium job queue.</p>
              </div>

           </div>
        </div>

        {/* Contact Us Section */}
        <div id="contact" className="glass-panel" style={{ width: '100%', maxWidth: '800px', margin: '8rem auto 0', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
           <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>Contact Support</h2>
           <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '400px' }}>Having trouble with your student profile or looking to partner as an enterprise?</p>
           
           <div style={{ display: 'flex', width: '100%', gap: '1rem', marginBottom: '2rem' }}>
              <input type="email" placeholder="Your University/Company Email" style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
                 <Send size={18} /> Send Message
              </button>
           </div>
           
           <div style={{ display: 'flex', gap: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>📍 Bangalore, India 560001</span>
              <span>✉️ admin@smartplacement.com</span>
              <span>📞 +91 98765 43210</span>
           </div>
        </div>

        {/* Bottom CTA Box completely matching the orange design */}
        <div style={{ width: '100%', maxWidth: '1000px', margin: '8rem auto 4rem', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #ff8c33 100%)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(255, 110, 0, 0.2)' }}>
           <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Target size={24} color="white" />
           </div>
           <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Ready to get placed?</h2>
           <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              Join 10,000+ students who landed their dream jobs using Smart Placement Platform. Start perfectly free today.
           </p>
           <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
             <button onClick={() => navigate('/auth')} style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: '8px', background: 'white', color: 'var(--accent-primary)', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Get Started For Free</button>
             <button onClick={() => navigate('/auth')} style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Login to Platform</button>
           </div>
        </div>

      </main>

      {/* Footer Details */}
      <footer style={{ padding: '3rem 4rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
         <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '6px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Target size={14} color="white" />
              </div>
              Smart Placement
            </div>
            <p style={{ maxWidth: '300px', lineHeight: 1.5 }}>An enterprise placement preparation platform tracking coding, aptitude, and mock jobs simultaneously.</p>
         </div>
         <div style={{ display: 'flex', gap: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Platform</h4>
               <span onClick={() => navigate('/auth')} style={{cursor: 'pointer'}}>Dashboard</span><span onClick={() => navigate('/auth')} style={{cursor: 'pointer'}}>Practice</span><span onClick={() => navigate('/auth')} style={{cursor: 'pointer'}}>Resume</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Company</h4>
               <span style={{cursor: 'pointer'}}>About Us</span><span style={{cursor: 'pointer'}}>Terms</span><span style={{cursor: 'pointer'}}>Privacy</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Home;
