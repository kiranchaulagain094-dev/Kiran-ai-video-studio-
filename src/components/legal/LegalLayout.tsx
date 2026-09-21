import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Cookie, 
  AlertCircle, 
  Mail, 
  ArrowLeft,
  Sparkles,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface LegalLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  currentRoute,
  onNavigate,
  title,
  subtitle,
  lastUpdated = 'September 20, 2026',
  children
}) => {
  const tabs = [
    { id: 'about-us', label: 'About Us', icon: ShieldCheck },
    { id: 'how-to-use', label: 'How to Use', icon: Sparkles },
    { id: 'ai-tools-guide', label: 'AI Tools Guide', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: AlertCircle },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms-of-service', label: 'Terms of Service', icon: FileText },
    { id: 'cookie-policy', label: 'Cookie Policy', icon: Cookie },
    { id: 'disclaimer', label: 'Disclaimer', icon: AlertCircle },
    { id: 'contact-us', label: 'Contact Us', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans">
      {/* Legal Sub-Header Navigation */}
      <div className="sticky top-[57px] z-30 bg-[#0d1017]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Back to Studio Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors w-fit group"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Creator Studio</span>
          </button>

          {/* Quick Tab Switcher */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" aria-label="Legal navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentRoute === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`legal-nav-${tab.id}`}
                  onClick={() => onNavigate(tab.id)}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all
                    ${isActive 
                      ? 'bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Document Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Document Header */}
        <header className="mb-10 pb-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kiran AI Video Studio Legal Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {title}
          </h1>

          <p className="text-base text-slate-400 mt-2 leading-relaxed">
            {subtitle}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-4 font-mono">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Effective & Last Updated: {lastUpdated}</span>
          </div>
        </header>

        {/* Content Container */}
        <article className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
          {children}
        </article>
      </main>
    </div>
  );
};
