import React from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  Sparkles, 
  Film, 
  Video, 
  Search, 
  Image as ImageIcon, 
  Music, 
  ShieldCheck, 
  Heart, 
  Mail, 
  User, 
  Compass, 
  Cpu, 
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AboutUsProps {
  onNavigate: (route: string) => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
  const ownerEmail = 'kiranchaulagain094@gmail.com';

  return (
    <LegalLayout
      title="About Kiran AI Video Studio"
      subtitle="An open, browser-based creator suite for video planning, scriptwriting, and YouTube content optimization."
      lastUpdated="September 2026"
      onNavigate={onNavigate}
    >
      {/* Overview & Mission */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          1. What is Kiran AI Video Studio?
        </h2>
        <p className="text-slate-300 leading-relaxed text-sm">
          Kiran AI Video Studio is an independent web application and production planning toolkit developed by <strong>Kiran Chaulagain</strong>. It was designed specifically to solve one of the biggest bottlenecks digital creators face: transitioning from an abstract creative thought to a structured, scene-by-scene video production plan.
        </p>
        <p className="text-slate-300 leading-relaxed text-sm">
          Rather than making exaggerated marketing promises, Kiran AI Video Studio provides practical, transparent utilities: screenplay writers, 9:16 vertical hook architects, YouTube title and SEO pack generators, thumbnail composition planners, and music video storyboards. Every tool is freely accessible directly in the browser without mandatory accounts, paywalls, or forced subscriptions.
        </p>
      </section>

      {/* Founder & Transparency */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          2. Creator & Editorial Transparency
        </h2>
        <div className="p-4 rounded-2xl bg-[#131722] border border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-white">Kiran Chaulagain</p>
              <p className="text-xs text-indigo-300">Creator, Developer & Operator</p>
            </div>
            <a 
              href={`mailto:${ownerEmail}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-mono transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{ownerEmail}</span>
            </a>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            This website is maintained by Kiran Chaulagain as a personal creator project. We do not invent fictional corporate entities, artificial employee rosters, or fake international headquarters. All inquiries regarding the site, feature requests, or copyright matters are addressed personally by the developer.
          </p>
        </div>
      </section>

      {/* Available Tools */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          3. What the Studio Provides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#131722] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Video className="w-4 h-4 text-blue-400" />
              AI Video & Screenplay Planner
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforms creative ideas into structured multi-scene scripts with timing estimates, camera motion guidelines, audio cues, and visual generation prompts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131722] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Film className="w-4 h-4 text-violet-400" />
              Shorts & Reels Hook Architect
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plans 9:16 high-retention vertical videos, opening 3-second psychological hooks, caption styles, and cross-platform social repurposing ideas.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131722] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Search className="w-4 h-4 text-cyan-400" />
              YouTube SEO & Content Assistant
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates 10 categorized title variations, timestamped video descriptions, targeted hashtags, and an objective search relevance audit.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131722] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Thumbnail Concept & Layout Designer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plans high-CTR visual layouts, headline typography placement, color contrast palettes, and descriptive prompts for image generators.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131722] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Music className="w-4 h-4 text-amber-400" />
              Music Video Storyboard Planner
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aligns song lyrics and emotional crescendos with cinematic visual pacing, lighting directions, and timed verse-chorus scene changes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131722] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-rose-400" />
              Production Templates & Local Projects
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Battle-tested starting frameworks for travel videos, tutorials, tech breakdowns, and music videos, stored securely in your own browser.
            </p>
          </div>
        </div>
      </section>

      {/* How the Technology Works */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          4. How the AI Works
        </h2>
        <p className="text-slate-300 leading-relaxed text-sm">
          When you enter a concept or title, our server communicates securely with state-of-the-art Google Gemini language models to generate contextual screenplays, search-optimized metadata, and visual suggestions. If external network connectivity or API quotas encounter transient constraints, intelligent algorithmic studio fallbacks ensure you still receive a fully formatted, production-ready template.
        </p>
        <p className="text-slate-300 leading-relaxed text-sm">
          All API communications occur server-to-server. No private API keys or sensitive credentials are ever sent to your browser.
        </p>
      </section>

      {/* Honest AI Expectations & Limitations */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          5. Realistic Expectations & AI Limitations
        </h2>
        <div className="space-y-2.5 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span><strong>Planning, Not Automatic Rendering:</strong> Our tools generate text scripts, scene breakdowns, audio cues, metadata, and visual prompts. They do not automatically produce rendered cinematic motion picture files out of thin air.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span><strong>No Guaranteed Virality:</strong> We do not guarantee views, subscribers, algorithmic virality, or financial returns. Success on YouTube, TikTok, and Instagram depends on video quality, audience connection, and consistent publishing.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span><strong>Creator Ownership:</strong> You own the scripts, descriptions, and creative plans you produce here. We make no intellectual property claim over your video projects.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span><strong>Human Judgment Required:</strong> AI output should always be reviewed, personalized, and fact-checked before final publishing.</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-3 pt-4 border-t border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-400" />
          6. Contacting the Creator
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Feedback, bug reports, collaboration requests, or questions regarding our privacy and terms are always welcome. Please email directly at:
        </p>
        <div className="p-3 rounded-xl bg-[#131722] border border-white/10 flex items-center justify-between">
          <a 
            href={`mailto:${ownerEmail}`}
            className="text-sm font-mono text-indigo-300 hover:text-white underline"
          >
            {ownerEmail}
          </a>
          <button
            onClick={() => onNavigate('contact-us')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Open Contact Page
          </button>
        </div>
      </section>
    </LegalLayout>
  );
};
