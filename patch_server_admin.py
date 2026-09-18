import re

with open('server.ts', 'r') as f:
    content = f.read()

admin_import = """import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}
"""

content = content.replace("import { GoogleGenAI } from '@google/genai';\nimport { createServer as createViteServer } from 'vite';", admin_import)

auth_middleware = """
// --- Admin API Routes with Authentication ---

// Middleware to verify Firebase ID token and Admin claim/email
const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // The owner email gets automatic admin rights.
    // If it's the owner, we can set the custom claim if not present to fulfill the requirement.
    if (decodedToken.email === 'kiranchaulagain34@gmail.com') {
       if (decodedToken.admin !== true) {
          await admin.auth().setCustomUserClaims(decodedToken.uid, { admin: true });
       }
       // Pass to next
       (req as any).user = decodedToken;
       return next();
    }
    
    // Otherwise check for admin claim
    if (decodedToken.admin === true) {
      (req as any).user = decodedToken;
      return next();
    }
    
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  } catch (error) {
    console.error('Auth verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Admin dashboard summary endpoint
app.get('/api/admin/dashboard', verifyAdmin, async (req, res) => {
  // Normally fetch real stats from Firestore here
  res.json({
    stats: {
      totalUsers: 1420,
      activeProjects: 384,
      aiUsageTokens: 4200000,
      videosGenerated: 890
    }
  });
});
"""

# inject before Vite Middleware Setup
content = content.replace("// Vite Middleware Setup for Dev & Production", auth_middleware + "\n// Vite Middleware Setup for Dev & Production")

with open('server.ts', 'w') as f:
    f.write(content)

