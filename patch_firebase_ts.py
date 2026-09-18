import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

old_signin = """    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Unknown',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString()
      });
    }
    
    return user;"""

new_signin = """    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Unknown',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString()
      });
    }
    
    // Call backend to initialize claims
    try {
       const token = await user.getIdToken();
       await fetch('/api/auth/verify', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       // Force refresh token to pick up new claims immediately
       await user.getIdToken(true);
    } catch (e) {
       console.error('Failed to verify session', e);
    }
    
    return user;"""

content = content.replace(old_signin, new_signin)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)

