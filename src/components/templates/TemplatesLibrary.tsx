import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Clock, 
  Smartphone, 
  Tv, 
  Heart, 
  Music, 
  Film, 
  Briefcase, 
  Globe, 
  Radio, 
  Zap, 
  Play
} from 'lucide-react';
import { VideoTemplate, TemplateCategory } from '../../types';
import { STUDIO_TEMPLATES } from '../../data/mockData';

interface TemplatesLibraryProps {
  onUseTemplate: (template: VideoTemplate) => void;
}

export const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({ onUseTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (TemplateCategory | 'All')[] = [
    'All',
    'Romantic Video',
    'Music Video',
    'YouTube Shorts',
    'Motivational Story',
    'Business Ad',
    'Product Promo',
    'Cinematic Travel',
    'News / Explainer',
    'Nepali Folk / Modern Song Concept',
    'DJ Remix Visualizer'
  ];

  const filteredTemplates = STUDIO_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch = tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.samplePrompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-2 border border-violet-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Production Frameworks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Template Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Start your production instantly with battle-tested studio templates including cinematic Nepali romance, viral 9:16 shorts, DJ visualizers, and brand promos.
        </p>
      </div>

      {/* Category Pills & Search */}
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

        {/* Scrollable category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-[#121622] text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="group rounded-3xl bg-[#121622] border border-white/10 hover:border-violet-500/40 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-violet-600/10 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail banner */}
              <div className="relative aspect-video bg-[#0c0e15] overflow-hidden">
                <img
                  src={template.thumbnailUrl}
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-black/30" />

                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-violet-300 border border-violet-500/30">
                    {template.category}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded">
                  <span>{template.aspectRatio}</span>
                  <span>•</span>
                  <span>{template.duration}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {template.description}
                </p>

                {/* Sample Prompt Sneak Peek */}
                <div className="p-3 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Sample Prompt
                  </span>
                  <p className="text-xs text-slate-300 line-clamp-2 italic font-serif">
                    "{template.samplePrompt}"
                  </p>
                </div>
              </div>
            </div>

            {/* Use Template Action */}
            <div className="p-5 pt-0">
              <button
                onClick={() => onUseTemplate(template)}
                className="w-full py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-violet-500/30 transition-all group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-violet-600/20"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
