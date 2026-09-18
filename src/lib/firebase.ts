import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function syncUserRecord(user: User) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Studio Creator',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Firestore user sync notice:', err);
  }

  // Call backend to verify & set custom claims if admin
  try {
    const token = await user.getIdToken();
    await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Refresh token so latest claims are available
    await user.getIdToken(true);
  } catch (e) {
    console.warn('Backend claim verification notice:', e);
  }
}

export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await syncUserRecord(result.user);
      return result.user;
    }
  } catch (err) {
    console.error('Redirect sign-in error:', err);
    throw err;
  }
  return null;
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result?.user) {
      await syncUserRecord(result.user);
      return result.user;
    }
    return null;
  } catch (error: any) {
    // If popup was blocked or mobile device, fallback to redirect
    if (
      error.code === 'auth/popup-blocked' || 
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile || error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
    }
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}
