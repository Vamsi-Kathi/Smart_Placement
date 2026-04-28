import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAppContext } from '../../context/AppContext';
import { Eye, EyeOff, Target, ArrowRight } from 'lucide-react';

const AuthSplit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { forceAdminLogin } = useAppContext();
  const [isSignUp, setIsSignUp] = useState(location.state?.isLogin === true ? false : true);
  
  React.useEffect(() => {
     if (location.state?.isLogin === true) {
        setIsSignUp(false);
     }
  }, [location]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('3rd Year');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isSignUp && email.toLowerCase() === 'admin@gmail.com' && (password === 'admin' || password === 'admin@123')) {
        forceAdminLogin();
        navigate('/dashboard');
        return;
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const fullName = `${firstName} ${lastName}`.trim();

        await updateProfile(user, { displayName: fullName || 'User' });

        try {
          await setDoc(doc(db, "users", user.uid), {
            name: fullName || 'User',
            email: user.email,
            mobile: mobile,
            role: 'student', 
            profile: { degree, course, year },
            createdAt: new Date().toISOString()
          });
        } catch (dbError) {
          console.error("Firestore Save Error:", dbError);
        }

        navigate('/dashboard');
        return; 
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      let errorMessage = "An error occurred during process.";
      if (err.code === 'auth/email-already-in-use') errorMessage = "That email is already registered! Please log in.";
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') errorMessage = "Invalid email or password.";
      if (err.code === 'auth/weak-password') errorMessage = "Password should be at least 6 characters.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper" style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--bg-color)' }}>
      
      {/* LEFT ORANGE PANEL */}
      <div className="auth-hero-panel" style={{ flex: 1, background: 'var(--accent-primary)', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' }}>
         <div>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <Target size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                Smart Placement<br/>Preparation
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '400px', lineHeight: 1.5 }}>
                AI-powered coding, aptitude, interview, resume, jobs, and chat in one platform.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8, fontSize: '0.9rem' }}>
                <span>• Role-based redirection after login</span>
                <span>• Student and admin workflows</span>
                <span>• Secure token-based API access</span>
            </div>
         </div>
      </div>

      <div className="auth-form-panel" style={{ flex: 1, background: 'var(--bg-color)', padding: '4rem', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }}>
         
         {/* Top Branding & Toggles */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Target size={18} color="white" />
                </div>
                Smart Placement
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '0.25rem' }}>
                <button 
                  onClick={() => { setIsSignUp(false); setError(null); }}
                  style={{ padding: '0.5rem 2rem', borderRadius: '20px', background: !isSignUp ? 'var(--accent-primary)' : 'transparent', color: !isSignUp ? 'white' : 'var(--text-secondary)', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    Login
                </button>
                <button 
                  onClick={() => { setIsSignUp(true); setError(null); }}
                  style={{ padding: '0.5rem 2rem', borderRadius: '20px', background: isSignUp ? 'var(--accent-primary)' : 'transparent', color: isSignUp ? 'white' : 'var(--text-secondary)', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    Sign Up
                </button>
            </div>
         </div>

         {/* Form Container */}
         <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
             <h2 className="heading-lg" style={{ marginBottom: '0.5rem' }}>{isSignUp ? 'Create account' : 'Welcome back'}</h2>
             <p className="text-body" style={{ marginBottom: '2.5rem' }}>{isSignUp ? 'Create your account and start preparing.' : 'Log in to continue your placement journey.'}</p>

             {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    {error}
                </div>
             )}

             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 
                 {isSignUp && (
                     <>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>First Name</span>
                                <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter the First Name" style={{ padding: '0.875rem 1rem' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Second Name</span>
                                <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Enter the Second Name" style={{ padding: '0.875rem 1rem' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mobile Number</span>
                            <input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter the Mobile Number" style={{ padding: '0.875rem 1rem' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Degree</span>
                                <input required value={degree} onChange={e => setDegree(e.target.value)} placeholder="Enter the Degree" style={{ padding: '0.875rem 1rem' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Course/Branch</span>
                                <input value={course} onChange={e => setCourse(e.target.value)} placeholder="Enter the Course" style={{ padding: '0.875rem 1rem' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Studying Year</span>
                            <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '0.875rem 1rem' }}>
                                <option>Select the Studying Year</option>
                                <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Graduated</option>
                            </select>
                        </div>
                     </>
                 )}

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email</span>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter the Gmail" style={{ padding: '0.875rem 1rem' }} />
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Password</span>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter the Password" style={{ width: '100%', padding: '0.875rem 3rem 0.875rem 1rem' }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                 </div>

                 {isSignUp && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Confirm Password</span>
                        <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm the Password" style={{ padding: '0.875rem 1rem' }} />
                    </div>
                 )}

                 <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                     {loading ? 'Processing...' : (isSignUp ? <><ArrowRight size={18}/> Create Account</> : 'Login to Dashboard')}
                 </button>

             </form>

             <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                 {isSignUp ? (
                    <>Already have an account? <span onClick={() => setIsSignUp(false)} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>Sign in</span></>
                 ) : (
                    <>Don't have an account? <span onClick={() => setIsSignUp(true)} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>Sign up</span></>
                 )}
                 <div style={{ marginTop: '1rem' }}>
                     <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Back to home</span>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default AuthSplit;
