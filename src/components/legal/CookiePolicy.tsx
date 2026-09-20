import React from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  Cookie, 
  HardDrive, 
  Sliders, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Megaphone,
  Mail,
  HelpCircle
} from 'lucide-react';

interface CookiePolicyProps {
  onNavigate: (route: string) => void;
}

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ onNavigate }) => {
  const contactEmail = 'contact@kiranvideostudio.com';

  const cookieTypes = [
    {
      title: '1. Essential & Functional Storage (First-Party)',
      badge: 'Strictly Necessary',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Required for core video editor functionality, retaining project drafts, and saving workspace configurations.',
      details: [
        'Editor State: Preserves video tracks, audio clips, text overlays, and playhead position across page refreshes.',
        'User Preferences: Remembers your preferred aspect ratio (16:9 widescreen or 9:16 vertical), audio mute states, and active tool views.',
        'Local Drafts: Stored directly in your browser using HTML5 localStorage so you never lose unsaved timeline edits.'
      ]
    },
    {
      title: '2. Performance & Diagnostic Telemetry',
      badge: 'Operational',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Anonymous measurements that help us identify video render lag, API latency, and UI bugs.',
      details: [
        'Page load timing and memory consumption during high-resolution video exports.',
        'Aggregated feature usage frequency to help prioritize future creative tools.',
        'Anonymous crash logs to patch timeline rendering glitches.'
      ]
    },
    {
      title: '3. Third-Party Advertising & Google AdSense',
      badge: 'Advertising & Measurement',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Used by third-party advertising services to show relevant advertisements and assess ad performance.',
      details: [
        'Google AdSense and its partners use cookies (such as DoubleClick cookies) to serve ads based on prior visits to this website and other sites on the web.',
        'Frequency capping: Ensuring you do not see the identical ad repeatedly.',
        'Ad measurement: Evaluating click-through rates and campaign effectiveness without identifying you personally.'
      ]
    }
  ];

  return (
    <LegalLayout
      currentRoute="cookie-policy"
      onNavigate={onNavigate}
      title="Cookie Policy"
      subtitle="Detailed breakdown of cookies, HTML5 local storage, and third-party advertising technologies utilized by Kiran AI Video Studio."
      lastUpdated="September 20, 2026"
    >
      {/* 1. What Are Cookies & Web Storage */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Cookie className="w-5 h-5 text-indigo-400" />
          1. What Are Cookies & Local Storage?
        </h2>
        <p>
          Cookies are small text files placed on your computer or mobile device when you visit a website. They are widely used to make websites work efficiently, save user preferences, and provide operational reporting.
        </p>
        <p>
          In addition to standard HTTP cookies, <strong>Kiran AI Video Studio</strong> utilizes modern HTML5 Web Storage (<code className="text-indigo-300">localStorage</code> and <code className="text-indigo-300">sessionStorage</code>). Because video creation involves complex timeline tracks, cut points, and audio cues, local storage allows the browser to save your work locally on your computer with high speed and zero unnecessary server upload latency.
        </p>
      </section>

      {/* 2. Categorized Storage Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <HardDrive className="w-5 h-5 text-indigo-400" />
          2. How We Use Cookies & Storage
        </h2>

        <div className="space-y-4">
          {cookieTypes.map((type, idx) => (
            <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-[#111520] border border-white/10 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white">{type.title}</h3>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${type.badgeColor}`}>
                  {type.badge}
                </span>
              </div>
              <p className="text-sm text-slate-300">{type.description}</p>
              <ul className="space-y-1.5 pt-2 text-xs sm:text-sm text-slate-400">
                {type.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Third-Party Advertising Transparency */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Megaphone className="w-5 h-5 text-indigo-400" />
          3. Third-Party Advertising & Google AdSense Details
        </h2>
        <p>
          We partner with third-party advertising vendors, including Google, to display advertisements on our website.
        </p>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-sm space-y-2">
          <p className="font-semibold text-white">Google AdSense Cookie Disclosure:</p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-amber-100/80">
            <li>Google, as a third-party vendor, uses cookies to serve ads on Kiran AI Video Studio.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visits to this site and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting Google Ads Settings.</li>
          </ul>
        </div>
      </section>

      {/* 4. Managing & Opting Out */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          4. How to Control & Opt Out of Cookies
        </h2>
        <p>
          You have multiple ways to control or block cookies and personalized advertising:
        </p>

        {/* Opt-out links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-[#111520] hover:bg-[#181e2e] border border-white/10 flex items-center justify-between transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Google Ads Settings</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Customize or turn off personalized Google ads</p>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <a
            href="https://optout.aboutads.info"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-[#111520] hover:bg-[#181e2e] border border-white/10 flex items-center justify-between transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">AboutAds Consumer Choice</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Opt out across multiple participating ad networks</p>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <a
            href="https://optout.networkadvertising.org"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-[#111520] hover:bg-[#181e2e] border border-white/10 flex items-center justify-between transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Network Advertising Initiative</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Industry-wide interest-based advertising opt-out</p>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <a
            href="https://www.youronlinechoices.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-[#111520] hover:bg-[#181e2e] border border-white/10 flex items-center justify-between transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Your Online Choices (EU/UK)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">European digital advertising preferences</p>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Browser Instructions */}
        <div className="p-4 rounded-xl bg-[#131722] border border-white/10 space-y-2 mt-4">
          <h4 className="text-sm font-bold text-white">Browser Cookie Settings Instructions:</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Most web browsers allow you to control cookies through their settings preferences:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
            <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Third-party cookies.</li>
            <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Enhanced Tracking Protection.</li>
            <li><strong>Apple Safari:</strong> Settings → Safari → Advanced → Block All Cookies.</li>
            <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies.</li>
          </ul>
          <p className="text-[11px] text-slate-400 pt-1">
            <em>Please note:</em> If you clear your browser's site data or disable local storage entirely, active editing projects that have not been saved to the server may be lost.
          </p>
        </div>
      </section>

      {/* 5. Contact Section */}
      <section className="p-5 rounded-2xl bg-[#111520] border border-white/10 space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-400" />
          5. Inquiries Regarding Cookies
        </h3>
        <p className="text-sm text-slate-300">
          If you have questions regarding our use of cookies or web storage technologies, please contact us:
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <a
            href={`mailto:${contactEmail}`}
            className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold w-fit transition-colors"
          >
            {contactEmail}
          </a>
          <button
            onClick={() => onNavigate('contact-us')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold w-fit transition-colors"
          >
            Open Contact Form →
          </button>
        </div>
      </section>
    </LegalLayout>
  );
};
