import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Menu, 
  X,
  Plus,
  Compass,
  Video,
  Film,
  Info,
  Mail,
  LogIn,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { CURRENT_APP_VERSION } from '../../config/version';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onQuickCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentRoute,
  onToggleSidebar,
  isSidebarOpen,
  onQuickCreate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'timeline-planner', label: '1-Min Timeline' },
    { id: 'articles', label: 'Creator Guides' },
    { id: 'ai-guide', label: 'AI Guide' },
    { id: 'video-generator', label: 'Video Planner' },
    { id: 'shorts-creator', label: 'Shorts Creator' },
    { id: 'content-assistant', label: 'Content & SEO' },
    { id: 'thumbnail-maker', label: 'Thumbnails' },
    { id: 'templates', label: 'Template Maker' },
    { id: 'about-us', label: 'About Us' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (query.includes('1-min') || query.includes('flow') || query.includes('timeline') || query.includes('scene by scene') || query.includes('60')) {
      onNavigate('timeline-planner');
    } else if (query.includes('article') || query.includes('blog') || query.includes('learn') || query.includes('how to')) {
      onNavigate('articles');
    } else if (query.includes('guide') || query.includes('help') || query.includes('which tool') || query.includes('recommend')) {
      onNavigate('ai-guide');
    } else if (query.includes('short') || query.includes('tiktok') || query.includes('reel') || query.includes('vertical')) {
      onNavigate('shorts-creator');
    } else if (query.includes('seo') || query.includes('tag') || query.includes('title') || query.includes('description')) {
      onNavigate('content-assistant');
    } else if (query.includes('thumb') || query.includes('cover')) {
      onNavigate('thumbnail-maker');
    } else if (query.includes('edit') || query.includes('timeline')) {
      onNavigate('video-editor');
    } else if (query.includes('music') || query.includes('song') || query.includes('nepal')) {
      onNavigate('music-video');
    } else if (query.includes('template')) {
      onNavigate('templates');
    } else if (query.includes('about') || query.includes('who') || query.includes('kiran')) {
      onNavigate('about-us');
    } else if (query.includes('contact') || query.includes('email') || query.includes('support')) {
      onNavigate('contact-us');
    } else {
      onNavigate('video-generator');
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="h-16 bg-[#0c0f17]/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 px-4 sm:px-6">
      <div className="h-full flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle + Studio Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              id="header-brand-logo-btn"
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0a0c12] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    Kiran AI Studio
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    Free Tools
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block leading-none">
                  Screenplay, Shorts & YouTube SEO
                </p>
              </div>
            </button>

            {/* Clickable Version Changelog Badge */}
            <button
              type="button"
              id="header-version-pill-btn"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('kiran:open-update-modal'));
              }}
              title="View What's New & Release Notes"
              className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/25 transition-colors cursor-pointer ml-1"
            >
              <span>v{CURRENT_APP_VERSION}</span>
            </button>
          </div>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search & Quick Create */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Tool Search */}
          <form onSubmit={handleSearch} className="relative hidden md:block w-44 lg:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a tool or template..."
              className="w-full bg-[#131722] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-xl border border-white/5 focus:border-indigo-500/50 focus:outline-none transition-all"
            />
          </form>

          {/* About Us Link */}
          <button
            onClick={() => onNavigate('about-us')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              currentRoute === 'about-us'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>About</span>
          </button>

          {/* Contact Link */}
          <button
            onClick={() => onNavigate('contact-us')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              currentRoute === 'contact-us'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Contact</span>
          </button>

          {/* Quick Create Button */}
          <button
            id="header-start-creating-btn"
            onClick={onQuickCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Plan</span>
          </button>

          {/* Authentication State & Actions */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                id="header-user-profile-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all cursor-pointer"
                title={`Signed in as ${user.display_username}`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.display_username}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs ring-1 ring-cyan-500/40">
                    {user.display_username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline max-w-[100px] truncate text-slate-200">
                  {user.display_username}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f1320] border border-cyan-500/20 shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/5 space-y-0.5">
                    <div className="font-semibold text-white truncate">{user.display_username}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email || user.username}</div>
                    <div className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                      Cloud Sync Active
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => onNavigate('admin')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-cyan-300 hover:text-white hover:bg-cyan-500/10 transition-colors font-semibold"
                    >
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigate('projects')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span>My Cloud Projects</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('settings')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span>Workspace Settings</span>
                  </button>

                  <div className="border-t border-white/5 pt-1">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              id="header-google-login-btn"
              onClick={openLoginModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              title="Sign in with Google"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
