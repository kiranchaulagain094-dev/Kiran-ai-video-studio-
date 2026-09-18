import React from 'react';
import { LayoutDashboard, Video, Film, Scissors, Sparkles, FolderGit2 } from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'video-generator', label: 'AI Video', icon: Video },
    { id: 'shorts-creator', label: 'Shorts', icon: Film },
    { id: 'video-editor', label: 'Editor', icon: Scissors },
    { id: 'content-assistant', label: 'AI SEO', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f16]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentRoute === item.id;
        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg min-w-[52px] min-h-[44px] transition-colors ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
