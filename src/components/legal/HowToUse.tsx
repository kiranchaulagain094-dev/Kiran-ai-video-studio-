import React from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  Video, 
  Film, 
  Scissors, 
  Image as ImageIcon, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  ArrowRight, 
  HardDrive, 
  Sliders,
  HelpCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface HowToUseProps {
  onNavigate: (route: string) => void;
}

export const HowToUse: React.FC<HowToUseProps> = ({ onNavigate }) => {
  return (
    <LegalLayout
      currentRoute="how-to-use"
      onNavigate={onNavigate}
      title="How to Use Kiran AI Video Studio"
      subtitle="A step-by-step creator guide to planning screenplays, scripting vertical Shorts, editing timelines, and optimizing YouTube SEO metadata."
      lastUpdated="September 20, 2026"
    >
      {/* 1. Quick Start Overview */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Lightbulb className="w-5 h-5 text-indigo-400" />
          1. Quick Start Overview
        </h2>
        <p>
          Kiran AI Video Studio is designed to make video pre-production and YouTube optimization effortless, fast, and structured. You do not need to register an account, enter a credit card, or configure complex API keys. All tools work immediately in your modern web browser, and all your drafts are stored securely on your own device using browser localStorage.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 not-prose">
          <div className="p-4 rounded-xl bg-[#121622] border border-white/5 space-y-1">
            <span className="text-xs font-bold text-indigo-400">Step 1 • Plan</span>
            <p className="text-xs text-white font-semibold">Generate Storyboard</p>
            <p className="text-[11px] text-slate-400">Input your video concept into the AI Video Planner or Shorts Creator.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#121622] border border-white/5 space-y-1">
            <span className="text-xs font-bold text-violet-400">Step 2 • Edit & Design</span>
            <p className="text-xs text-white font-semibold">Arrange & Cover</p>
            <p className="text-[11px] text-slate-400">Review clips on the timeline and design high-CTR thumbnail covers.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#121622] border border-white/5 space-y-1">
            <span className="text-xs font-bold text-cyan-400">Step 3 • Optimize</span>
            <p className="text-xs text-white font-semibold">SEO & Publish</p>
            <p className="text-[11px] text-slate-400">Generate YouTube title options, tags, descriptions, and hashtags.</p>
          </div>
        </div>
      </section>

      {/* 2. Tool-by-Tool Guide */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Video className="w-5 h-5 text-indigo-400" />
          2. Step-by-Step Tool Instructions
        </h2>

        {/* AI Video Planner */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              <span>Tool 1: AI Video Planner</span>
            </h3>
            <button
              onClick={() => onNavigate('video-generator')}
              className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Open Tool</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Use this tool when developing documentaries, travel vlogs, narrative stories, or YouTube long-form videos.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 ml-1">
            <li><strong className="text-slate-200">Enter Project Title:</strong> Provide a working title (e.g., "Mustang Trekking Adventure").</li>
            <li><strong className="text-slate-200">Select Category & Duration:</strong> Choose from Music Video, YouTube Longform, Story, or Documentary, and duration from 15 seconds to 3 minutes.</li>
            <li><strong className="text-slate-200">Specify Visual Style:</strong> Select Cinematic, Realistic, Romantic, Anime, 3D, or Travel.</li>
            <li><strong className="text-slate-200">Multi-Language Controls:</strong> Optionally specify separate languages for the script, title, description, and captions (Nepali, English, Hindi, etc.).</li>
            <li><strong className="text-slate-200">Generate & Review:</strong> Click "Generate AI Video Production Blueprint". The tool produces a scene-by-scene script with timing brackets, visual generation prompts, camera movements, dialogue, and sound effects.</li>
            <li><strong className="text-slate-200">Export & Transfer:</strong> Click "Open in Timeline Editor" or "Open in SEO Suite" to carry your project directly to the next stage.</li>
          </ol>
        </div>

        {/* Shorts Creator */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Tool 2: Shorts & Reels Creator (9:16 Vertical)</span>
            </h3>
            <button
              onClick={() => onNavigate('shorts-creator')}
              className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Open Tool</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Engineered for high-retention vertical short-form videos on YouTube Shorts, Instagram Reels, and TikTok.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 ml-1">
            <li><strong className="text-slate-200">Define the Hook:</strong> Enter the central concept, surprising question, or controversy in the prompt field.</li>
            <li><strong className="text-slate-200">Select Hook Style:</strong> Choose Curiosity Gap, Problem-Agitation, Shocking Fact, or Story Loop.</li>
            <li><strong className="text-slate-200">Generate Pacing Plan:</strong> The system produces 15 to 60-second vertical cut plans with exact on-screen caption cues, sound cues, and visual cuts every 2-4 seconds to prevent viewers from swiping away.</li>
          </ol>
        </div>

        {/* Timeline Video Editor */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-violet-400" />
              <span>Tool 3: Timeline Video Editor</span>
            </h3>
            <button
              onClick={() => onNavigate('video-editor')}
              className="px-3 py-1 rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Open Tool</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-track timeline to inspect and sequence video clips, audio tracks, and text overlays in your browser.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 ml-1">
            <li><strong className="text-slate-200">Timeline Navigation:</strong> Click any clip on Track 1 (Video), Track 2 (Audio), or Track 3 (Text) to select it.</li>
            <li><strong className="text-slate-200">Trimming & Splitting:</strong> Use the Split tool to divide clips at the current playhead position, or use the Trim sliders to adjust durations.</li>
            <li><strong className="text-slate-200">Volume & Balancing:</strong> Adjust the volume slider in the inspector to mix dialogue and background music smoothly.</li>
            <li><strong className="text-slate-200">Export Timeline Data:</strong> Click Export to download the full timeline layout as a structured JSON file for your production archive. (Direct MP4 rendering is currently in development).</li>
          </ol>
        </div>

        {/* Thumbnail Maker */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Tool 4: Thumbnail Concept Designer</span>
            </h3>
            <button
              onClick={() => onNavigate('thumbnail-maker')}
              className="px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Open Tool</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Design high-contrast, high-CTR YouTube covers and generate precision AI image prompts.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 ml-1">
            <li><strong className="text-slate-200">Select Thumbnail Style:</strong> Choose High-Emotion, Before/After, Cinematic Story, or Minimalist.</li>
            <li><strong className="text-slate-200">Adjust Text & Badges:</strong> Customize the headline wording, font color, and pill badges for maximum contrast against dark or light backgrounds.</li>
            <li><strong className="text-slate-200">Download Real PNG Canvas:</strong> Click "Download Thumbnail" to render and save a high-resolution PNG image directly to your computer.</li>
          </ol>
        </div>

        {/* Content & SEO Assistant */}
        <div className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Tool 5: Content & SEO Assistant</span>
            </h3>
            <button
              onClick={() => onNavigate('content-assistant')}
              className="px-3 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Open Tool</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Generate 14 strategic YouTube metadata assets with objective 0-100 search intent evaluation.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 ml-1">
            <li><strong className="text-slate-200">Input Topic & Target Keywords:</strong> Describe what your video covers and key terms viewers might search for.</li>
            <li><strong className="text-slate-200">Receive 5 Optimized Titles:</strong> Review 5 distinct title formulations: High CTR, Search Intent, Question, Curiosity, and Direct Match.</li>
            <li><strong className="text-slate-200">Formatted Description & Timestamps:</strong> Copy a complete YouTube description complete with introduction, chapter timestamps, key takeaways, and social links.</li>
            <li><strong className="text-slate-200">Tags & Hashtags:</strong> Copy ready-to-paste comma-separated tags and trending hashtags for YouTube Studio.</li>
          </ol>
        </div>
      </section>

      {/* 3. Managing Projects & Data in Local Browser Storage */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <HardDrive className="w-5 h-5 text-indigo-400" />
          3. Managing Projects & Local Storage
        </h2>
        <p>
          All your video plans, timelines, and preferences are saved automatically in your browser's HTML5 localStorage. This means:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm ml-2">
          <li><strong>Zero Account Hassle:</strong> You can close your browser tab and return at any time to resume your drafts.</li>
          <li><strong>Privacy First:</strong> Your creative drafts remain on your personal computer and are not uploaded to central tracking databases.</li>
          <li><strong>Browser Clearing Warning:</strong> If you clear your browser's site cookies or storage cache, your locally stored drafts will be reset. Use the "Export JSON" feature in the editor or copy your script to a local text file to back up critical work.</li>
        </ul>
      </section>

      {/* 4. Creator Workflow Summary */}
      <section className="p-5 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          4. Recommended Creator Workflow
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          For the best results, start with the <strong>AI Video Planner</strong> to structure your scenes and dialogue. Next, open your plan in the <strong>Timeline Video Editor</strong> to review timing. When you are ready to produce, use the <strong>Thumbnail Concept Designer</strong> to plan your cover and the <strong>Content & SEO Assistant</strong> to generate metadata for your YouTube upload.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => onNavigate('landing')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
          >
            Launch Studio Workspace
          </button>
          <button
            onClick={() => onNavigate('ai-tools-guide')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-colors"
          >
            Read AI Tools Guide
          </button>
        </div>
      </section>
    </LegalLayout>
  );
};
