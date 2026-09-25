import React from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  ShieldCheck, 
  Database, 
  Cookie, 
  Megaphone, 
  Lock, 
  Sliders, 
  Mail, 
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (route: string) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  const contactEmail = 'kiranchaulagain094@gmail.com';

  return (
    <LegalLayout
      currentRoute="privacy-policy"
      onNavigate={onNavigate}
      title="Privacy Policy"
      subtitle="How Kiran AI Video Studio handles your creative data, usage information, browser storage, and third-party advertising transparency."
      lastUpdated="September 20, 2026"
    >
      {/* 1. Introduction */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          1. Introduction & Studio Overview
        </h2>
        <p>
          Welcome to <strong>Kiran AI Video Studio</strong> ("we," "our," or "the Studio"). We provide a modern, web-based creative platform designed for video creators, YouTube producers, and content makers to generate video concepts, format 9:16 Shorts, edit multi-track timelines, design thumbnails, and optimize video SEO metadata.
        </p>
        <p>
          We respect your privacy and are committed to transparency. This Privacy Policy outlines what information is processed when you access and use our website and tools, how that information is utilized, and the controls you have over your data, browser storage, and advertising preferences.
        </p>
      </section>

      {/* 2. Information We Process */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Database className="w-5 h-5 text-indigo-400" />
          2. Information We Collect or Process
        </h2>
        
        {/* Open Access Note */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3 text-indigo-200">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white text-sm">Open Access Architecture (No Mandatory Sign-In)</p>
            <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
              Kiran AI Video Studio operates in an open creator mode. You are not required to create an account, log in, or provide personal passwords to use the generator, timeline editor, shorts creator, or thumbnail maker. If any future optional feature (such as cloud collaboration or team accounts) requires registration, minimal account information will only be requested with your explicit consent.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">A. Creative Content & Project Data</h3>
            <p className="text-slate-300 mt-1">
              When you use our creative tools, you input prompts, story ideas, scripts, timeline cuts, and metadata.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm mt-2 ml-2">
              <li><strong>Project Drafts:</strong> Saved locally in your browser's <code className="text-indigo-300">localStorage</code> so you can resume work without loss.</li>
              <li><strong>Local Storage Only:</strong> All project drafts, scene breakdowns, timeline cuts, and metadata are saved strictly inside your web browser's <code className="text-indigo-300">localStorage</code>. We do not store your creative projects or scripts on a remote database server.</li>
              <li><strong>AI Generation Inputs:</strong> Prompts submitted to the AI Video Planner or Content Assistant are processed to generate storyboard outlines and SEO tags.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">B. Automatically Collected Usage & Diagnostic Data</h3>
            <p className="text-slate-300 mt-1">
              When you browse the studio, standard technical data is collected automatically by hosting servers and network delivery services:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm mt-2 ml-2">
              <li>Device and browser information (browser type, version, operating system, screen resolution).</li>
              <li>Network information (IP address, approximate geographic region, referring URL).</li>
              <li>Interaction statistics (pages visited, feature usage frequency, generation completion logs, error telemetry to fix bugs).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">C. Account Information (Future / Optional)</h3>
            <p className="text-slate-300 mt-1">
              The platform currently operates without user accounts. If you contact support via email or if optional future cloud services require account registration, we may collect your email address, chosen display name, and communication history solely to provide support or requested services.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Cookies & Local Browser Storage */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Cookie className="w-5 h-5 text-indigo-400" />
          3. Cookies & Local Storage Technologies
        </h2>
        <p>
          We use browser storage technologies to provide a smooth, fast, and reliable user experience:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm ml-2">
          <li>
            <strong>Local Storage (<code className="text-indigo-300">localStorage</code>):</strong> Used to store your active video editing timeline, volume preferences, selected aspect ratio (16:9 vs 9:16), recently generated ideas, and draft project states. This data stays on your device unless you clear your browser cache.
          </li>
          <li>
            <strong>Session Storage:</strong> Used to maintain temporary navigation states during an active browser session.
          </li>
          <li>
            <strong>Cookies:</strong> Small text files placed on your device by websites or third-party service providers.
          </li>
        </ul>
        <p className="text-xs text-slate-400">
          For a comprehensive explanation of every cookie type and how to control them, please review our dedicated <button onClick={() => onNavigate('cookie-policy')} className="text-indigo-400 underline hover:text-indigo-300 font-semibold">Cookie Policy</button>.
        </p>
      </section>

      {/* 4. Third-Party Advertising & Google AdSense */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Megaphone className="w-5 h-5 text-indigo-400" />
          4. Third-Party Advertising & Google AdSense
        </h2>
        <p>
          To help support and maintain our free creative studio tools, we may display advertisements provided by third-party advertising partners, such as <strong>Google AdSense</strong>.
        </p>
        
        <div className="p-4 rounded-xl bg-[#131722] border border-white/10 space-y-3">
          <h4 className="text-sm font-bold text-white">How Third-Party Advertising Works:</h4>
          <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
            <li>
              Third-party vendors, including Google, use cookies (such as the DoubleClick cookie) or web beacons to serve advertisements based on a user's prior visits to this website and/or other websites across the Internet.
            </li>
            <li>
              Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits to Kiran AI Video Studio and other sites on the web.
            </li>
            <li>
              These third-party ad networks may automatically receive your IP address and collect non-personally identifiable information about your visits to provide targeted advertising and measure ad campaign effectiveness.
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Users' Choices & Opt-Outs */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          5. Your Choices & Personalized Advertising Opt-Out
        </h2>
        <p>
          You have full control over your cookies, tracking preferences, and personalized advertising settings:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-[#111520] hover:bg-[#181e2e] border border-white/10 flex items-center justify-between transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Google Ads Settings</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Opt out of personalized Google advertising</p>
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
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Digital Advertising Alliance (DAA)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Consumer choice page for participating ad networks</p>
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
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Network Advertising Initiative (NAI)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Opt out of interest-based ad networks</p>
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
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Your Online Choices (EDAA)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">European interactive digital advertising guide</p>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          <strong>Browser-Level Controls:</strong> You can configure your browser (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge) to refuse cookies, delete existing cookies, or notify you when a cookie is placed. Note that disabling essential storage may cause your project drafts or editor preferences to reset between visits.
        </p>
      </section>

      {/* 6. Data Security & Integrity */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          6. Data Security & Retention
        </h2>
        <p>
          We implement technical safeguards to protect your project data in transit and at rest:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm ml-2">
          <li>All network communication is encrypted using modern Transport Layer Security (HTTPS/TLS).</li>
          <li>We do not sell, rent, or trade your personal information or creative scripts to third parties.</li>
          <li>Local browser data remains on your client machine and is under your direct control.</li>
        </ul>
      </section>

      {/* 7. Children's Privacy */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white border-b border-white/10 pb-2">
          7. Children's Privacy
        </h2>
        <p>
          Kiran AI Video Studio is designed for content creators and general audiences. We do not knowingly collect personal identifiable information from children under 13 years of age (or under 16 where applicable by law). If you believe a child has provided personal information to us, please contact us so we can promptly delete it.
        </p>
      </section>

      {/* 8. Changes to This Policy */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white border-b border-white/10 pb-2">
          8. Changes to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time to reflect modifications in our features, legal standards, or advertising implementations. Any changes will be posted on this page with an updated "Last Updated" date.
        </p>
      </section>

      {/* 9. Contact Us */}
      <section className="p-5 rounded-2xl bg-[#111520] border border-white/10 space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-400" />
          9. Contact Us Regarding Privacy
        </h3>
        <p className="text-sm text-slate-300">
          If you have questions, concerns, or requests regarding this Privacy Policy, your creative data, or cookies, please reach out:
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
            Visit Contact Page →
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Note: This direct contact address is monitored for creator support, privacy requests, and policy inquiries.
        </p>
      </section>
    </LegalLayout>
  );
};
