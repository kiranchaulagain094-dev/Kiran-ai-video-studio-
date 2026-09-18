import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Film, 
  Scissors, 
  Image, 
  Sparkles, 
  FolderGit2, 
  LayoutTemplate, 
  DownloadCloud, 
  Settings, 
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { UserProfile } from '../../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser: UserProfile | null;
  isAdmin?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  isAdmin = false,
  isOpen,
  onClose
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'video-generator', label: 'AI Video Planner', icon: Video, badge: 'AI' },
    { id: 'music-video', label: 'Music Video Planner', icon: Sparkles, badge: 'Music' },
    { id: 'video-generation-coming-soon', label: 'AI Video Generation', icon: Film, badge: 'Soon' },
    { id: 'shorts-creator', label: 'Shorts Creator', icon: Film, badge: '9:16' },
    { id: 'video-editor', label: 'Video Editor', icon: Scissors },
    { id: 'thumbnail-maker', label: 'Thumbnail Maker', icon: Image },
    { id: 'content-assistant', label: 'AI Content Assistant', icon: Sparkles, badge: 'SEO' },
    { id: 'projects', label: 'My Projects', icon: FolderGit2 },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'exports', label: 'Exports', icon: DownloadCloud },
    { id: 'settings', label: 'Settings', icon: Settings },
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
        fixed top-[61px] bottom-0 left-0 z-40 w-64 bg-[#0c0f16] border-r border-white/5 flex flex-col justify-between
        transition-transform duration-200 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Navigation list */}
        <div className="p-3 overflow-y-auto space-y-1">
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Creator Studio</p>
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
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group
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

          {/* Admin link if user is verified admin */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-white/5">
              <div className="px-3 py-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Administration</p>
              </div>
              <button
                id="sidebar-nav-admin"
                onClick={() => {
                  onNavigate('admin');
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group
                  ${currentRoute === 'admin' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent'
                  }
                `}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Portal</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom studio card */}
        <div className="p-3 border-t border-white/5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#151a26] to-[#12151f] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" /> Studio Plan
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                {currentUser?.plan || 'Free'}
              </span>
            </div>
            <div className="w-full bg-[#0a0c10] rounded-full h-1.5 overflow-hidden my-2">
              <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full w-[38%]" />
            </div>
            <p className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Storage Used</span>
              <span className="font-mono text-slate-300">{currentUser?.storageUsedMB || 480} MB / 5 GB</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
