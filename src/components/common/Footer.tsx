import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Cookie, 
  AlertCircle, 
  Mail, 
  ExternalLink, 
  Check, 
  Copy, 
  Youtube, 
  ArrowUp,
  Video,
  Film,
  Scissors,
  Image as ImageIcon,
  Compass
} from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
  currentRoute?: string;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentRoute, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const contactEmail = 'kiranchaulagain094@gmail.com';

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="app-footer" className={`w-full bg-[#080a0f] border-t border-white/10 text-slate-300 font-sans mt-auto ${className}`}>
      {/* Upper Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand & Mission (2 cols on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('dashboard')} 
              className="flex items-center gap-2.5 cursor-pointer group w-fit"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0d1017] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="font-black text-sm tracking-tight text-white uppercase block leading-none">
                  Kiran AI Video Studio
                </span>
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider">
                  CREATE • EDIT • OPTIMIZE • PUBLISH
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Next-generation browser studio for creators. Generate cinematic scene concepts, vertical Shorts, timeline edits, high-CTR thumbnails, and transparent YouTube SEO metadata packs in one unified workspace.
            </p>

            {/* Official Community Link */}
            <div className="pt-2">
              <a 
                href="https://youtube.com/@kiranaimusic-94?si=mTfia-Y4ZdAQqOFl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-all group"
              >
                <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                <span>YouTube: @kiranaimusic-94</span>
                <ExternalLink className="w-3 h-3 text-red-400" />
              </a>
            </div>
          </div>

          {/* Legal & Policies Column (Requirement Highlight) */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Guides & Policies</span>
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-link-how-to-use"
                  onClick={() => onNavigate('how-to-use')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'how-to-use' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>How to Use Studio</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-ai-tools-guide"
                  onClick={() => onNavigate('ai-tools-guide')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'ai-tools-guide' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>AI Tools Guide</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-faq"
                  onClick={() => onNavigate('faq')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'faq' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>FAQ</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-about-us"
                  onClick={() => onNavigate('about-us')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'about-us' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-privacy-policy"
                  onClick={() => onNavigate('privacy-policy')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'privacy-policy' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-terms-of-service"
                  onClick={() => onNavigate('terms-of-service')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'terms-of-service' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-cookie-policy"
                  onClick={() => onNavigate('cookie-policy')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'cookie-policy' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Cookie className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Cookie Policy</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-disclaimer"
                  onClick={() => onNavigate('disclaimer')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'disclaimer' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Disclaimer</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-contact-us"
                  onClick={() => onNavigate('contact-us')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'contact-us' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Contact Us</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Studio Tools Column */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Studio Tools
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-link-ai-guide"
                  onClick={() => onNavigate('ai-guide')}
                  className={`hover:text-white transition-colors flex items-center gap-1.5 text-left ${
                    currentRoute === 'ai-guide' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span className="text-white font-medium">AI Website Guide</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('video-generator')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <Video className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>AI Video Generator</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shorts-creator')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <Film className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Shorts Creator (9:16)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('video-editor')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <Scissors className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Timeline Video Editor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('thumbnail-maker')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <ImageIcon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Thumbnail Maker</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('content-assistant')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>AI Content & SEO</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Transparency */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contact & Support</span>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have questions regarding policies, tool features, or feedback? Reach out directly.
            </p>
            
            {/* Direct contact email box */}
            <div className="p-2.5 rounded-xl bg-[#121622] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                Direct Contact Email
              </span>
              <div className="flex items-center justify-between gap-1">
                <a 
                  href={`mailto:${contactEmail}`} 
                  className="text-xs font-mono text-indigo-300 hover:text-indigo-200 truncate"
                  title="Click to email kiranchaulagain094@gmail.com"
                >
                  {contactEmail}
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                  title="Copy email address"
                  aria-label="Copy email address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => onNavigate('contact-us')}
              className="w-full px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open Contact Form</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* Lower Bar: Copyright, Direct Inline Links & Scroll to Top */}
      <div className="border-t border-white/5 bg-[#06080d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="flex items-center gap-2 text-center sm:text-left flex-wrap justify-center sm:justify-start">
            <span className="text-slate-400">© 2026 Kiran AI Video Studio. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-400 text-[11px]">Open Access Creator Mode</span>
          </div>

          {/* Direct Visible Legal Links Row */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center font-medium">
            <button
              id="footer-inline-how-to-use"
              onClick={() => onNavigate('how-to-use')}
              className="hover:text-white transition-colors"
            >
              How to Use
            </button>
            <span className="text-slate-700">•</span>
            <button
              id="footer-inline-faq"
              onClick={() => onNavigate('faq')}
              className="hover:text-white transition-colors"
            >
              FAQ
            </button>
            <span className="text-slate-700">•</span>
            <button
              id="footer-inline-about"
              onClick={() => onNavigate('about-us')}
              className="hover:text-white transition-colors"
            >
              About Us
            </button>
            <span className="text-slate-700">•</span>
            <button
              id="footer-inline-privacy"
              onClick={() => onNavigate('privacy-policy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              id="footer-inline-terms"
              onClick={() => onNavigate('terms-of-service')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-slate-700">•</span>
            <button
              id="footer-inline-cookies"
              onClick={() => onNavigate('cookie-policy')}
              className="hover:text-white transition-colors"
            >
              Cookie Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              id="footer-inline-disclaimer"
              onClick={() => onNavigate('disclaimer')}
              className="hover:text-white transition-colors"
            >
              Disclaimer
            </button>
            <span className="text-slate-700">•</span>
            <button
              id="footer-inline-contact"
              onClick={() => onNavigate('contact-us')}
              className="hover:text-white transition-colors"
            >
              Contact Us
            </button>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] shrink-0"
            title="Scroll to top of page"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Top</span>
          </button>

        </div>
      </div>
    </footer>
  );
};
