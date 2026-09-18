import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add useAuth import
content = content.replace("import { Project, UserProfile, Announcement, User } from './types';", "import { Project, UserProfile, Announcement, User } from './types';\nimport { useAuth } from './context/AuthContext';\nimport { logout } from './lib/firebase';")

# Replace auth state
auth_state = """  // User state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'user-1',
    name: 'Kiran Sharma',
    email: 'kiran.creator@studio.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'User',
    plan: 'Pro',
    status: 'active',
  });"""

new_auth_state = """  // User state
  const { currentUser: authUser, isAdmin, isLoading } = useAuth();
  
  // Map Firebase user to UserProfile for the rest of the app
  const currentUser: UserProfile | null = authUser ? {
    id: authUser.uid,
    name: authUser.displayName || 'Unknown User',
    email: authUser.email || '',
    avatar: authUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: isAdmin ? 'Admin' : 'User',
    plan: 'Pro',
    status: 'active'
  } : null;"""

content = content.replace(auth_state, new_auth_state)

# Replace login handlers
login_handler = """  const handleSwitchUserRole = (role: 'Admin' | 'User') => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
      if (role === 'Admin') {
        setCurrentRoute('admin-portal');
      } else if (currentRoute === 'admin-portal') {
        setCurrentRoute('dashboard');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRoute('landing');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setCurrentRoute('dashboard');
  };"""

new_login_handler = """  const handleSwitchUserRole = (role: 'Admin' | 'User') => {
    // Only real admins can access this now
  };

  const handleLogout = async () => {
    await logout();
    setCurrentRoute('landing');
  };

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
    // If admin, auto route to admin-portal
    if (isAdmin) {
       setCurrentRoute('admin-portal');
    } else {
       setCurrentRoute('dashboard');
    }
  };"""

content = content.replace(login_handler, new_login_handler)

# Protect admin route render
admin_render = """          {currentRoute === 'admin-portal' && currentUser?.role === 'Admin' && (
            <AdminPanel />
          )}"""

new_admin_render = """          {currentRoute === 'admin-portal' && (
            isAdmin ? <AdminPanel /> : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <ShieldAlert className="w-16 h-16 text-rose-500 mb-2" />
                <h2 className="text-2xl font-bold text-white">403 Unauthorized</h2>
                <p className="text-slate-400">You do not have permission to access the Admin Portal.</p>
                <button onClick={() => setCurrentRoute('dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium">Return to Dashboard</button>
              </div>
            )
          )}"""

content = content.replace(admin_render, new_admin_render)
content = content.replace("import { AlertTriangle, DownloadCloud", "import { ShieldAlert, AlertTriangle, DownloadCloud")

with open('src/App.tsx', 'w') as f:
    f.write(content)

