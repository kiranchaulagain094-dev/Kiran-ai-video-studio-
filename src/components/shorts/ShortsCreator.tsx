import React, { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Check, 
  Share2, 
  Music, 
  Mic, 
  Scissors, 
  Flame, 
  Eye, 
  Layers,
  Smartphone,
  Repeat,
  Lightbulb,
  SplitSquareVertical,
  CheckCircle2
} from 'lucide-react';
import { ShortsGenerationPlan } from '../../types';
import { StudioApiService } from '../../services/api';

interface SocialRepurposingData {
  concepts: {
    title: string;
    angle: string;
    targetPlatform: string;
    hook: string;
    script: string;
  }[];
  hookVariations: {
    type: string;
    text: string;
  }[];
  viralAngles: {
    title: string;
    explanation: string;
  }[];
  carouselSlides: {
    slideNumber: number;
    headline: string;
    body: string;
  }[];
}

interface ShortsCreatorProps {
  onOpenEditorWithShorts?: (plan: ShortsGenerationPlan) => void;
}

export const ShortsCreator: React.FC<ShortsCreatorProps> = ({ onOpenEditorWithShorts }) => {
  const [activeTab, setActiveTab] = useState<'shorts' | 'repurpose'>('shorts');

  const [topic, setTopic] = useState('Top 3 Visual Editing Tricks for Viral Retention in 2026');
  const [hook, setHook] = useState('Stop losing viewers in the first 3 seconds!');
  const [script, setScript] = useState('Cut the fluff. Deliver high value in the first second and use dynamic text pop-ups.');
  const [visualStyle, setVisualStyle] = useState('Realistic High-Energy');
  const [voice, setVoice] = useState('Male (Energetic)');
  const [music, setMusic] = useState('128 BPM Phonk / Trap');
  const [captionStyle, setCaptionStyle] = useState('Bold Animated Pop (Alex Hormozi style)');
  const [duration, setDuration] = useState('30 seconds');

  const [isGenerating, setIsGenerating] = useState(false);
  const [shortsPlan, setShortsPlan] = useState<ShortsGenerationPlan | null>({
    hook: 'Stop losing 80% of your viewers in the first 3 seconds!',
    script: 'Stop losing 80% of your viewers in the first 3 seconds! Here is the golden rule used by top creators: never start with "Hey guys, today I am going to show you". Start directly in the middle of high-stakes action. Watch how your retention graph quadruples immediately!',
    scenePlan: [
      {
        secondRange: '0 - 3s',
        action: 'Extreme snap zoom to creator pointing at camera with red alert overlay',
        onScreenText: 'STOP LOSING VIEWERS! 🚨',
        cameraAngle: 'Ultra close-up'
      },
      {
        secondRange: '3 - 15s',
        action: 'Dynamic split screen showing flat retention line versus viral hockey stick curve',
        onScreenText: 'THE GOLDEN RULE ⚡',
        cameraAngle: 'Front dynamic punch'
      },
      {
        secondRange: '15 - 30s',
        action: 'Fast screen demonstration inside Kiran AI Video Studio generating instant scenes',
        onScreenText: 'TAP SUBSCRIBE FOR MORE 🔥',
        cameraAngle: 'Top-down desk & screen'
      }
    ],
    captionText: 'Double your YouTube Shorts retention with this 3-second hook framework! 🎬 Which creator tip should we break down next? Drop a comment below! 👇',
    cta: 'Subscribe to Kiran AI Video Studio for daily masterclasses in viral video production!',
    title: 'The 3-Second Retention Secret for Viral Shorts',
    hashtags: ['#Shorts', '#CreatorEconomy', '#ViralVideo', '#KiranAIVideoStudio', '#VideoEditing', '#YouTubeTips'],
    musicMood: '128 BPM rhythmic electronic bassline with crisp click accents'
  });

  // Repurposing Data
  const [repurposingData, setRepurposingData] = useState<SocialRepurposingData>({
    concepts: [
      {
        title: 'The 3-Second Retention Rule (Direct Tutorial)',
        angle: 'Actionable Step-by-Step Breakdown',
        targetPlatform: 'YouTube Shorts & Instagram Reels',
        hook: 'If your videos flatline after 5 seconds, fix this ONE thing right now.',
        script: 'Look at this drop-off curve. 80% of people leave because you spent 3 seconds saying hello. Delete the intro, cut to the punchline, and watch your graph flip upward.'
      },
      {
        title: 'Why 99% of Editors Fail (Contrarian Mythbuster)',
        angle: 'Counter-Intuitive Truth',
        targetPlatform: 'TikTok & Reels',
        hook: 'You do not need fancy $5,000 cameras to get 100k views.',
        script: 'The algorithm does not care about your 8K resolution. It cares about pacing. Change your angle every 2.5 seconds and add bold captions. That is literally the entire secret.'
      },
      {
        title: 'Behind the Scenes Workflow (Creator Life)',
        angle: 'Curiosity & Tool Demonstration',
        targetPlatform: 'YouTube Shorts & LinkedIn',
        hook: 'Here is how I plan 10 viral video scripts in under 5 minutes.',
        script: 'I open Kiran AI Video Studio, type my one-sentence concept, and it generates the hook, visual cues, timeline, and SEO tags instantly. Work smarter, not longer.'
      }
    ],
    hookVariations: [
      { type: 'Negative Bias', text: 'Stop making this embarrassing rookie editing mistake on every video.' },
      { type: 'Curiosity Gap', text: 'Top creators begged me not to share this 3-second retention formula...' },
      { type: 'Bold Statement', text: 'This single tweak will double your watch time before tomorrow.' },
      { type: 'Direct Question', text: 'Are your videos getting stuck at 200 views? Here is exactly why.' },
      { type: 'Urgent Secret', text: 'If you only change ONE thing about your next reel, make it this.' }
    ],
    viralAngles: [
      { title: 'The Contrarian Angle', explanation: 'Challenging popular consensus (e.g. "Long intros kill your audience faster than bad audio").' },
      { title: 'The Fast Solution Angle', explanation: 'Solving a frustrating bottleneck in under 30 seconds with immediate payoff.' },
      { title: 'The Transformation Angle', explanation: 'Showing before-and-after contrast (Flat retention line vs hockey-stick growth).' }
    ],
    carouselSlides: [
      { slideNumber: 1, headline: 'How to Double Your Video Watch Time', body: 'The 3-Second Hook Masterclass for creators in 2026.' },
      { slideNumber: 2, headline: 'Rule 1: Kill the Polite Intro', body: 'Never say "Welcome back to my channel". Start inside the conflict or payoff.' },
      { slideNumber: 3, headline: 'Rule 2: Visual Cut Every 2.5 Seconds', body: 'Use punch-in zooms, B-roll overlays, and graphic stickers to reset attention spans.' },
      { slideNumber: 4, headline: 'Rule 3: High-Contrast Animated Captions', body: '85% of social feeds are scrolled on mute. Bold 3-word pop captions are mandatory.' },
      { slideNumber: 5, headline: 'Rule 4: Loop the Ending', body: 'Connect your final spoken sentence back to your opening hook for infinite repeat views.' },
      { slideNumber: 6, headline: 'Start Creating Faster with AI', body: 'Save this post and launch your next production on Kiran AI Video Studio!' }
    ]
  });

  // Simulator playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(15);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const plan = await StudioApiService.generateShortsPlan({
        topic,
        hook,
        script,
        visualStyle,
        voice,
        music,
        captionStyle
      });
      setShortsPlan(plan);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate shorts plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRepurpose = async () => {
    setIsRepurposing(true);
    setErrorMessage(null);
    try {
      const data = await StudioApiService.repurposeShorts({
        topic,
        script: shortsPlan?.script || script
      });
      if (data && data.concepts) {
        setRepurposingData(data);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate social repurposing pack.');
    } finally {
      setIsRepurposing(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-2 border border-violet-500/30">
            <Film className="w-3.5 h-3.5" />
            <span>9:16 Vertical & Social Repurposing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Shorts & Social Repurposing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Craft high-retention 9:16 vertical shorts for YouTube Shorts, Reels, and TikTok, or repurpose any video idea into 3 short concepts, hook variations, viral angles, and carousel slides.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#121622] rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('shorts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shorts' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Shorts Creator</span>
          </button>
          <button
            onClick={() => setActiveTab('repurpose')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'repurpose' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>Social Repurposing</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-center justify-between gap-3 animate-in fade-in">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold text-red-400 hover:text-red-200">
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'shorts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-2xl space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Topic / Concept
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 3 Quick Editing Secrets for Viral Shorts"
                  className="w-full bg-[#171c2b] text-white text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Opening Hook (0 - 3s)
                  </label>
                  <input
                    type="text"
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    placeholder="The opening scroll-stopper"
                    className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Target Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-violet-500 focus:outline-none"
                  >
                    <option value="15 seconds">15 seconds (Micro Short)</option>
                    <option value="30 seconds">30 seconds (Standard Viral)</option>
                    <option value="60 seconds">60 seconds (Deep Dive)</option>
                    <option value="90 seconds">90 seconds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Script / Talking Points
                </label>
                <textarea
                  rows={3}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Key ideas, punchlines or examples to cover..."
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl p-3.5 border border-white/10 focus:border-violet-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Visual Style
                  </label>
                  <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-violet-500 focus:outline-none"
                  >
                    <option value="Realistic High-Energy">Realistic High-Energy</option>
                    <option value="Dark Studio Aesthetic">Dark Studio Aesthetic</option>
                    <option value="Cinematic Anamorphic">Cinematic Anamorphic</option>
                    <option value="Anime / Cel Shaded">Anime / Cel Shaded</option>
                    <option value="Minimal 3D Render">Minimal 3D Render</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Caption Style
                  </label>
                  <select
                    value={captionStyle}
                    onChange={(e) => setCaptionStyle(e.target.value)}
                    className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-violet-500 focus:outline-none"
                  >
                    <option value="Bold Animated Pop (Alex Hormozi style)">Bold Animated Pop (Hormozi style)</option>
                    <option value="Clean Minimalist White">Clean Minimalist White</option>
                    <option value="Cinematic Yellow Subtitles">Cinematic Yellow Subtitles</option>
                    <option value="Glitch Cyberpunk">Glitch Cyberpunk</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Structuring Viral Retention Plan...' : 'Generate 9:16 Shorts Blueprint'}</span>
              </button>
            </form>

            {/* Generated Output */}
            {shortsPlan && (
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {shortsPlan.title}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(shortsPlan.script, 'script')}
                    className="text-xs text-violet-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedField === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'script' ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>

                {/* Hook Highlight */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-medium">
                  <span className="font-bold text-amber-400 uppercase text-[10px] block mb-1">
                    First 3-Second Hook
                  </span>
                  "{shortsPlan.hook}"
                </div>

                {/* Scene Plan */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Visual Cut Plan & On-Screen Typography
                  </span>
                  <div className="space-y-2">
                    {shortsPlan.scenePlan.map((sc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#171c2b] border border-white/5 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="font-mono text-indigo-400 text-[11px] font-bold mr-2">{sc.secondRange}</span>
                          <strong className="text-white mr-2">{sc.action}</strong>
                          <span className="text-slate-400">({sc.cameraAngle})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold font-mono text-[10px] shrink-0">
                          {sc.onScreenText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Captions & Hashtags */}
                <div className="p-3.5 rounded-xl bg-[#171c2b] border border-white/5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Caption & Tags</span>
                    <button
                      onClick={() => copyToClipboard(`${shortsPlan.captionText}\n\n${shortsPlan.hashtags.join(' ')}`, 'caption')}
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedField === 'caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'caption' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-slate-300">{shortsPlan.captionText}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {shortsPlan.hashtags.map((h, i) => (
                      <span key={i} className="text-[10px] text-cyan-400 font-mono">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Preview Panel: Interactive 9:16 Vertical Smartphone (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[320px] rounded-[40px] bg-[#0c0e17] border-4 border-[#242b3d] p-3 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
              {/* Top Phone Speaker notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1b2030] rounded-full z-30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-800" />
              </div>

              {/* 9:16 Vertical Screen Canvas */}
              <div className="relative aspect-[9/16] w-full rounded-[30px] overflow-hidden bg-gradient-to-b from-[#181e2b] via-[#10141f] to-[#0a0c10] flex flex-col justify-between p-4 border border-white/5 group">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                  alt="Shorts Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />

                {/* Top overlay indicators */}
                <div className="relative z-10 pt-4 flex items-center justify-between text-white text-[11px] font-medium">
                  <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-cyan-300">
                    9:16 Preview
                  </span>
                  <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {duration}
                  </span>
                </div>

                {/* Dynamic Animated Captions Simulator */}
                <div className="relative z-10 text-center my-auto px-2">
                  <div className="inline-block bg-amber-400 text-black px-3 py-1.5 rounded-xl font-black text-sm uppercase tracking-wide shadow-2xl transform group-hover:scale-105 transition-transform">
                    {shortsPlan?.scenePlan[0]?.onScreenText || 'STOP SCROLLING 🚨'}
                  </div>
                  <p className="text-white text-xs font-bold mt-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-3">
                    "{shortsPlan?.hook || 'Never lose retention again.'}"
                  </p>
                </div>

                {/* Bottom creator overlays */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md">
                      K
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">@kiranai.studio</p>
                      <p className="text-[10px] text-slate-400">Kiran AI Video Studio</p>
                    </div>
                    <button className="ml-auto px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                      Subscribe
                    </button>
                  </div>

                  <p className="text-[11px] text-white line-clamp-2 leading-tight drop-shadow-md">
                    {shortsPlan?.captionText}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full w-fit">
                    <Music className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span className="truncate max-w-[140px]">{shortsPlan?.musicMood || '128 BPM Phonk'}</span>
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden mt-2">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Phone bottom bar */}
              <div className="mt-3 flex items-center justify-around py-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
                <button
                  onClick={() => setPlaybackProgress((prev) => (prev >= 100 ? 0 : prev + 25))}
                  className="p-2 text-slate-400 hover:text-white rounded-lg"
                  title="Seek +25%"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Social Repurposing View */
        <div className="space-y-8">
          {/* 3 Short Video Concepts */}
          <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <SplitSquareVertical className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3 Repurposed Short Video Concepts (Shorts / Reels / TikTok)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleGenerateRepurpose}
                disabled={isRepurposing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRepurposing ? 'Synthesizing with Gemini...' : 'Synthesize 3 Viral Angles with AI'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {repurposingData.concepts.map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase font-mono">
                        Concept 0{i + 1}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.targetPlatform}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{c.title}</h4>
                    <p className="text-[11px] text-amber-300 italic bg-black/30 p-2 rounded-lg border border-white/5">
                      "{c.hook}"
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {c.script}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(`Hook: ${c.hook}\n\nScript: ${c.script}`, `concept-${i}`)}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedField === `concept-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === `concept-${i}` ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hook Variations & Viral Angles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hook Variations */}
            <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    High-Retention Hook Variations
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">5 Styles</span>
              </div>

              <div className="space-y-2.5">
                {repurposingData.hookVariations.map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#171c2b] border border-white/5 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-0.5">
                        {h.type}
                      </span>
                      <p className="text-slate-200 font-medium">"{h.text}"</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(h.text, `hook-${i}`)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedField === `hook-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Viral Angles */}
            <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Algorithmic Viral Angles
                </h3>
              </div>

              <div className="space-y-3">
                {repurposingData.viralAngles.map((a, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#171c2b] border border-white/5 space-y-1">
                    <span className="text-xs font-bold text-cyan-300 block">{a.title}</span>
                    <p className="text-xs text-slate-400 leading-relaxed">{a.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Carousel Slides */}
          <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Instagram & LinkedIn Carousel Slide Breakdown
                </h3>
              </div>
              <button
                onClick={() => {
                  const allText = repurposingData.carouselSlides
                    .map((s) => `[Slide ${s.slideNumber}: ${s.headline}]\n${s.body}`)
                    .join('\n\n');
                  copyToClipboard(allText, 'carousel-all');
                }}
                className="text-xs text-pink-400 hover:underline flex items-center gap-1 font-bold"
              >
                {copiedField === 'carousel-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'carousel-all' ? 'Copied' : 'Copy All Slides'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {repurposingData.carouselSlides.map((s) => (
                <div key={s.slideNumber} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 uppercase font-mono">
                    Slide {s.slideNumber}
                  </span>
                  <h5 className="text-xs font-bold text-white">{s.headline}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
