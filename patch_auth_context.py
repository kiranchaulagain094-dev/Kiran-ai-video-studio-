import re

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

# Replace the email check with a token claim check
old_check = """      if (user && user.email) {
        // Enforce admin check client-side for UI toggles only (actual security is in firestore.rules and API)
        if (user.email === 'kiranchaulagain34@gmail.com') {
          setIsAdmin(true);
        } else {
          try {
            // Also check the admins collection just in case they were added by the owner
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            setIsAdmin(adminDoc.exists());
          } catch (e) {
            console.error('Failed to verify admin status', e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }"""

new_check = """      if (user) {
        try {
          // The backend sets the admin custom claim on login if authorized.
          // Wait briefly for the backend to set the claim on first ever login if needed.
          const tokenResult = await user.getIdTokenResult(true);
          if (tokenResult.claims.admin === true) {
             setIsAdmin(true);
          } else {
             // Fallback to checking admins collection
             const adminDoc = await getDoc(doc(db, 'admins', user.uid));
             setIsAdmin(adminDoc.exists());
          }
        } catch (e) {
          console.error('Failed to verify admin status', e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }"""

content = content.replace(old_check, new_check)

with open('src/context/AuthContext.tsx', 'w') as f:
    f.write(content)

