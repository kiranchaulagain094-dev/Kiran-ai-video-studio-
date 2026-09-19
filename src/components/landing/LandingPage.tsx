import React from 'react';
import { 
  Sparkles, 
  Video, 
  Film, 
  Scissors, 
  Image as ImageIcon, 
  Search, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Layers, 
  Zap, 
  SlidersHorizontal,
  Youtube,
  Cpu,
  LogIn
} from 'lucide-react';

interface LandingPageProps {
  onStartCreating: () => void;
  onOpenLogin: () => void;
  onSelectFeature: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onOpenLogin,
  onSelectFeature,
}) => {
  const featureCards = [
    {
      cardKey: 'feat-video-generator',
      id: 'video-generator',
      title: 'AI Video Generator',
      description: 'Turn prompts and scripts into cinematic multi-scene video concepts with camera direction and audio cues.',
      icon: Video,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Cinematic AI'
    },
    {
      cardKey: 'feat-shorts-creator',
      id: 'shorts-creator',
      title: 'Shorts Creator',
      description: 'Generate 9:16 vertical high-retention hooks, rapid visual pacing, and punchy captions for YouTube & TikTok.',
      icon: Film,
      color: 'from-indigo-600 to-violet-600',
      badge: '9:16 Vertical'
    },
    {
      cardKey: 'feat-video-editor',
      id: 'video-editor',
      title: 'Full Video Editor',
      description: 'Multi-track timeline with video, audio, text layers, trimming, speed controls, transitions and 4K export.',
      icon: Scissors,
      color: 'from-violet-600 to-fuchsia-600',
      badge: 'Timeline Pro'
    },
    {
      cardKey: 'feat-content-assistant',
      id: 'content-assistant',
      title: 'AI Content Assistant',
      description: 'Generate complete metadata packs: 5 alternative titles, descriptions, hashtags, tags, and timestamps.',
      icon: Sparkles,
      color: 'from-cyan-600 to-blue-600',
      badge: '14 Deliverables'
    },
    {
      cardKey: 'feat-thumbnail-maker',
      id: 'thumbnail-maker',
      title: 'Thumbnail Creator',
      description: 'High CTR composition layouts, emotional contrast, custom typography, badge stickers, and generation prompts.',
      icon: ImageIcon,
      color: 'from-emerald-600 to-teal-600',
      badge: 'High CTR'
    },
    {
      cardKey: 'feat-seo-assistant',
      id: 'content-assistant',
      title: 'YouTube SEO Assistant',
      description: 'Transparent objective scoring for keyword relevance, search intent, title clarity, and audience engagement.',
      icon: Search,
      color: 'from-amber-600 to-orange-600',
      badge: 'Evidence-Based'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Ambient radial glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />

        {/* Studio Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Gen Creator Suite for YouTube & Short-Form Video</span>
        </div>

        {/* Main Brand Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase">
          KIRAN AI VIDEO STUDIO
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-4 tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
          Create. Edit. Optimize. Publish.
        </p>

        {/* Description */}
        <p className="max-w-2xl mx-auto mt-5 text-sm sm:text-base text-slate-400 leading-relaxed">
          Create AI-powered videos, Shorts, thumbnails and YouTube content from a simple idea. Complete browser-based editor, SEO scoring engine, and automated project workflows.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-start-creating-btn"
            onClick={onStartCreating}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-signin-btn"
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#141824] hover:bg-[#1c2233] text-white font-semibold text-sm border border-white/10 flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-indigo-400" />
            <span>Sign In / Register</span>
          </button>
        </div>

        {/* Live Studio Interactive Mockup Preview */}
        <div className="mt-14 relative rounded-2xl bg-[#10141e] border border-white/10 p-2 sm:p-3 shadow-2xl shadow-indigo-950/40">
          <div className="rounded-xl overflow-hidden bg-[#0a0c10] border border-white/5">
            {/* Mockup browser topbar */}
            <div className="px-4 py-2.5 bg-[#141824] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                kiran-ai-video-studio.app • kathmandu_monsoon_romance.proj
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                1080p 60fps
              </span>
            </div>

            {/* Visual Studio Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 text-left">
              {/* Left quick cues */}
              <div className="hidden md:block md:col-span-3 bg-[#131722] rounded-xl p-3 border border-white/5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Scenes Generated (3)</p>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30">
                    <p className="text-xs font-semibold text-white">Scene 1: Durbar Rain</p>
                    <p className="text-[10px] text-indigo-300 font-mono">0:00 - 0:30 • Sarangi & Cello</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181e2b] border border-white/5">
                    <p className="text-xs font-semibold text-slate-300">Scene 2: Yellow Umbrella</p>
                    <p className="text-[10px] text-slate-500 font-mono">0:30 - 1:15 • Dialogue</p>
                  </div>
                </div>
              </div>

              {/* Center player */}
              <div className="md:col-span-6 relative aspect-video bg-[#171c2b] rounded-xl overflow-hidden flex items-center justify-center group">
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80"
                  alt="Kathmandu Monsoon"
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  PREVIEW CANVAS
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>01:14 / 03:00</span>
                  <span className="text-cyan-400">Cinematic 2.39:1 • Anamorphic Grade</span>
                </div>
              </div>

              {/* Right quick stats */}
              <div className="hidden md:block md:col-span-3 bg-[#131722] rounded-xl p-3 border border-white/5 space-y-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SEO Score</p>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-black text-emerald-400 font-mono">92/100</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Optimized for YouTube Search & Recommendations</div>
                </div>
                <div className="p-2 rounded-lg bg-[#181e2b] border border-white/5 text-[11px] space-y-1">
                  <p className="text-slate-300 font-semibold truncate">Kathmandu Monsoon Romance</p>
                  <p className="text-indigo-400 font-mono text-[10px]">#NepaliSong #KiranStudio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Feature Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Engineered for Modern Video Creators
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Every tool you need to take an initial thought to a published YouTube video or viral Short.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.cardKey}
                onClick={() => onSelectFeature(feat.id)}
                className="group relative p-6 rounded-2xl bg-[#121622] hover:bg-[#181e2e] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 gap-1">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Production Workflow Overview */}
      <section className="py-14 bg-[#0d1017] border-y border-white/5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Complete Lifecycle</span>
            <h3 className="text-2xl font-bold text-white mt-1">End-to-End Creator Workflow</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#131722] border border-white/5">
              <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-bold flex items-center justify-center mx-auto mb-2">1</span>
              <h4 className="text-xs font-bold text-white">Idea & Script</h4>
              <p className="text-[11px] text-slate-400 mt-1">Generate multi-scene storyboard & audio cues.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#131722] border border-white/5">
              <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-bold flex items-center justify-center mx-auto mb-2">2</span>
              <h4 className="text-xs font-bold text-white">Browser Editor</h4>
              <p className="text-[11px] text-slate-400 mt-1">Timeline trimming, speed control, split, music.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#131722] border border-white/5">
              <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-bold flex items-center justify-center mx-auto mb-2">3</span>
              <h4 className="text-xs font-bold text-white">SEO & Titles</h4>
              <p className="text-[11px] text-slate-400 mt-1">14 social assets + transparent SEO audit.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#131722] border border-white/5">
              <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-bold flex items-center justify-center mx-auto mb-2">4</span>
              <h4 className="text-xs font-bold text-white">Thumbnail & Export</h4>
              <p className="text-[11px] text-slate-400 mt-1">Design high-CTR cover and export in 4K.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 border-t border-white/5 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">Kiran AI Video Studio</p>
        <p className="mt-1">Create • Edit • Optimize • Publish</p>
        <p className="mt-3 text-[11px]">© 2026 Kiran AI Video Studio. All rights reserved.</p>
      </footer>
    </div>
  );
};
