import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  Film, 
  Scissors, 
  Image as ImageIcon, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldCheck,
  Compass,
  FileText,
  Mail,
  Play,
  BookOpen,
  Clock
} from 'lucide-react';
import { Footer } from '../common/Footer';
import { CORE_15_CREATOR_GUIDES } from '../../data/creatorGuides';
import { AdSenseSafeContainer } from '../common/AdSenseSafeContainer';

interface LandingPageProps {
  onStartCreating: () => void;
  onSelectFeature: (route: string) => void;
  onSelectArticle?: (slug: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onSelectFeature,
  onSelectArticle
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const featureCards = [
    {
      id: 'articles',
      title: 'AI Creator Guides (30)',
      subtitle: 'Complete Educational Knowledge Base',
      description: '30 original, in-depth guides covering scripting, high-CTR titles, thumbnail psychology, Shorts hooks, and SEO in Nepali and English.',
      icon: BookOpen,
      color: 'from-fuchsia-600 to-indigo-600',
      badge: '30 Guides'
    },
    {
      id: 'ai-guide',
      title: 'AI Website Guide',
      subtitle: 'Multilingual Creative Navigator',
      description: 'Tell us what you want to create. Our AI will understand your goal and guide you to the right tools in any language.',
      icon: Compass,
      color: 'from-cyan-600 to-indigo-600',
      badge: 'Multilingual Guide'
    },
    {
      id: 'video-generator',
      title: 'AI Video Planner',
      subtitle: 'Multi-Scene Screenplay & Direction',
      description: 'Turn ideas into structured screenplays with timing brackets, visual prompts, camera movements, dialogue, and sound cues.',
      icon: Video,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Screenwriting'
    },
    {
      id: 'timeline-planner',
      title: 'AI Video Timeline Planner',
      subtitle: 'Google Flow Prompt & Screenshot Workflow',
      description: 'Scene-by-scene 15s to 5m production timelines with copyable Google Flow prompts, exact duration math, and screenshot upload guides.',
      icon: Clock,
      color: 'from-cyan-600 to-indigo-600',
      badge: 'Flow Ready'
    },
    {
      id: 'shorts-creator',
      title: 'Shorts & Reels Creator',
      subtitle: '9:16 Vertical Video Strategy',
      description: 'Design high-retention 3-second opening hooks, fast visual pacing, on-screen text cues, and captions for YouTube Shorts and TikTok.',
      icon: Film,
      color: 'from-indigo-600 to-violet-600',
      badge: 'Vertical Pacing'
    },
    {
      id: 'video-editor',
      title: 'Timeline Video Editor',
      subtitle: 'In-Browser Multi-Track Assembly',
      description: 'Assemble and review video, audio, and subtitle layers with trimming, volume balancing, playhead scrub, and preview playback.',
      icon: Scissors,
      color: 'from-violet-600 to-fuchsia-600',
      badge: 'Timeline'
    },
    {
      id: 'content-assistant',
      title: 'Content & SEO Assistant',
      subtitle: '14 Strategic Metadata Deliverables',
      description: 'Generate optimized YouTube titles, description outlines with timestamps, tags, hashtags, and objective 0-100 SEO scoring.',
      icon: Sparkles,
      color: 'from-cyan-600 to-blue-600',
      badge: 'Metadata & SEO'
    },
    {
      id: 'thumbnail-maker',
      title: 'Thumbnail Concept Designer',
      subtitle: 'High-CTR Visual Composition',
      description: 'Plan rule-of-thirds visual hierarchy, emotional contrast, high-contrast headline typography, and generator prompt concepts.',
      icon: ImageIcon,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Click-Through Rate'
    },
    {
      id: 'music-video',
      title: 'Music Video Storyboarder',
      subtitle: 'Song Concept & Narrative Arc',
      description: 'Specialized narrative planner for folk, romantic, and acoustic music videos with verse, chorus, and climax scene breakdowns.',
      icon: Compass,
      color: 'from-amber-600 to-orange-600',
      badge: 'Music Stories'
    }
  ];

  const userAudiences = [
    {
      title: 'Solo YouTube Creators',
      description: 'Save hours organizing long-form video concepts, script outlines, and SEO descriptions before turning on your camera.'
    },
    {
      title: 'Vertical Video Editors',
      description: 'Craft high-retention opening hooks within the first 3 seconds to keep viewers engaged on Shorts, Reels, and TikTok.'
    },
    {
      title: 'Musicians & Songwriters',
      description: 'Storyboard emotional storylines for music releases, connecting acoustic instruments and lyrical arcs with compelling visuals.'
    },
    {
      title: 'Educators & Explainers',
      description: 'Transform complex technical or cultural subjects into scannable, step-by-step visual modules for clear audience understanding.'
    }
  ];

  const workflowSteps = [
    {
      step: '1',
      title: 'Input Your Concept',
      desc: 'Enter your core video theme, target audience, style (e.g. Cinematic, Realistic, Travel), and duration.'
    },
    {
      step: '2',
      title: 'Receive Scene Plan',
      desc: 'Get structured scenes with precise timestamps, camera movement notes, voiceover copy, and foley cues.'
    },
    {
      step: '3',
      title: 'Arrange on Timeline',
      desc: 'Review and adjust timing tracks, audio levels, and visual sequences directly in the browser video editor.'
    },
    {
      step: '4',
      title: 'Generate Metadata & SEO',
      desc: 'Produce 5 alternative titles, timestamps, hashtags, and a detailed 7-metric SEO readiness assessment.'
    },
    {
      step: '5',
      title: 'Publish with Confidence',
      desc: 'Use your complete production package to shoot, edit, and publish your video to YouTube or social platforms.'
    }
  ];

  const faqs = [
    {
      q: 'What is the AI Website Guide and how does it work?',
      a: 'The AI Website Guide is an honest, multilingual navigation assistant. You can tell it what you want to create or accomplish in any language (English, Nepali, Romanized Nepali, Hindi, or mixed). It understands your goal and directs you to the exact tools in Kiran AI Video Studio that can help you. It never claims fake features or guarantees viral views.'
    },
    {
      q: 'What is Kiran AI Video Studio?',
      a: 'Kiran AI Video Studio is an independent web application created by developer and content creator Kiran Chaulagain. It provides free, browser-based creative tools to assist creators with video screenwriting, vertical short pacing, thumbnail planning, video editing, and YouTube SEO optimization.'
    },
    {
      q: 'Is this website completely free to use?',
      a: 'Yes. All active tools—including the Video Planner, Shorts Creator, Content Assistant, Thumbnail Concept Designer, and Video Editor—are free to access during this public version. There are no paywalls, hidden tiers, or subscriptions.'
    },
    {
      q: 'Do I need to create an account or provide a credit card?',
      a: 'No. You do not need to register, sign in, or enter any payment information. All project drafts and settings are stored locally on your own computer via your browser storage.'
    },
    {
      q: 'Does Kiran AI Video Studio guarantee views, viral reach, or YouTube monetization?',
      a: 'No. We believe in complete transparency: no tool can guarantee viral reach, algorithmic recommendations, or subscriber numbers. Algorithmic success depends on genuine viewer retention, storytelling quality, thumbnail appeal, and audience interest. Our tools provide structured planning and evidence-based SEO suggestions to help you produce better content.'
    },
    {
      q: 'How does the AI assistant generate scripts and metadata?',
      a: 'The studio uses Google Gemini API models hosted on a secure backend to analyze your video concept and generate organized text structures (such as scene breakdowns, script dialogue, and SEO keyword analyses). If server limits are reached, the studio smoothly switches to local programmatic templates so you can always continue working.'
    },
    {
      q: 'Who owns the scripts, screenplays, and metadata I create?',
      a: 'You retain 100% ownership of all creative concepts, scripts, and production plans you develop on Kiran AI Video Studio. You are free to use them for personal or commercial YouTube channels and video productions.'
    },
    {
      q: 'Where are my projects and saved drafts stored?',
      a: 'Your projects are saved in your web browser using HTML5 local storage. We do not store your drafts or personal data on remote tracking servers. If you clear your browser cache, your locally stored drafts will be reset.'
    },
    {
      q: 'How can I report a bug or suggest a feature?',
      a: 'You can contact Kiran Chaulagain directly by emailing kiranchaulagain094@gmail.com or by visiting our Contact Us page. We welcome feedback from the creator community!'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/15 to-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Studio Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Independent Creator Workspace • Free & Open Access</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">
          KIRAN AI VIDEO STUDIO
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-2xl font-bold mt-3 tracking-tight bg-gradient-to-r from-indigo-300 via-violet-200 to-cyan-300 bg-clip-text text-transparent">
          Screenplay Planning, Vertical Shorts & YouTube SEO
        </p>

        {/* Transparent Description */}
        <p className="max-w-2xl mx-auto mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
          A transparent creative suite built by Kiran Chaulagain. Structure multi-scene screenplays, 9:16 vertical hook sequences, thumbnail compositions, and evidence-based YouTube metadata—directly in your browser with zero required signup.
        </p>

        {/* Direct Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="hero-start-creating-btn"
            onClick={onStartCreating}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Launch Video Planner</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-shorts-btn"
            onClick={() => onSelectFeature('shorts-creator')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#131722] hover:bg-[#1a2030] text-slate-200 font-semibold text-sm border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Film className="w-4 h-4 text-indigo-400" />
            <span>Create 9:16 Shorts Plan</span>
          </button>

          <button
            id="hero-about-btn"
            onClick={() => onSelectFeature('about-us')}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm border border-white/5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>About The Studio</span>
          </button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">✓ 100% Free to Use</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">✓ No Sign-up Required</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">✓ Browser Local Storage</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">✓ Realistic SEO Scoring</span>
        </div>

        {/* AI Website Guide Callout Box */}
        <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-[#121622] border border-indigo-500/30 shadow-2xl text-left relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>New Feature: AI Website Guide</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Tell us what you want to create. Our AI will understand your goal and guide you to the right tools.
              </h3>
              <p className="text-xs text-slate-400">
                Supports all languages including Nepali (नेपाली), Romanized Nepali, Hindi (हिन्दी), and English.
              </p>
            </div>

            <button
              id="hero-open-ai-guide-btn"
              onClick={() => onSelectFeature('ai-guide')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Ask AI Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500 font-semibold">Try asking:</span>
            <button
              onClick={() => onSelectFeature('ai-guide')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-[11px] transition-colors"
            >
              "I want to make a YouTube video"
            </button>
            <button
              onClick={() => onSelectFeature('ai-guide')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-[11px] transition-colors"
            >
              "mero song ko lagi title ra description chahiyo"
            </button>
            <button
              onClick={() => onSelectFeature('ai-guide')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-[11px] transition-colors"
            >
              "I need a thumbnail idea"
            </button>
            <button
              onClick={() => onSelectFeature('ai-guide')}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-[11px] transition-colors"
            >
              "Help me with YouTube SEO"
            </button>
          </div>
        </div>
      </section>

      {/* Core Tools Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Functional Workspace</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            What Kiran AI Video Studio Actually Provides
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Each tool below is fully operational in your browser. Click any tool card to launch it directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onSelectFeature(feat.id)}
                className="group relative p-6 rounded-2xl bg-[#111520] hover:bg-[#161c2b] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-indigo-400/80 font-medium mb-2">
                    {feat.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 gap-1">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-12 bg-[#0c0f17] border-y border-white/5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Target Audience</span>
            <h3 className="text-2xl font-bold text-white mt-1">Who Is This Studio Designed For?</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Engineered to remove friction from scriptwriting, video structuring, and YouTube publishing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {userAudiences.map((aud, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#111520] border border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  0{i + 1}
                </div>
                <h4 className="text-sm font-bold text-white">{aud.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{aud.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Simple Process</span>
          <h3 className="text-2xl font-bold text-white mt-1">How to Use Kiran AI Video Studio</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Follow these five structured steps to take an initial idea from screenplay to published video.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {workflowSteps.map((step) => (
            <div key={step.step} className="p-4 rounded-xl bg-[#111520] border border-white/5 text-center flex flex-col justify-between">
              <div>
                <span className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {step.step}
                </span>
                <h4 className="text-xs font-bold text-white">{step.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learn & Create: Creator Guides Section (Substantial Publisher Content) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Publisher Knowledge Base • 100% Original Content</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Learn & Create: Featured Creator Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              युट्युब भिडियो निर्माण, उच्च-CTR शीर्षक, थम्बनेल मनोविज्ञान, ९:१६ सर्ट्स हुक, र एसईओ सम्बन्धी व्यावहारिक निर्देशिकाहरू।
            </p>
          </div>

          <button
            onClick={() => onSelectFeature('articles')}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all self-start md:self-auto cursor-pointer"
          >
            <span>Explore All 30 Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 15 Core Guides Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_15_CREATOR_GUIDES.slice(0, 9).map((guide) => (
            <div
              key={guide.id}
              onClick={() => {
                if (onSelectArticle) {
                  onSelectArticle(guide.slug);
                } else {
                  onSelectFeature('articles');
                }
              }}
              className="p-5 rounded-2xl bg-[#111520] hover:bg-[#161c2b] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between group cursor-pointer shadow-md"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/20">
                    Guide #{guide.topicNumber}
                  </span>
                  <span className="text-slate-500 text-[10px]">{guide.readTime}</span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                  {guide.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {guide.metaDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">{guide.category}</span>
                <span className="text-indigo-400 group-hover:translate-x-1 transition-transform font-semibold text-[11px] flex items-center gap-1">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => onSelectFeature('articles')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>View All 15 Core Guides & Knowledge Base</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* AdSense Safe Editorial Placement on Content-Rich Section */}
        <AdSenseSafeContainer route="landing" hasSubstantialContent={true} />
      </section>

      {/* Honest Limitations & Expectations Section (Crucial for AdSense) */}
      <section className="py-12 bg-[#0c0f17] border-y border-white/5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Honesty & Transparency</span>
            <h3 className="text-2xl font-bold text-white mt-1">What to Expect & Real AI Limitations</h3>
            <p className="text-xs text-slate-400 mt-1">
              We believe in setting clear, realistic expectations for every creator who uses our studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What the tools do */}
            <div className="p-5 rounded-2xl bg-[#111520] border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>What Kiran AI Video Studio Does</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Generates structured multi-scene video outlines with timestamps and camera angles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Writes 3-second hook scripts and rapid visual cues for vertical Shorts and Reels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Provides objective 0-100 SEO scoring for title clarity, search intent, and keyword coverage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Lets you arrange video and audio tracks directly in an in-browser timeline.</span>
                </li>
              </ul>
            </div>

            {/* What the tools do NOT do */}
            <div className="p-5 rounded-2xl bg-[#111520] border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>What These Tools Do Not Do</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>Do not guarantee viral views, algorithmic promotion, or YouTube monetization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>Do not automatically render completed Hollywood movie files from a one-line prompt.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>Do not replace human creative judgment, genuine video shooting, or audience connection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>Do not claim 100% perfection; all AI-generated text should be reviewed by the creator.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Questions & Answers</span>
          <h3 className="text-2xl font-bold text-white mt-1">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-400 mt-1">
            Honest answers to common questions about Kiran AI Video Studio.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl bg-[#111520] border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Creator & Contact Banner */}
      <section className="py-10 bg-[#0c0f17] border-t border-white/5 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-semibold">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Developer Support & Inquiries</span>
          </div>
          <h3 className="text-xl font-bold text-white">Have a Question or Feedback?</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kiran AI Video Studio is built and maintained by Kiran Chaulagain. If you have questions about our tools, privacy policies, or future updates, feel free to reach out directly.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:kiranchaulagain094@gmail.com"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>kiranchaulagain094@gmail.com</span>
            </a>
            <button
              onClick={() => onSelectFeature('contact-us')}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
            >
              Contact Form
            </button>
            <button
              onClick={() => onSelectFeature('about-us')}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
            >
              Read About Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onSelectFeature} currentRoute="landing" />
    </div>
  );
};
