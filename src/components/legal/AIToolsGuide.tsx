import React from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  Sparkles, 
  Cpu, 
  Video, 
  Film, 
  Scissors, 
  Image as ImageIcon, 
  Compass, 
  Music, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Languages,
  Layers
} from 'lucide-react';

interface AIToolsGuideProps {
  onNavigate: (route: string) => void;
}

export const AIToolsGuide: React.FC<AIToolsGuideProps> = ({ onNavigate }) => {
  return (
    <LegalLayout
      currentRoute="ai-tools-guide"
      onNavigate={onNavigate}
      title="AI Tools Guide & Methodology"
      subtitle="In-depth technical and creative documentation on how the artificial intelligence models power Kiran AI Video Studio."
      lastUpdated="September 20, 2026"
    >
      {/* 1. System Architecture & Model Stack */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          1. AI Architecture & Backend Pipeline
        </h2>
        <p>
          Kiran AI Video Studio combines large language models with specialized video pre-production heuristics. When you request a storyboard or SEO metadata pack, the studio processes your creative inputs through a secure backend proxy communicating with Google Gemini generative models.
        </p>
        <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 space-y-2 text-xs text-slate-300">
          <p className="font-bold text-white text-sm">Key Architectural Safeguards:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400">
            <li><strong>Zero Public Key Leakage:</strong> All AI requests are proxied server-side so API keys and infrastructure credentials are never exposed in browser network inspection.</li>
            <li><strong>Resilient Programmatic Fallback:</strong> If third-party API rate limits occur during heavy peak demand, the studio automatically switches to deterministic programmatic algorithms, ensuring you never face an empty screen or interrupted creative session.</li>
            <li><strong>Client-Side State:</strong> No prompts or generated scripts are saved into external tracking databases without your explicit instruction. All generated content lives directly inside your browser storage.</li>
          </ul>
        </div>
      </section>

      {/* 2. Comprehensive Tool Deep Dive */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          2. Tool-by-Tool Capabilities & Deliverables
        </h2>

        {/* AI Video Planner */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">AI Video Planner & Screenplay Engine</h3>
                <p className="text-[11px] text-slate-400">Cinematic pre-production & structured scene breakdowns</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('video-generator')}
              className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Translates natural language creative thoughts into a professional multi-scene screenplay. Each generated scene includes a timestamp window (e.g. 0:00 - 0:30), descriptive title, camera direction (e.g., "Slow tracking crane down"), lighting cues, character voiceover script, sound effects (foley), and copy-ready AI visual generation prompts.
          </p>
          <div className="p-3 rounded-xl bg-[#171c2b] border border-white/5 text-[11px] space-y-1">
            <span className="text-indigo-300 font-bold uppercase tracking-wider">Prompt Tip:</span>
            <p className="text-slate-400">
              Provide specific setting details, time of day, and emotional conflict. For example: <em>"A monsoon afternoon in Patan Durbar Square, warm tea stall lanterns reflecting on wet flagstones, two childhood friends meeting after ten years."</em>
            </p>
          </div>
        </div>

        {/* Shorts & Reels Creator */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Shorts & Reels Hook Architect (9:16)</h3>
                <p className="text-[11px] text-slate-400">Psychological retention pacing for vertical video</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('shorts-creator')}
              className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Engineered around the crucial first 3-second retention window. On mobile platforms like YouTube Shorts, Instagram Reels, and TikTok, viewer drop-off is steepest in the opening seconds. This tool crafts compelling curiosity triggers, bold text overlays, and 2-4 second cut sequences designed to keep average percentage viewed (APV) high.
          </p>
        </div>

        {/* Content & SEO Assistant */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Content & SEO Assistant</h3>
                <p className="text-[11px] text-slate-400">14 strategic YouTube metadata assets & 0-100 scoring</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('content-assistant')}
              className="px-3 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Generates 5 distinct title formulas (High CTR, Search Intent, Question Hook, Curiosity Gap, and Direct Match), full video descriptions with chapter timestamps, keyword tags formatted for YouTube Studio, hashtag clusters, and an objective 7-factor SEO score assessing character length, keyword density, and search intent alignment.
          </p>
        </div>

        {/* Thumbnail Concept Designer */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Thumbnail Concept Designer</h3>
                <p className="text-[11px] text-slate-400">Visual hierarchy, color contrast & prompt blueprint</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('thumbnail-maker')}
              className="px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Employs the Rule of Thirds and visual psychology to create thumbnail blueprints that stand out on crowded YouTube homefeeds. Provides subject placement guidance, facial expression emotion tags, contrast color palettes, punchy headline text, and renders real high-resolution PNG image downloads directly to your device.
          </p>
        </div>

        {/* Music Video Storyboarder */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Music Video Storyboarder</h3>
                <p className="text-[11px] text-slate-400">Song-specific narrative arcs & acoustic visual pacing</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('music-video')}
              className="px-3 py-1 rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tailored specifically for musicians, lyricists, and music video directors. Organizes visual storylines corresponding to musical structure: Acoustic Intro, Verse 1 Setup, Pre-Chorus Build, Chorus Emotional Climax, and Outro Fade, with specific cues for cultural instruments (Sarangi, Madal, acoustic guitar, flutes).
          </p>
        </div>

        {/* AI Website Guide */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600/20 text-teal-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Multilingual AI Website Guide</h3>
                <p className="text-[11px] text-slate-400">Natural language tool matching in any language</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('ai-guide')}
              className="px-3 py-1 rounded-lg bg-teal-600/20 text-teal-300 hover:bg-teal-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            An intelligent navigation assistant that accepts input in natural everyday language—including Nepali (नेपाली), Romanized Nepali, Hindi (हिन्दी), and English. It interprets what you want to achieve and directs you to the optimal studio tool without technical jargon.
          </p>
        </div>
      </section>

      {/* 3. Multi-Language Support */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Languages className="w-5 h-5 text-indigo-400" />
          3. Multi-Language Support & Localization
        </h2>
        <p>
          Kiran AI Video Studio features deep multilingual support for international and regional creators. You can generate screenplays, dialogue, titles, and captions in 10 languages:
        </p>
        <div className="flex flex-wrap gap-2 text-xs pt-1">
          {['Nepali (नेपाली)', 'English', 'Hindi (हिन्दी)', 'Spanish (Español)', 'French (Français)', 'German (Deutsch)', 'Japanese (日本語)', 'Korean (한국어)', 'Arabic (العربية)', 'Chinese (中文)'].map(lang => (
            <span key={lang} className="px-3 py-1.5 rounded-xl bg-[#121622] border border-white/10 text-slate-300 font-medium">
              {lang}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Our Multi-Language Split Controls allow you to output the spoken dialogue in Nepali or Hindi while simultaneously generating English titles and descriptions for broad international search reach.
        </p>
      </section>

      {/* 4. Realistic Boundaries & Editorial Review */}
      <section className="p-5 rounded-2xl bg-[#121622] border border-amber-500/20 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          4. Creative Responsibility & AI Limitations
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Artificial intelligence models are probabilistic assistance tools, not omniscient directors. While our models provide high-quality structural outlines, you as the creator should always review, fact-check, and personalize scripts before filming. Algorithms cannot guarantee YouTube viral metrics or subscriber counts; success stems from human authenticity, storytelling, and viewer resonance.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('how-to-use')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <span>Read How to Use Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </LegalLayout>
  );
};
