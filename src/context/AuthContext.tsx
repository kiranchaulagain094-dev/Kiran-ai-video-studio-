import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  db, 
  signInWithGoogle as firebaseSignInWithGoogle, 
  logout as firebaseLogout, 
  checkRedirectResult, 
  syncUserRecord 
} from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  isLoading: true,
  signInWithGoogle: async () => null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if returning from redirect sign-in
    checkRedirectResult().catch((e) => {
      console.warn('Redirect sign-in check notice:', e);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const isOwnerEmail = 
          user.email === 'kiranchaulagain34@gmail.com' || 
          user.email === 'kiranchaulagain094@gmail.com';

        try {
          // Sync record in Firestore and backend
          await syncUserRecord(user);

          // Check custom claims
          const tokenResult = await user.getIdTokenResult(true);
          if (tokenResult.claims.admin === true || isOwnerEmail) {
            setIsAdmin(true);
          } else {
            // Fallback to checking admins collection
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            setIsAdmin(adminDoc.exists());
          }
        } catch (e) {
          console.error('Failed to verify admin status', e);
          setIsAdmin(isOwnerEmail);
        }
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    return await firebaseSignInWithGoogle();
  };

  const handleSignOut = async () => {
    await firebaseLogout();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAdmin, 
      isLoading,
      signInWithGoogle: handleSignInWithGoogle,
      signOut: handleSignOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
