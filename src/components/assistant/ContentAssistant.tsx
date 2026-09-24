import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Youtube, 
  Hash, 
  Tag, 
  FileText, 
  TrendingUp, 
  Wand2, 
  HelpCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Heart,
  Clapperboard,
  Briefcase,
  Zap,
  Calendar,
  Lightbulb,
  Video,
  Film,
  MessageSquare
} from 'lucide-react';
import { AIContentPack, SEOAnalysisResult } from '../../types';
import { StudioApiService } from '../../services/api';

interface ContentAssistantProps {
  initialPrompt?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialTab?: 'youtube' | 'writing' | 'power-suite' | 'seo';
  initialWritingTool?: string;
  initialPowerTool?: 'ideas' | 'calendar' | 'script' | 'prompt' | 'shorts-caption';
  initialLanguage?: string;
  initialTopic?: string;
}

interface TitleFormula {
  category: string;
  title: string;
  rationale: string;
}

export const ContentAssistant: React.FC<ContentAssistantProps> = ({ 
  initialPrompt,
  initialTitle,
  initialDescription,
  initialTab,
  initialWritingTool,
  initialPowerTool,
  initialLanguage,
  initialTopic
}) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'writing' | 'power-suite' | 'seo'>(
    initialTab || 'youtube'
  );

  // Inputs
  const [prompt, setPrompt] = useState(
    initialPrompt || initialTopic || initialTitle || 'AI version of a Nepali romantic song for my YouTube channel.'
  );
  const [videoType, setVideoType] = useState('Music Video');
  const [targetAudience, setTargetAudience] = useState('Nepali Music Lovers, Creators & Global Audiences');
  const [language, setLanguage] = useState(initialLanguage || 'Nepali');
  const [mainKeyword, setMainKeyword] = useState('Nepali romantic song 2026');

  // Writing Tools State
  const [writingInput, setWritingInput] = useState(
    initialTopic || 'In this video, I will show you the best romantic places in Kathmandu during monsoon and why they make you feel so peaceful.'
  );
  const [writingOutput, setWritingOutput] = useState(
    'When the monsoon rain touches the ancient terracotta of Kathmandu, time slows down. In this cinematic exploration, discover the hidden sanctuaries of the valley where love and stillness meet.'
  );
  const [activeWritingTool, setActiveWritingTool] = useState<string>(
    initialWritingTool || 'Rewrite'
  );
  const [isProcessingWriting, setIsProcessingWriting] = useState(false);
  const [writingError, setWritingError] = useState<string | null>(null);

  // Power Suite State (Individual generators)
  const [powerToolType, setPowerToolType] = useState<'ideas' | 'calendar' | 'script' | 'prompt' | 'shorts-caption'>(
    initialPowerTool || 'ideas'
  );
  const [powerTopic, setPowerTopic] = useState(
    initialTopic || initialPrompt || 'Cinematic Travel Vlog through Pokhara and Annapurna'
  );
  const [isGeneratingPower, setIsGeneratingPower] = useState(false);
  const [powerResult, setPowerResult] = useState<any>(null);
  const [powerError, setPowerError] = useState<string | null>(null);

  // Sync props when navigated from an educational article
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (initialWritingTool) setActiveWritingTool(initialWritingTool);
    if (initialPowerTool) setPowerToolType(initialPowerTool);
    if (initialLanguage) setLanguage(initialLanguage);
    if (initialTopic) {
      setPrompt(initialTopic);
      setWritingInput(initialTopic);
      setPowerTopic(initialTopic);
    }
  }, [initialTab, initialWritingTool, initialPowerTool, initialLanguage, initialTopic]);

  // Loading & Content states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 10 categorized title ideas as required by item 7
  const [titleFormulas, setTitleFormulas] = useState<TitleFormula[]>([
    { category: 'Search-Focused', title: 'Nepali Romantic Song 2026: Rain in Kathmandu (Official 4K)', rationale: 'Targeting exact high-volume query keywords' },
    { category: 'Curiosity-Driven', title: 'The Kathmandu Monsoon Story Nobody Expected To See...', rationale: 'Creates an irresistible psychological gap' },
    { category: 'Emotional', title: 'When Rain Falls in Patan, Every Broken Heart Remembers', rationale: 'Resonates deeply with nostalgic sentiment' },
    { category: 'Listicle', title: '3 Reasons This Romantic Melody Will Haunt You Forever', rationale: 'Structured curiosity format with high click appeal' },
    { category: 'High-CTR', title: 'THIS Is Why Everyone Is Listening To This Song in 2026', rationale: 'Urgent social proof trigger' },
    { category: 'Question', title: 'Can You Hear The Rain in Ancient Patan Without Crying?', rationale: 'Direct conversational provocation' },
    { category: 'Story-Driven', title: 'How Two Strangers Found Solace Under a Pagoda in the Storm', rationale: 'Cinematic narrative arc' },
    { category: 'How-To / Guide', title: 'How We Composed A Cinematic Nepali Masterpiece Using AI', rationale: 'Educational authority hook' },
    { category: 'Direct & Clean', title: 'Rain of Love - Kathmandu Monsoon Acoustic Session', rationale: 'Minimalist brand authority' },
    { category: 'Trend-Focused', title: 'The New Sound of Kathmandu: 2026 Folk-Pop Revolution', rationale: 'Captures rising cultural waves' },
  ]);

  const [contentPack, setContentPack] = useState<AIContentPack | null>({
    youtubeTitle: 'मायाको झरी (Rain of Love) - Official 4K Music Video | Kiran AI Video Studio',
    alternativeTitles: [
      'The Kathmandu Monsoon Story Nobody Expected To See...',
      'When Rain Falls in Patan, Every Broken Heart Remembers',
      'THIS Is Why Everyone Is Listening To This Song in 2026',
      'Nepali Romantic Song 2026: Rain in Kathmandu (Official 4K)'
    ],
    youtubeDescription: `Experience "मायाको झरी (Rain of Love)", an evocative cinematic acoustic exploration set in the monsoon heart of Kathmandu.\n\n🎵 Produced & Directed using Kiran AI Video Studio\n🎧 High-Fidelity Spatial Audio Master\n\n📌 Timestamps:\n0:00 - Monsoon Overture & Patan Square\n0:30 - Verse 1: Raindrops & Solitude\n1:15 - Chorus: The Encounter\n2:00 - Bridge: Twilight Over Kathmandu\n2:45 - Outro & Credits\n\n© 2026 Kiran AI Video Studio. All rights reserved.`,
    hashtags: ['#NepaliMusicVideo', '#RainOfLove', '#KathmanduVibes', '#KiranAIVideoStudio', '#NewNepaliSong2026', '#NepaliRomanticSong'],
    youtubeTags: ['nepali romantic song', 'mayako jhari', 'kiran ai video studio', 'kathmandu monsoon', 'nepali acoustic song 2026', 'nepali music video official'],
    keywords: ['nepali romantic song 2026', 'rain in kathmandu', 'patan durbar square song', 'nepali acoustic folk pop', 'kiran ai studio'],
    thumbnailText: 'RAIN OF LOVE 🌧️',
    hook: 'Have you ever felt the silence of Kathmandu right before the monsoon breaks?',
    cta: 'Subscribe to Kiran AI Video Studio for more cinematic audiovisual experiences!',
    disclaimer: 'This artistic audio-visual concept was scripted and envisioned using Kiran AI Video Studio.',
    shortsCaption: 'The monsoon hits different when you are in Kathmandu... 🌧️ Tag someone you miss!',
    tiktokCaption: 'Monsoon in Kathmandu + acoustic guitar = pure magic ✨ #nepalitiktok #kathmandu',
    facebookCaption: 'Listen to the official audio-visual release of "मायाको झरी". Watch in 4K on YouTube now.',
    pinnedComment: 'Which scene in Patan gave you goosebumps? Let us know in the comments below! 👇',
    communityPost: 'Our brand new monsoon acoustic journey "मायाको झरी" is officially live! Watch the full 4K cut on the channel now.',
    seoAnalysis: {
      score: 92,
      keywordRelevance: { score: 94, explanation: 'Primary keyword is placed in the first 40 characters of title and description.' },
      searchIntent: { score: 90, explanation: 'Matches query intent for music listeners seeking new releases.' },
      titleClarity: { score: 95, explanation: 'High legibility and clear emotional framing under 70 characters.' },
      descriptionQuality: { score: 91, explanation: 'Contains structured chapters, credit lines, and relevant metadata.' },
      keywordCoverage: { score: 88, explanation: 'Strong mix of head terms and long-tail regional phrases.' },
      readability: { score: 93, explanation: 'Clean visual formatting with bullet points and clear line breaks.' },
      audienceRelevance: { score: 93, explanation: 'Directly tailored to Nepali music and cinema enthusiasts.' },
      overallAssessment: 'Excellent metadata optimization. High probability of search discovery and related video recommendations.'
    }
  });

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const pack = await StudioApiService.generateContentAssistant({
        prompt,
        videoType,
        targetAudience,
        language,
        mainKeyword
      });

      setContentPack(pack);

      if (pack.titleFormulas && Array.isArray(pack.titleFormulas) && pack.titleFormulas.length > 0) {
        setTitleFormulas(pack.titleFormulas);
      } else {
        setTitleFormulas([
          { category: 'Search-Focused', title: `${pack.youtubeTitle.slice(0, 60)} (Official)`, rationale: 'Exact search intent' },
          { category: 'Curiosity-Driven', title: `The Truth About ${mainKeyword || 'This Secret'} Will Shock You...`, rationale: 'Curiosity gap' },
          { category: 'Emotional', title: `Why ${prompt.slice(0, 45)} Changed Everything For Us`, rationale: 'Heartfelt emotional framing' },
          { category: 'Listicle', title: `3 Urgent Things You Must Know About ${mainKeyword || 'This'}`, rationale: 'Numbered list appeal' },
          { category: 'High-CTR', title: `Do NOT Ignore This: ${pack.youtubeTitle.slice(0, 45)}`, rationale: 'Urgent scroll-stopper' },
          { category: 'Question', title: `Is This The Best Video on ${mainKeyword || 'This Topic'} in 2026?`, rationale: 'Engaging audience question' },
          { category: 'Story-Driven', title: `From Scratch To Masterpiece: The Untold Journey`, rationale: 'Hero journey narrative' },
          { category: 'How-To / Guide', title: `How To Master ${mainKeyword || 'Video Creation'} Step-by-Step`, rationale: 'Clear tutorial promise' },
          { category: 'Direct & Clean', title: `${pack.youtubeTitle.split('|')[0].trim()}`, rationale: 'Authoritative simplicity' },
          { category: 'Trend-Focused', title: `The 2026 Breakthrough In ${mainKeyword || 'Video Content'}`, rationale: 'Trend capitalizing' },
        ]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate content pack. Please verify your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Real 10 AI Writing Tools Handler using Gemini Serverless Endpoint
  const handleWritingTool = async (tool: string) => {
    if (!writingInput.trim() || isProcessingWriting) return;
    setActiveWritingTool(tool);
    setIsProcessingWriting(true);
    setWritingError(null);

    try {
      const res = await StudioApiService.transformWriting({
        text: writingInput,
        tool,
        language
      });
      if (res && res.result) {
        setWritingOutput(res.result);
      }
    } catch (err: any) {
      setWritingError(err?.message || `Failed to execute ${tool}. Please try again.`);
    } finally {
      setIsProcessingWriting(false);
    }
  };

  // Creator Power Suite Generator
  const handleGeneratePowerTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!powerTopic.trim() || isGeneratingPower) return;

    setIsGeneratingPower(true);
    setPowerError(null);

    try {
      const res = await StudioApiService.generateContentSuite({
        toolType: powerToolType,
        topic: powerTopic
      });
      setPowerResult(res.data);
    } catch (err: any) {
      setPowerError(err?.message || 'Failed to generate power tool assets.');
    } finally {
      setIsGeneratingPower(false);
    }
  };

  const writingToolsList = [
    { id: 'Rewrite', label: 'Rewrite', icon: Wand2, desc: 'Fresh engaging perspective' },
    { id: 'Improve Hook', label: 'Improve Hook', icon: Zap, desc: 'Stop scroll in 3 seconds' },
    { id: 'More Emotional', label: 'More Emotional', icon: Heart, desc: 'Heartfelt nostalgic tone' },
    { id: 'More Cinematic', label: 'More Cinematic', icon: Clapperboard, desc: 'Visual camera & foley cues' },
    { id: 'More Professional', label: 'More Professional', icon: Briefcase, desc: 'Clear executive phrasing' },
    { id: 'Shorten', label: 'Shorten', icon: Minimize2, desc: 'High-impact concise cut' },
    { id: 'Expand', label: 'Expand', icon: Maximize2, desc: 'Contextual storytelling depth' },
    { id: 'Translate (Nepali)', label: 'Translate (Nepali)', icon: Sparkles, desc: 'Fluent authentic Nepali' },
    { id: 'Grammar Fix', label: 'Grammar Fix', icon: CheckCircle2, desc: 'Polish syntax and phrasing' },
    { id: 'Better CTA', label: 'Better CTA', icon: ArrowRight, desc: 'Magnetic subscription trigger' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Content & SEO Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Content, Metadata & SEO Assistant
          </h1>
          <p className="text-sm text-slate-400">
            All-in-one suite: 10 Tested Title Formulas, YouTube Description with Timestamps, 10 Writing Tools, and 7-Metric SEO Audit.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#121622] p-1.5 rounded-2xl border border-white/10 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'youtube'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4" />
            <span>YouTube Metadata</span>
          </button>

          <button
            onClick={() => setActiveTab('writing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'writing'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>10 Writing Tools</span>
          </button>

          <button
            onClick={() => setActiveTab('power-suite')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'power-suite'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Creator Power Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'seo'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>SEO Scorecard</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 font-bold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. 10 AI Writing Tools View */}
      {activeTab === 'writing' ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    10 Dedicated AI Creative Writing Actions
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Genuinely powered by server-side Gemini: rewrite, sharpen hooks, translate to Nepali, or amplify cinematic emotion.
                  </p>
                </div>
              </div>
            </div>

            {/* Tool Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {writingToolsList.map((tool) => {
                const IconComponent = tool.icon;
                const isActive = activeWritingTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleWritingTool(tool.id)}
                    disabled={isProcessingWriting}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-[#171c2b] border-white/5 text-slate-300 hover:border-indigo-500/30 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold truncate">{tool.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{tool.desc}</p>
                  </button>
                );
              })}
            </div>

            {writingError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{writingError}</span>
              </div>
            )}

            {/* Input & Output Split Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Input Text / Script Excerpt
                  </label>
                  <button
                    onClick={() => setWritingInput('काठमाडौँको चिसो झरीमा पुरानो गल्लीहरूमा हिँड्दै तिम्रो याद आउँछ।')}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Use Nepali Sample
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={writingInput}
                  onChange={(e) => setWritingInput(e.target.value)}
                  placeholder="Paste your video dialogue, voiceover, hook, or outline here..."
                  className="w-full bg-[#171c2b] text-white text-xs rounded-2xl p-4 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>Transformed Output:</span>
                    <span className="text-indigo-400 font-mono">[{activeWritingTool}]</span>
                  </label>
                  <button
                    onClick={() => copyToClipboard(writingOutput, 'writingOutput')}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    {copiedField === 'writingOutput' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'writingOutput' ? 'Copied' : 'Copy Result'}</span>
                  </button>
                </div>
                <div className="relative min-h-[144px] bg-[#0d1017] rounded-2xl p-4 border border-white/10 text-xs text-slate-200 leading-relaxed font-sans overflow-y-auto max-h-[180px]">
                  {isProcessingWriting ? (
                    <div className="flex items-center justify-center h-28 text-slate-400 gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                      <span>Refining text with Gemini AI ({activeWritingTool})...</span>
                    </div>
                  ) : (
                    writingOutput
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'power-suite' ? (
        /* 2. Creator AI Power Suite (Individual Generators) */
        <div className="space-y-6">
          <form onSubmit={handleGeneratePowerTool} className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Creator AI Power Suite
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Standalone generators for Video Ideas, Content Calendars, Full Spoken Scripts, Visual Prompts, and Shorts Captions.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'ideas', label: 'Video Ideas', icon: Lightbulb },
                { id: 'calendar', label: 'Content Calendar', icon: Calendar },
                { id: 'script', label: 'Spoken Script', icon: FileText },
                { id: 'prompt', label: 'Visual Prompts', icon: Clapperboard },
                { id: 'shorts-caption', label: 'Shorts Captions', icon: Film },
              ].map((pt) => {
                const IconComponent = pt.icon;
                const isSelected = powerToolType === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => {
                      setPowerToolType(pt.id as any);
                      setPowerResult(null);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-600/30 border-amber-500 text-white font-bold shadow-lg shadow-amber-600/20'
                        : 'bg-[#171c2b] border-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span className="text-xs">{pt.label}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Topic or Channel Niche
              </label>
              <input
                type="text"
                value={powerTopic}
                onChange={(e) => setPowerTopic(e.target.value)}
                placeholder="e.g. Budget travel in Nepal, AI coding tutorials, Traditional cooking..."
                className="w-full bg-[#171c2b] text-white text-xs rounded-xl p-3.5 border border-white/10 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isGeneratingPower}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingPower ? 'Generating with Gemini AI...' : `Generate ${powerToolType.toUpperCase()}`}</span>
            </button>
          </form>

          {powerError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{powerError}</span>
            </div>
          )}

          {/* Result Display */}
          {powerResult && (
            <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Generated {powerToolType.toUpperCase()} Results
                </span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(powerResult, null, 2), 'power-json')}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  {copiedField === 'power-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'power-json' ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>

              {powerResult.ideas && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {powerResult.ideas.map((idea: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 font-mono">Idea #{idx + 1}</span>
                        <button
                          onClick={() => copyToClipboard(idea.title, `idea-${idx}`)}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedField === `idea-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{idea.title}</h4>
                      <p className="text-[11px] text-slate-300 italic bg-black/20 p-2 rounded-lg">"{idea.hook}"</p>
                      <p className="text-[10px] text-slate-400">Retention: {idea.retentionStrategy}</p>
                    </div>
                  ))}
                </div>
              )}

              {powerResult.calendar && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {powerResult.calendar.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                          Week {item.week}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.publishDate}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-indigo-300 font-semibold">{item.videoType}</p>
                      <p className="text-[10px] text-slate-400">{item.productionMilestone}</p>
                    </div>
                  ))}
                </div>
              )}

              {powerResult.bodyPoints && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Hook & Intro</span>
                    <h4 className="text-sm font-bold text-white">{powerResult.title}</h4>
                    <p className="text-xs text-amber-200 bg-black/30 p-3 rounded-xl border border-white/5 font-mono leading-relaxed">
                      {powerResult.hook}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{powerResult.introduction}</p>
                  </div>

                  <div className="space-y-3">
                    {powerResult.bodyPoints.map((pt: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">Section {idx + 1}: {pt.heading}</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{pt.spokenText}</p>
                        <p className="text-[10px] text-slate-500 italic">Visual Cue: {pt.visualCue}</p>
                      </div>
                    ))}
                  </div>

                  {powerResult.callToAction && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <strong>CTA:</strong> {powerResult.callToAction}
                    </div>
                  )}
                </div>
              )}

              {powerResult.prompts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {powerResult.prompts.map((p: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 font-mono">{p.scene}</span>
                        <button
                          onClick={() => copyToClipboard(p.prompt, `prompt-${idx}`)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          {copiedField === `prompt-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-mono bg-black/30 p-3 rounded-xl border border-white/5 leading-relaxed">
                        {p.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {powerResult.captions && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {powerResult.captions.map((c: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-cyan-400">{c.platform}</span>
                        <button
                          onClick={() => copyToClipboard(c.text, `cap-${idx}`)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          {copiedField === `cap-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'seo' ? (
        /* 3. SEO Scorecard View */
        contentPack && (
          <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Comprehensive 7-Metric SEO Score
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Readiness Assessment: {contentPack.seoAnalysis.score} / 100
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {contentPack.seoAnalysis.overallAssessment}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#171c2b] px-4 py-2.5 rounded-2xl border border-white/5">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="text-xs font-bold text-emerald-400">Production Ready</span>
                </div>
              </div>
            </div>

            {/* 7 Metric Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Keyword Relevance', data: contentPack.seoAnalysis.keywordRelevance },
                { label: 'Search Intent Match', data: contentPack.seoAnalysis.searchIntent },
                { label: 'Title Clarity & CTR', data: contentPack.seoAnalysis.titleClarity },
                { label: 'Description Depth', data: contentPack.seoAnalysis.descriptionQuality },
                { label: 'Keyword Coverage', data: contentPack.seoAnalysis.keywordCoverage },
                { label: 'Readability & Pacing', data: contentPack.seoAnalysis.readability },
                { label: 'Audience Relevance', data: contentPack.seoAnalysis.audienceRelevance },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.label}</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {item.data.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-[#0d1017] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${item.data.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.data.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        /* 4. YouTube Suite View */
        <div className="space-y-6">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-2xl space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Video Topic or Concept
                </label>
                <button
                  type="button"
                  onClick={() => setPrompt('AI version of a Nepali romantic song for my YouTube channel.')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Use Nepali romantic sample
                </button>
              </div>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video or song concept in detail..."
                className="w-full bg-[#171c2b] text-white text-sm rounded-xl p-4 border border-white/10 focus:border-cyan-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Video Type
                </label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Music Video">Music Video</option>
                  <option value="YouTube Video">YouTube Longform</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="Tutorial">Tutorial / Explainer</option>
                  <option value="Documentary">Documentary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Nepali">Nepali (नेपाली)</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Main Keyword
                </label>
                <input
                  type="text"
                  value={mainKeyword}
                  onChange={(e) => setMainKeyword(e.target.value)}
                  placeholder="e.g. Nepali romantic song 2026"
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Nepali youth, creators"
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing 10 Title Archetypes & SEO Suite...' : 'Generate Full SEO Metadata Pack'}</span>
            </button>
          </form>

          {/* 10 Title Archetypes */}
          <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  10 Tested Title Formulas (Search, Curiosity, Emotional, High-CTR)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">10 Variations</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {titleFormulas.map((tf, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#171c2b] border border-white/5 flex items-start justify-between gap-3 hover:border-indigo-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {tf.category}
                    </span>
                    <p className="text-xs font-bold text-white leading-snug">
                      {tf.title}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {tf.rationale}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(tf.title, `title-${idx}`)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0 mt-0.5"
                    title="Copy Title"
                  >
                    {copiedField === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description, Tags, Pinned Comment */}
          {contentPack && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Complete YouTube Description (Timestamps & Credits)
                    </span>
                    <button
                      onClick={() => copyToClipboard(contentPack.youtubeDescription, 'desc')}
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      {copiedField === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'desc' ? 'Copied' : 'Copy Description'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0f121a] text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto border border-white/5">
                    {contentPack.youtubeDescription}
                  </pre>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        📌 Pinned Comment
                      </span>
                      <button
                        onClick={() => copyToClipboard(contentPack.pinnedComment || '', 'pinned')}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        {copiedField === 'pinned' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 bg-[#171c2b] p-3 rounded-xl border border-white/5 leading-relaxed">
                      {contentPack.pinnedComment}
                    </p>
                  </div>

                  <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        📢 Community Tab Post
                      </span>
                      <button
                        onClick={() => copyToClipboard(contentPack.communityPost || '', 'comm')}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        {copiedField === 'comm' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 bg-[#171c2b] p-3 rounded-xl border border-white/5 leading-relaxed">
                      {contentPack.communityPost}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/30 to-[#121622] border border-indigo-500/30 text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    High-CTR Thumbnail Text
                  </span>
                  <div className="py-3 px-4 rounded-2xl bg-amber-400 text-black font-black text-xl tracking-tight shadow-xl">
                    {contentPack.thumbnailText}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Hashtags
                    </span>
                    <button
                      onClick={() => {
                        const hStr = Array.isArray(contentPack.hashtags) ? contentPack.hashtags.join(' ') : contentPack.hashtags;
                        copyToClipboard(hStr, 'hashtags');
                      }}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {contentPack.hashtags.map((h, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-lg bg-[#171c2b] text-cyan-400 font-mono border border-white/5">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Comma-Separated Tags
                    </span>
                    <button
                      onClick={() => copyToClipboard(contentPack.youtubeTags.join(', '), 'tags')}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Copy All
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-[#0f121a] p-3 rounded-xl border border-white/5 leading-relaxed">
                    {contentPack.youtubeTags.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
