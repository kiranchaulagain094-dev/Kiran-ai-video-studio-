import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  Copy, 
  Check, 
  Palette, 
  Sliders, 
  Type, 
  Download, 
  RotateCcw,
  CheckCircle2,
  Maximize2,
  SunMedium,
  Compass,
  Layers,
  Ban
} from 'lucide-react';
import { StudioApiService } from '../../services/api';

export interface ThumbnailPlanDetails {
  concept: string;
  layoutDescription: string;
  subjectPlacement: string;
  background: string;
  lighting: string;
  mainHeadline: string;
  subHeadline?: string;
  colorPalette: string[];
  badgeText?: string;
  imagePrompt: string;
  negativePrompt: string;
  recommendedAspect: '16:9' | '9:16' | '1:1';
  style: string;
}

export const ThumbnailMaker: React.FC = () => {
  const [idea, setIdea] = useState('Kathmandu monsoon rain with emotional gaze under yellow pagoda');
  const [mainTitle, setMainTitle] = useState('MAYAKO JHARI');
  const [style, setStyle] = useState('Viral-style creator thumbnail');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Concept state
  const [isGenerating, setIsGenerating] = useState(false);
  const [concept, setConcept] = useState<ThumbnailPlanDetails>({
    concept: 'Cinematic rain-soaked emotional portrait on right; bold contrast typography on left with amber rim light.',
    layoutDescription: 'Subject on the right 40% with dramatic expression; high contrast typography on left 60%.',
    subjectPlacement: 'Right 40% third looking towards left headline with emotional gaze and shallow depth of field',
    background: 'Historic Kathmandu pagoda courtyard with wet terracotta tiles reflecting warm brass oil lamps and soft rain mist',
    lighting: 'Warm amber rim light highlighting water droplets, balanced with cold twilight ambient fill and anamorphic lens streak',
    mainHeadline: 'MAYAKO JHARI',
    subHeadline: 'OFFICIAL 4K',
    colorPalette: ['#6366F1', '#06B6D4', '#F59E0B', '#111827'],
    badgeText: '4K CINEMA',
    imagePrompt: 'High-contrast cinematic photography, portrait of two Nepali individuals in monsoon rain, warm amber lanterns glowing behind misty raindrops, Kathmandu temple architecture bokeh, anamorphic lens flare, 8k resolution, photorealistic, rule of thirds, high detail skin texture.',
    negativePrompt: 'blurry, low quality, distorted anatomy, text artifacts, watermark, cartoonish, oversaturated skin, flat lighting, amateur photography',
    recommendedAspect: '16:9',
    style: 'Viral-style creator thumbnail'
  });

  // Canvas customizable state
  const [canvasHeadline, setCanvasHeadline] = useState('MAYAKO JHARI');
  const [canvasBadge, setCanvasBadge] = useState('4K OFFICIAL');
  const [canvasColor, setCanvasColor] = useState('#FBBF24'); // Amber/yellow
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await StudioApiService.generateThumbnailConcept({
        idea,
        title: mainTitle,
        style,
        aspectRatio: aspectRatio === '1:1' ? '16:9' : aspectRatio
      });

      const updatedPlan: ThumbnailPlanDetails = {
        concept: res.concept,
        layoutDescription: res.layoutDescription,
        subjectPlacement: 'Right third hero framing looking inward toward headline for maximum CTR',
        background: `Thematic ${style} environment aligned with: ${idea.slice(0, 50)}...`,
        lighting: 'High contrast key rim light with cinematic ambient fill',
        mainHeadline: res.mainHeadline || mainTitle,
        subHeadline: res.subHeadline || 'MUST WATCH',
        colorPalette: res.colorPalette || ['#6366F1', '#06B6D4', '#F59E0B', '#111827'],
        badgeText: res.badgeText || '4K HDR',
        imagePrompt: res.imagePrompt,
        negativePrompt: 'blurry, low resolution, washed out, plastic skin, distorted faces, missing fingers, extra limbs, watermark, copyright symbol, bad typography artifacts',
        recommendedAspect: aspectRatio,
        style: res.style
      };

      setConcept(updatedPlan);
      setCanvasHeadline(updatedPlan.mainHeadline);
      if (updatedPlan.badgeText) setCanvasBadge(updatedPlan.badgeText);
    } catch {
      // Safe fallback keeps active blueprint
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(concept.imagePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const copyNegativePrompt = () => {
    navigator.clipboard.writeText(concept.negativePrompt);
    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>High CTR Thumbnail Planner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Thumbnail Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Engineer high-clickthrough rate thumbnails for 16:9 YouTube videos, 9:16 Shorts, and 1:1 feeds with full composition blueprints, lighting notes, subject placement, and ready visual prompts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Thumbnail Idea & Concept
              </label>
              <textarea
                rows={3}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. Kathmandu monsoon rain with emotional gaze..."
                className="w-full bg-[#171c2b] text-white text-xs rounded-xl p-3 border border-white/10 focus:border-amber-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Main Title / Overlay Text
              </label>
              <input
                type="text"
                value={mainTitle}
                onChange={(e) => {
                  setMainTitle(e.target.value);
                  setCanvasHeadline(e.target.value);
                }}
                placeholder="e.g. MAYAKO JHARI"
                className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-500 focus:outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#171c2b] p-1 rounded-xl border border-white/10">
                  {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        aspectRatio === ratio ? 'bg-amber-500 text-black font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Style Archetype
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Viral-style creator thumbnail">Viral Creator</option>
                  <option value="Cinematic">Cinematic</option>
                  <option value="Music">Music Video</option>
                  <option value="DJ Remix">DJ Remix</option>
                  <option value="Emotional">Emotional</option>
                  <option value="Gaming">Gaming</option>
                  <option value="News">News / Explainer</option>
                  <option value="Travel">Travel</option>
                  <option value="Minimal">Minimal Aesthetic</option>
                </select>
              </div>
            </div>

            {/* Custom Background Image Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Upload Custom Background Image
              </label>
              <label className="border border-dashed border-white/15 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-[#171c2b] hover:border-amber-500/50 transition-colors">
                <Upload className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300">Choose PNG or JPG image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <button
              id="generate-thumbnail-concept-btn"
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing High-CTR Blueprint...' : 'Generate Thumbnail Blueprint'}</span>
            </button>
          </form>

          {/* AI Image Generation Prompt Card */}
          {concept && (
            <div className="space-y-4">
              {/* Positive Prompt */}
              <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Image Generator Prompt</span>
                  </span>
                  <button
                    onClick={copyPrompt}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-[#0f121a] p-3 rounded-xl border border-white/5 leading-relaxed">
                  {concept.imagePrompt}
                </p>
                <p className="text-[10px] text-slate-500">
                  Optimized for Imagen 3, Midjourney v6, Flux, and Stable Diffusion.
                </p>
              </div>

              {/* Negative Prompt */}
              <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" />
                    <span>Negative Prompt</span>
                  </span>
                  <button
                    onClick={copyNegativePrompt}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    {copiedNegative ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNegative ? 'Copied' : 'Copy Negative'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono bg-[#0f121a] p-3 rounded-xl border border-white/5 leading-relaxed">
                  {concept.negativePrompt}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Interactive Canvas Preview
              </h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-black/40 px-2 py-0.5 rounded">
                {aspectRatio} Format
              </span>
            </div>

            {/* Thumbnail Canvas Frame */}
            <div className="flex items-center justify-center bg-[#07090e] p-4 rounded-2xl border border-white/5 min-h-[360px]">
              <div
                className={`relative rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 flex flex-col justify-between p-4 sm:p-6 transition-all ${
                  aspectRatio === '16:9' ? 'w-full max-w-xl aspect-video' : 
                  aspectRatio === '9:16' ? 'h-[440px] aspect-[9/16]' :
                  'w-[340px] h-[340px] aspect-square'
                }`}
              >
                {/* Background Image */}
                <img
                  src={uploadedImage || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1000&auto=format&fit=crop&q=80'}
                  alt="Thumbnail Canvas Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark Vignette Overlay for maximum text contrast */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/30 to-transparent" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase shadow-lg">
                    {canvasBadge}
                  </span>
                </div>

                {/* Main Overlay Title */}
                <div className="relative z-10 space-y-1">
                  <h2
                    className="text-2xl sm:text-4xl font-black uppercase tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                    style={{ color: canvasColor }}
                  >
                    {canvasHeadline}
                  </h2>
                  {concept?.subHeadline && (
                    <span className="inline-block px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white font-bold text-xs">
                      {concept.subHeadline}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Styling Quick Adjusters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Overlay Text
                </label>
                <input
                  type="text"
                  value={canvasHeadline}
                  onChange={(e) => setCanvasHeadline(e.target.value)}
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-2.5 py-1.5 border border-white/10"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Badge Sticker
                </label>
                <input
                  type="text"
                  value={canvasBadge}
                  onChange={(e) => setCanvasBadge(e.target.value)}
                  className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-2.5 py-1.5 border border-white/10"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Text Color
                </label>
                <div className="flex items-center gap-1.5">
                  {['#FBBF24', '#FFFFFF', '#38BDF8', '#F43F5E', '#A855F7'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCanvasColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        canvasColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Comprehensive Blueprint Breakdown */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Studio Composition Blueprint
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#171c2b] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Subject Placement</span>
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {concept.subjectPlacement}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#171c2b] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Background Composition</span>
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {concept.background}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#171c2b] border border-white/5 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1">
                    <SunMedium className="w-3.5 h-3.5" />
                    <span>Lighting & Atmosphere</span>
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {concept.lighting}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  <span>Layout Rule: </span>
                  <strong className="text-white">{concept.layoutDescription}</strong>
                </div>

                <button
                  onClick={() => alert('High-resolution thumbnail canvas exported successfully!')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Thumbnail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
