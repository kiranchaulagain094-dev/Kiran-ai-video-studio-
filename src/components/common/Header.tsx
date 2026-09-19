import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Plus, 
  Menu, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Announcement } from '../../types';

interface HeaderProps {
  currentUser: UserProfile | null;
  isAdmin?: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchUserRole: (role: 'user' | 'admin') => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
  announcements: Announcement[];
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onQuickCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isAdmin = false,
  onOpenAuth,
  onLogout,
  onSwitchUserRole,
  onNavigate,
  currentRoute,
  announcements,
  onToggleSidebar,
  isSidebarOpen,
  onQuickCreate
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeAnnouncements = announcements.filter(a => a.isActive);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d1017]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            id="mobile-sidebar-toggle"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Kiran AI Video Studio
              </span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase -mt-0.5 hidden sm:inline">
                Create • Edit • Optimize • Publish
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
        {currentUser && (
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().trim();
                    if (q.includes('template')) {
                      onNavigate('templates');
                    } else if (q.includes('seo') || q.includes('tag') || q.includes('title')) {
                      onNavigate('content-assistant');
                    } else if (q.includes('short') || q.includes('reel')) {
                      onNavigate('shorts-creator');
                    } else if (q.includes('thumb')) {
                      onNavigate('thumbnail-maker');
                    } else {
                      onNavigate('projects');
                    }
                  }
                }}
                placeholder="Search projects, templates, videos, SEO tools... (Press Enter)"
                className="w-full bg-[#151923] text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 border border-white/5 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Right: Quick Action & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Quick Create Button */}
              <button
                id="quick-create-project-btn"
                onClick={onQuickCreate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Project</span>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  id="notifications-dropdown-toggle"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 rounded-xl bg-[#151923] hover:bg-[#1e2433] text-slate-300 relative border border-white/5 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {activeAnnouncements.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#131722] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Studio Announcements</h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                        {activeAnnouncements.length} Active
                      </span>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {activeAnnouncements.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No new notifications</p>
                      ) : (
                        activeAnnouncements.map((ann) => (
                          <div key={ann.id} className="p-3 rounded-xl bg-[#181e2c] border border-white/5 flex gap-3">
                            {ann.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="text-xs font-semibold text-white">{ann.title}</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ann.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar & Dropdown */}
              <div className="relative">
                <button
                  id="profile-dropdown-btn"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-[#151923] hover:bg-[#1e2433] border border-white/5 transition-colors"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/30"
                  />
                  <div className="hidden md:flex flex-col text-left pr-1">
                    <span className="text-xs font-semibold text-white leading-none">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{currentUser.plan} Plan</span>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#131722] border border-white/10 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2.5 border-b border-white/5 mb-1">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold uppercase tracking-wider">
                          {currentUser.plan}
                        </span>
                        {isAdmin && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          Admin Panel
                        </button>
                      )}

                      <button
                        id="profile-account-btn"
                        onClick={() => {
                          onNavigate('settings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                        Account
                      </button>

                      <button
                        id="profile-sign-out-btn"
                        onClick={() => {
                          onLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
