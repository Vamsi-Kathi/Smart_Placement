import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Search, Trash2, UserX } from 'lucide-react';

const UserManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const querySnapshot = await getDocs(q);
      
      const fetchedStudents = [];
      querySnapshot.forEach((document) => {
        fetchedStudents.push({ id: document.id, ...document.data() });
      });

      setStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}'s profile completely?`)) {
      try {
        await deleteDoc(doc(db, "users", userId));
        // Remove from local state immediately for snappy UI
        setStudents(students.filter(s => s.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Check console.");
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profile?.primaryLanguage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="heading-lg">User Management</h1>
          <p className="text-body" style={{ marginTop: '0.5rem' }}>View, manage, and filter the platform's registered students.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search name, email, or language..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
             Fetching Database...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '1rem' }}>
             <UserX size={48} opacity={0.5} />
             <span>No students found.</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', overflowY: 'auto', flexGrow: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.02)', position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid var(--panel-border)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Student Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Degree & Year</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Role</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Weakness (AI Target)</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
{filteredStudents.map((student) => (
                  <tr 
                    key={student.id}
                    style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.05)' }}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{student.name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{student.email}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.9rem' }}>{student.profile?.degree || 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.profile?.year || 'Unknown'} • {student.profile?.primaryLanguage || 'Language TBD'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>{student.profile?.careerGoal || 'Not Set'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {student.profile?.weakness || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDelete(student.id, student.name)}
                        style={{ padding: '0.5rem', background: 'rgba(244, 63, 94, 0.1)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Delete Student"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default UserManagement;
