import re

with open('src/components/common/Header.tsx', 'r') as f:
    content = f.read()

# Replace "admin" strings if they are lowercase or capitalized
content = content.replace("currentUser.role === 'admin'", "currentUser.role === 'Admin'")

role_switcher = """                    {/* Fast role switcher for instant verification */}
                    <div className="px-3 py-2 border-b border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Role Mode
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 bg-[#0e1118] p-1 rounded-lg">
                        <button
                          onClick={() => {
                            onSwitchUserRole('user');
                            setShowProfileMenu(false);
                          }}
                          className={`text-xs py-1 rounded-md font-medium transition-colors ${
                            currentUser.role === 'user' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          User
                        </button>
                        <button
                          onClick={() => {
                            onSwitchUserRole('admin');
                            setShowProfileMenu(false);
                          }}
                          className={`text-xs py-1 rounded-md font-medium transition-colors ${
                            currentUser.role === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>"""

content = content.replace(role_switcher, "")

# fix route 'admin' to 'admin-portal' based on what App.tsx does
content = content.replace("onNavigate('admin');", "onNavigate('admin-portal');")
content = content.replace("currentUser.role === 'user'", "currentUser.role === 'User'")

with open('src/components/common/Header.tsx', 'w') as f:
    f.write(content)

