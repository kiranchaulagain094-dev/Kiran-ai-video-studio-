import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  SlidersHorizontal,
  Compass,
  Video,
  Scissors,
  Wand2,
  ExternalLink,
  ChevronRight,
  FolderGit2
} from 'lucide-react';
import { ALL_ARTICLES, ARTICLE_CATEGORIES, searchArticles, CORE_15_CREATOR_GUIDES } from '../../data/articles';
import { Article } from '../../types';
import { AdSenseSafeContainer } from '../common/AdSenseSafeContainer';

interface ArticlesHubProps {
  onSelectArticle: (slug: string) => void;
  onOpenTool: (route: string, prefillContext?: any) => void;
  onNavigateHome: () => void;
}

export const ArticlesHub: React.FC<ArticlesHubProps> = ({
  onSelectArticle,
  onOpenTool,
  onNavigateHome
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Guides');

  const filteredArticles = useMemo(() => {
    return searchArticles(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const featuredArticle = ALL_ARTICLES[0]; // Article 1: AI YouTube Video Script

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Guides': ALL_ARTICLES.length };
    ALL_ARTICLES.forEach((art) => {
      counts[art.category] = (counts[art.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <button 
          onClick={onNavigateHome} 
          className="hover:text-white transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-indigo-400 font-semibold">Creator Guides & Articles</span>
      </nav>

      {/* Hero Section */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#121622] via-[#151a2d] to-[#0f1320] border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <BookOpen className="w-4 h-4" />
            <span>Kiran AI Creator Knowledge Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            AI Creator Guides & Articles
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            नेपाली तथा अङ्ग्रेजीमा युट्युब सिर्जनाको पूर्ण ज्ञान। AI बाट आकर्षक स्क्रिप्ट, उच्च-CTR शीर्षक, थम्बनेल, सर्ट्स, र एसईओ बनाउने ३० वटा मौलिक र व्यावहारिक निर्देशिकाहरू।
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-xl sm:text-2xl font-black text-white">30</span>
              <p className="text-[11px] text-slate-400 font-medium">Original Guides</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">100%</span>
              <p className="text-[11px] text-slate-400 font-medium">Free Educational</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-xl sm:text-2xl font-black text-indigo-400">Live</span>
              <p className="text-[11px] text-slate-400 font-medium">Tool Integration</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-xl sm:text-2xl font-black text-cyan-400">Safe</span>
              <p className="text-[11px] text-slate-400 font-medium">AdSense & Policy Safe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Guide Banner (if on All Guides without search) */}
      {!searchQuery && selectedCategory === 'All Guides' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#131726] to-[#121622] border border-indigo-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Featured Guide #{featuredArticle.topicNumber}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {featuredArticle.readTime}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {featuredArticle.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
              {featuredArticle.metaDescription}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectArticle(featuredArticle.slug)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Read Full Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenTool(featuredArticle.targetTool.route, featuredArticle.targetTool.prefillContext)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Try Script Tool</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g. Script, Title, Shorts, SEO, नेपाली)..."
              className="w-full pl-11 pr-4 py-3 bg-[#121622] text-white rounded-2xl border border-white/10 placeholder-slate-500 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Result counter */}
          <div className="text-xs text-slate-400 flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Showing <strong className="text-white">{filteredArticles.length}</strong> of {ALL_ARTICLES.length} Guides</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ARTICLE_CATEGORIES.map((category) => {
            const count = categoryCounts[category] || 0;
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer
                  ${isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
                    : 'bg-[#121622] text-slate-400 hover:text-white hover:bg-[#171c2b] border border-white/5'
                  }
                `}
              >
                <span>{category}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="group p-5 sm:p-6 rounded-3xl bg-[#121622] hover:bg-[#151a2a] border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-lg hover:shadow-indigo-600/10 cursor-pointer"
              onClick={() => onSelectArticle(article.slug)}
            >
              <div className="space-y-3">
                {/* Meta info header */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/25">
                    Guide #{article.topicNumber}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                </div>

                {/* Category */}
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  {article.category}
                </span>

                {/* Main Titles */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-1">
                    {article.englishTitle}
                  </p>
                </div>

                {/* Snippet */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {article.metaDescription}
                </p>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                {/* Target Tool Badge */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 text-[10px]">Connected Tool:</span>
                  <span className="text-cyan-400 font-semibold truncate max-w-[160px] text-right">
                    {article.targetTool.name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 transition-colors">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTool(article.targetTool.route, article.targetTool.prefillContext);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-semibold transition-all border border-white/10 hover:border-indigo-500 flex items-center gap-1 cursor-pointer"
                    title={`Open ${article.targetTool.name}`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Try Tool</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-[#121622] border border-white/5 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Guides Found</h3>
          <p className="text-xs text-slate-400">
            No articles match your search query "{searchQuery}". Try different keywords like "Script", "Shorts", or "Title".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Guides');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Editorial AdSense Container (Strictly safe for content page) */}
      <AdSenseSafeContainer route="articles" hasSubstantialContent={true} />

      {/* AdSense & Transparency Safe Notice */}
      <div className="p-6 rounded-3xl bg-[#121622]/60 border border-white/5 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>About Kiran AI Creator Guides</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          यी सबै ३० वटा लेखहरू किरण चौलागाईं (Kiran Chaulagain) द्वारा सिर्जनाकर्ताहरूको व्यावहारिक ज्ञान र सीप अभिवृद्धिका लागि तयार पारिएका हुन्। यस प्लेटफर्मले कुनै पनि झूटा वाचाहरू (जस्तै ग्यारेन्टी भ्युज, भाइरल हुने दाबी, वा आम्दानीको ग्यारेन्टी) गर्दैन। सामग्रीको गुणस्तर र निरन्तरता नै युट्युबको सफलताको मूल आधार हो।
        </p>
      </div>
    </div>
  );
};
