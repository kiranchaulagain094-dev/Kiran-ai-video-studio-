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
  BookOpen
} from 'lucide-react';

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
  const mainNavItems = [
    { id: 'landing', label: 'Studio Home', icon: Home },
    { id: 'articles', label: 'Creator Guides', icon: BookOpen, badge: '30' },
    { id: 'ai-guide', label: 'AI Website Guide', icon: Compass, badge: 'Guide' },
    { id: 'video-generator', label: 'AI Video Planner', icon: Video, badge: 'AI' },
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
