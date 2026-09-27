import React from 'react';
import { 
  Home,
  Compass,
  Video, 
  Film, 
  Scissors, 
  Image as ImageIcon, 
  Sparkles, 
  FolderGit2, 
  LayoutTemplate, 
  ShieldCheck,
  FileText,
  Mail,
  Info,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Clock,
  LogOut,
  LogIn,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpen,
  onClose
}) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const mainNavItems = [
    { id: 'landing', label: 'Studio Home', icon: Home },
    { id: 'articles', label: 'Creator Guides', icon: BookOpen, badge: '30' },
    { id: 'ai-guide', label: 'AI Website Guide', icon: Compass, badge: 'Guide' },
    { id: 'video-generator', label: 'AI Video Planner', icon: Video, badge: 'AI' },
    { id: 'timeline-planner', label: '1-Min Timeline', icon: Clock, badge: 'Flow' },
    { id: 'shorts-creator', label: 'Shorts Creator', icon: Film, badge: '9:16' },
    { id: 'video-editor', label: 'Video Editor', icon: Scissors },
    { id: 'thumbnail-maker', label: 'Thumbnail Maker', icon: ImageIcon },
    { id: 'content-assistant', label: 'Content & SEO', icon: Sparkles, badge: 'SEO' },
    { id: 'music-video', label: 'Music Video Planner', icon: Sparkles },
    { id: 'projects', label: 'My Projects', icon: FolderGit2 },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate }
  ];

  const legalNavItems = [
    { id: 'how-to-use', label: 'How to Use', icon: FileText },
    { id: 'ai-tools-guide', label: 'AI Tools Guide', icon: Compass },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'about-us', label: 'About Us', icon: Info },
    { id: 'contact-us', label: 'Contact Us', icon: Mail },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms-of-service', label: 'Terms of Service', icon: FileText },
    { id: 'cookie-policy', label: 'Cookie Policy', icon: ShieldCheck },
    { id: 'disclaimer', label: 'Disclaimer', icon: FileText }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#0c0f16] border-r border-white/5 flex flex-col justify-between
        transition-transform duration-200 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Navigation list */}
        <div className="p-3 overflow-y-auto space-y-1 flex-1">
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Creator Tools</p>
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/10 text-indigo-400 border border-indigo-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-[#141824] border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                    item.badge === 'AI' 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white' 
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Legal & Policy Direct Navigation */}
          <div className="pt-3 mt-3 border-t border-white/5">
            <div className="px-3 py-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">About & Legal</p>
            </div>
            {legalNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer
                    ${isActive 
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-[#141824] border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Account / Auth Section */}
        <div className="p-3 border-t border-white/5">
          {isAuthenticated && user ? (
            <div className="p-2.5 rounded-xl bg-[#141824] border border-cyan-500/20 space-y-2">
              <div className="flex items-center gap-2.5">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.display_username}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs ring-1 ring-cyan-500/40">
                    {user.display_username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-semibold text-white truncate">{user.display_username}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email || 'Neon Cloud Account'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="sidebar-google-signin-btn"
              onClick={() => {
                openLoginModal();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
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
              <span>Sign In with Google</span>
            </button>
          )}
        </div>

        {/* Bottom studio card */}
        <div className="p-3 border-t border-white/5">
          <div className="p-3 rounded-xl bg-[#121622] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Kiran AI Studio</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Open creative workspace by Kiran Chaulagain.
            </p>
            <a
              href="mailto:kiranchaulagain094@gmail.com"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>kiranchaulagain094@gmail.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
