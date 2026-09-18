import re

with open('server.ts', 'r') as f:
    content = f.read()

verify_route = """
// Initialize session and claims
app.post('/api/auth/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Assign owner admin rights securely on the server
    if (decodedToken.email === 'kiranchaulagain34@gmail.com') {
       if (decodedToken.admin !== true) {
          await admin.auth().setCustomUserClaims(decodedToken.uid, { admin: true });
          return res.json({ adminAssigned: true });
       }
    }
    
    return res.json({ adminAssigned: false });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});
"""

# inject before Vite Middleware Setup
content = content.replace("// Vite Middleware Setup for Dev & Production", verify_route + "\n// Vite Middleware Setup for Dev & Production")

with open('server.ts', 'w') as f:
    f.write(content)

