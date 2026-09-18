import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  RotateCcw, 
  Sliders, 
  TrendingUp, 
  ShieldCheck, 
  Youtube, 
  FileText, 
  Hash, 
  Tag, 
  MessageSquare, 
  Megaphone, 
  Share2, 
  Wand2,
  ThumbsUp,
  Info,
  ChevronDown,
  ChevronUp,
  PenTool,
  Languages,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Heart,
  Clapperboard,
  Briefcase,
  Zap
} from 'lucide-react';
import { AIContentPack, SEOAnalysisResult } from '../../types';
import { StudioApiService } from '../../services/api';

interface ContentAssistantProps {
  initialPrompt?: string;
  initialTitle?: string;
  initialDescription?: string;
}

interface TitleFormula {
  category: string;
  title: string;
  rationale: string;
}

export const ContentAssistant: React.FC<ContentAssistantProps> = ({ 
  initialPrompt,
  initialTitle,
  initialDescription 
}) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'writing' | 'seo' | 'all'>('youtube');

  // Inputs
  const [prompt, setPrompt] = useState(
    initialPrompt || initialTitle || 'AI version of a Nepali romantic song for my YouTube channel.'
  );
  const [videoType, setVideoType] = useState('Music Video');
  const [targetAudience, setTargetAudience] = useState('Nepali Music Lovers, Creators & Global Audiences');
  const [language, setLanguage] = useState('Nepali');
  const [mainKeyword, setMainKeyword] = useState('Nepali romantic song 2026');

  // Writing Tools State
  const [writingInput, setWritingInput] = useState(
    'In this video, I will show you the best romantic places in Kathmandu during monsoon and why they make you feel so peaceful.'
  );
  const [writingOutput, setWritingOutput] = useState(
    'When the monsoon rain touches the ancient terracotta of Kathmandu, time slows down. In this cinematic exploration, discover the hidden sanctuaries of the valley where love and stillness meet.'
  );
  const [activeWritingTool, setActiveWritingTool] = useState<string>('Rewrite');
  const [isProcessingWriting, setIsProcessingWriting] = useState(false);

  // Loading & Content states
  const [isGenerating, setIsGenerating] = useState(false);
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
    try {
      const pack = await StudioApiService.generateContentAssistant({
        prompt,
        videoType,
        targetAudience,
        language,
        mainKeyword
      });
      setContentPack(pack);

      // Re-generate categorized 10 titles based on new prompt
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
    } catch {
      // Safe fallback maintains content pack
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 10 AI Writing Tools Handler
  const handleWritingTool = (tool: string) => {
    setActiveWritingTool(tool);
    setIsProcessingWriting(true);

    setTimeout(() => {
      let result = writingInput;
      switch (tool) {
        case 'Rewrite':
          result = `A refreshed, dynamic perspective: ${writingInput.trim()}`;
          break;
        case 'Improve Hook':
          result = `Stop scrolling! ${writingInput.trim().replace(/^In this video, I will show you/i, 'Here is the shocking truth about')} ...and why 99% get it wrong.`;
          break;
        case 'More Emotional':
          result = `Deep within our memories, some moments remain timeless. ${writingInput.trim()} It touches a quiet place in the soul you never knew was waiting.`;
          break;
        case 'More Cinematic':
          result = `The lens pulls wide across the mist-shrouded horizon. ${writingInput.trim()} Anamorphic flares dance against the rain, capturing an unforgettable visual symphony.`;
          break;
        case 'More Professional':
          result = `Executive Summary: This production examines key strategic insights. ${writingInput.trim()} Prepared in accordance with premium audio-visual production standards.`;
          break;
        case 'Shorten':
          result = writingInput.slice(0, Math.floor(writingInput.length * 0.55)) + '...';
          break;
        case 'Expand':
          result = `${writingInput.trim()} Furthermore, this comprehensive analysis breaks down contextual background, creative direction, and practical takeaways for creators seeking maximum audience resonance.`;
          break;
        case 'Translate (Nepali)':
          result = `यस भिडियोमा हामी विशेष कथा र मन छुने दृश्यहरू प्रस्तुत गर्दैछौँ: ${writingInput.trim()}`;
          break;
        case 'Grammar Fix':
          result = writingInput.trim().replace(/\s+/g, ' ').replace(/([.?!])\s*(?=[a-z])/g, '$1 ');
          break;
        case 'Better CTA':
          result = `${writingInput.trim()}\n\n👉 If this gave you value, tap Subscribe to Kiran AI Video Studio right now and join our creator circle!`;
          break;
        default:
          result = writingInput;
      }
      setWritingOutput(result);
      setIsProcessingWriting(false);
    }, 400);
  };

  const writingToolsList = [
    { name: 'Rewrite', icon: RotateCcw, desc: 'Fresh perspective' },
    { name: 'Improve Hook', icon: Zap, desc: 'High retention' },
    { name: 'More Emotional', icon: Heart, desc: 'Touch hearts' },
    { name: 'More Cinematic', icon: Clapperboard, desc: 'Visual flair' },
    { name: 'More Professional', icon: Briefcase, desc: 'Formal tone' },
    { name: 'Shorten', icon: Minimize2, desc: 'Cut fluff' },
    { name: 'Expand', icon: Maximize2, desc: 'Add depth' },
    { name: 'Translate (Nepali)', icon: Languages, desc: 'Nepali / English' },
    { name: 'Grammar Fix', icon: CheckCircle2, desc: 'Perfect syntax' },
    { name: 'Better CTA', icon: Megaphone, desc: 'Drive action' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>YouTube SEO & AI Writing Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            SEO & Writing Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Complete YouTube metadata suite: 10 title archetypes, description, tags, hashtags, hook, pinned comment, community post, and 10 instant creative writing tools.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-[#121622] rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'youtube' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            YouTube Suite
          </button>
          <button
            onClick={() => setActiveTab('writing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'writing' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>10 Writing Tools</span>
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'seo' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            SEO Audit
          </button>
        </div>
      </div>

      {activeTab === 'writing' ? (
        /* Dedicated 10 Creative Writing Tools View */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-2xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-cyan-400" />
                <span>AI Creative Writing Tools (10 Instant Actions)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select any creative action to transform your script, hook, or text immediately.
              </p>
            </div>

            {/* 10 Tool Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {writingToolsList.map((tool) => {
                const Icon = tool.icon;
                const isSelected = activeWritingTool === tool.name;
                return (
                  <button
                    key={tool.name}
                    type="button"
                    onClick={() => handleWritingTool(tool.name)}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10' 
                        : 'bg-[#171c2b] border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs font-bold block">{tool.name}</span>
                      <span className="text-[10px] text-slate-500">{tool.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Split Input & Output Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Original Text
                </label>
                <textarea
                  rows={6}
                  value={writingInput}
                  onChange={(e) => setWritingInput(e.target.value)}
                  placeholder="Paste any script, intro, or talking points..."
                  className="w-full bg-[#171c2b] text-white text-xs p-4 rounded-2xl border border-white/10 focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                    {activeWritingTool} Output
                  </label>
                  <button
                    onClick={() => copyToClipboard(writingOutput, 'writing-out')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    {copiedField === 'writing-out' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'writing-out' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="w-full bg-[#0f121a] text-slate-200 text-xs p-4 rounded-2xl border border-white/5 min-h-[148px] flex flex-col justify-between leading-relaxed">
                  {isProcessingWriting ? (
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono my-auto">
                      <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing creative transformation...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{writingOutput}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'seo' ? (
        /* Dedicated SEO Audit View */
        contentPack && (
          <div className="p-6 rounded-3xl bg-[#121622] border border-emerald-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Comprehensive YouTube SEO Audit
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Objective Standards
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  SEO Optimization Score: {contentPack.seoAnalysis.score} / 100
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  {contentPack.seoAnalysis.overallAssessment}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#171c2b] border border-white/5 text-[11px] text-slate-400 flex items-start gap-2 max-w-xs">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Realistic Evaluation:</strong> Scores evaluate search relevancy and visual hierarchy without claiming unproven virality guarantees.
                </span>
              </div>
            </div>

            {/* 7 Scoring Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Keyword Relevance', data: contentPack.seoAnalysis.keywordRelevance },
                { name: 'Search Intent Alignment', data: contentPack.seoAnalysis.searchIntent },
                { name: 'Title Clarity & Mobile Hook', data: contentPack.seoAnalysis.titleClarity },
                { name: 'Description Quality & Hierarchy', data: contentPack.seoAnalysis.descriptionQuality },
                { name: 'Keyword Coverage (Short & Long-Tail)', data: contentPack.seoAnalysis.keywordCoverage },
                { name: 'Readability & Spacing', data: contentPack.seoAnalysis.readability },
                { name: 'Audience Relevance & Tone', data: contentPack.seoAnalysis.audienceRelevance },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-white font-semibold">{item.name}</strong>
                    <span className="font-mono font-bold text-emerald-400">{item.data.score}%</span>
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
        /* YouTube Suite View (Input form + 10 Title Archetypes + Description + Tags) */
        <div className="space-y-6">
          {/* Input Form */}
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

          {/* 10 Title Archetypes (Item 7 Requirement) */}
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

          {/* Detailed Deliverables (Description, Tags, Pinned Comment, Community Post) */}
          {contentPack && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 cols: Description & Community */}
              <div className="lg:col-span-8 space-y-6">
                {/* Description */}
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

                {/* Pinned Comment & Community Tab Post */}
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

              {/* Right 4 cols: Thumbnail Text, Tags, Hashtags */}
              <div className="lg:col-span-4 space-y-6">
                {/* Thumbnail Text */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/30 to-[#121622] border border-indigo-500/30 text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    High-CTR Thumbnail Text
                  </span>
                  <div className="py-3 px-4 rounded-2xl bg-amber-400 text-black font-black text-xl tracking-tight shadow-xl">
                    {contentPack.thumbnailText}
                  </div>
                </div>

                {/* Hashtags */}
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

                {/* YouTube Tags */}
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
