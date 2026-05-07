import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';

/**
 * Firebase Auth-based route guard.
 * Checks that the user is authenticated AND belongs to one of the allowed role collections.
 * @param {React.ReactNode} children - The protected page component
 * @param {string[]} allowedRoles - Array of allowed roles: 'admin', 'student', 'faculty'
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'allowed' | 'denied'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('denied');
        return;
      }

      try {
        // SECURITY HARDENING: Check each role in parallel or via a single metadata document if possible.
        // For now, parallel checks are faster than sequential loops.
        const roleCollectionMap = {
          admin: 'admins',
          student: 'students',
          faculty: 'faculty',
        };

        const checks = allowedRoles.map(role => {
          const collectionName = roleCollectionMap[role];
          if (!collectionName) return Promise.resolve(false);
          return getDoc(doc(db, collectionName, user.uid)).then(snap => snap.exists());
        });

        const results = await Promise.all(checks);
        
        if (results.some(exists => exists)) {
          setStatus('allowed');
        } else {
          setStatus('denied');
        }
      } catch (error) {
        console.error('ProtectedRoute auth check failed:', error);
        setStatus('denied');
      }
    });

    return () => unsubscribe();
  }, [allowedRoles]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#fcfafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-[#3B021F]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;