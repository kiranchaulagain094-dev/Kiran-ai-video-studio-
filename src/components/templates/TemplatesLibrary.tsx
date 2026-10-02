import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Clock, 
  Play, 
  X, 
  Star, 
  Film, 
  Layers, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { DbTemplate, Project } from '../../types';
import { TemplateService } from '../../services/templateService';
import { TemplateMakerStudio } from './TemplateMakerStudio';

interface TemplatesLibraryProps {
  onUseTemplate?: (template: any) => void;
  onProjectCreated?: (project: Project) => void;
}

export const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({
  onUseTemplate,
  onProjectCreated
}) => {
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Template for AI Template Maker Studio
  const [activeStudioTemplate, setActiveStudioTemplate] = useState<DbTemplate | null>(null);

  // Video Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<DbTemplate | null>(null);

  const categories = [
    'All',
    'Trending',
    'Beat Sync',
    'Photo Transition',
    'Love',
    'Birthday',
    'Travel',
    'DJ',
    'Emotional',
    'Festival',
    'Shorts',
    'TikTok Style',
    'Reels Style'
  ];

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await TemplateService.getTemplates(selectedCategory !== 'All' ? selectedCategory : undefined);
      setTemplates(data);
    } catch (err) {
      console.warn('Failed to load templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // If user opened a template into the Template Maker Studio
  if (activeStudioTemplate) {
    return (
      <TemplateMakerStudio
        template={activeStudioTemplate}
        onBack={() => setActiveStudioTemplate(null)}
        onProjectSaved={(project) => {
          if (onProjectCreated) {
            onProjectCreated(project);
          }
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-2 border border-violet-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Template Maker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Template Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Create studio-grade videos using your favourite editing templates. Upload photos and videos into pre-timed media slots with real deterministic beat-sync rendering.
        </p>
      </div>

      {/* Category Tabs & Search Controls */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by style, genre, or keyword..."
            className="w-full bg-[#121622] text-xs text-white rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:border-violet-500 focus:outline-none"
          />
        </div>

        {/* Category Filter Buttons (Functional segmented buttons per design constitution) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 font-bold'
                  : 'bg-[#121622] text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Loading templates...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#121622] border border-white/5 space-y-2">
          <p className="text-sm font-bold text-white">No templates found</p>
          <p className="text-xs text-slate-400">Try selecting another category or adjusting your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group rounded-3xl bg-[#121622] border border-white/10 hover:border-violet-500/40 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-violet-600/10 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail banner with Preview Button */}
                <div className="relative aspect-video bg-[#0c0e15] overflow-hidden">
                  <img
                    src={template.thumbnail_url}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {template.is_featured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black flex items-center gap-0.5 shadow-md">
                        <Star className="w-2.5 h-2.5 fill-black" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  {/* Play Video Preview Overlay Button */}
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 hover:bg-violet-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-80 group-hover:opacity-100 group-hover:scale-110 cursor-pointer"
                    title="Preview Template"
                  >
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  </button>

                  {/* Clean unboxed metadata per design constitution */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md">
                    <span>{template.aspect_ratio}</span>
                    <span aria-hidden="true">·</span>
                    <span>{template.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span>{template.media_slots} Slots</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  {/* Clean unboxed text kicker */}
                  <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold">
                    <span>{template.category}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400 font-normal">{template.media_slots} Media Slots Required</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                    {template.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    if (onUseTemplate) {
                      onUseTemplate(template);
                    }
                    setActiveStudioTemplate(template);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">{previewTemplate.title}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {previewTemplate.category} · {previewTemplate.aspect_ratio} · {previewTemplate.duration}
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-white/10">
              <video
                src={previewTemplate.preview_video_url || 'https://assets.mixkit.co/videos/preview/mixkit-urban-fashion-model-in-neon-city-41551-large.mp4'}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {previewTemplate.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const tpl = previewTemplate;
                  setPreviewTemplate(null);
                  setActiveStudioTemplate(tpl);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
