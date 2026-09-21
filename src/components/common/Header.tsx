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
  Mail
} from 'lucide-react';

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

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'ai-guide', label: 'AI Guide' },
    { id: 'video-generator', label: 'Video Planner' },
    { id: 'shorts-creator', label: 'Shorts Creator' },
    { id: 'content-assistant', label: 'Content & SEO' },
    { id: 'thumbnail-maker', label: 'Thumbnails' },
    { id: 'templates', label: 'Templates' },
    { id: 'about-us', label: 'About Us' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (query.includes('guide') || query.includes('help') || query.includes('which tool') || query.includes('recommend')) {
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

          <button
            id="header-brand-logo-btn"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
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
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  Free Tools
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block leading-none">
                Screenplay, Shorts & YouTube SEO
              </p>
            </div>
          </button>
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
            <span>New Video Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
