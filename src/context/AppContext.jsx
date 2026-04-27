import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'student' or 'admin'
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Mock data for UI placeholders
  const mockStudentData = {
    name: currentUser?.displayName || (userRole === 'admin' ? 'Super Admin' : 'Student'),
    overallScore: 85,
    aptitudeScore: 92,
    codingScore: 78,
    interviewScore: 88,
    notifications: 3,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If we are currently in an admin bypass mode, don't let firebase overwrite it with null
      if (userRole === 'admin' && currentUser?.uid === 'admin-bypass') {
        setLoading(false);
        return; 
      }

      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'student');
          } else {
            setUserRole('student');
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          setUserRole('student');
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userRole, currentUser]);

  const forceAdminLogin = () => {
    setCurrentUser({ uid: 'admin-bypass', email: 'admin@gmail.com', displayName: 'System Admin' });
    setUserRole('admin');
  };

  const logoutUser = async () => {
    try {
      if (currentUser?.uid === 'admin-bypass') {
        setCurrentUser(null);
        setUserRole(null);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      isAuthenticated: !!currentUser, 
      currentUser,
      logoutUser, 
      userRole, 
      forceAdminLogin,
      loading,
      mockStudentData,
      theme,
      toggleTheme 
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
