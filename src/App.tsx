import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { LandingPage } from './components/landing/LandingPage';
import { VideoGenerator } from './components/generator/VideoGenerator';
import { ShortsCreator } from './components/shorts/ShortsCreator';
import { VideoEditor } from './components/editor/VideoEditor';
import { ContentAssistant } from './components/assistant/ContentAssistant';
import { ThumbnailMaker } from './components/thumbnail/ThumbnailMaker';
import { ProjectsManager } from './components/projects/ProjectsManager';
import { TemplatesLibrary } from './components/templates/TemplatesLibrary';
import { MusicVideoPlanner } from './components/music/MusicVideoPlanner';
import { OneMinuteTimelinePlanner } from './components/timeline/OneMinuteTimelinePlanner';
import { AIWebsiteGuide } from './components/guide/AIWebsiteGuide';
import { Footer } from './components/common/Footer';
import { AboutUs } from './components/legal/AboutUs';
import { HowToUse } from './components/legal/HowToUse';
import { AIToolsGuide } from './components/legal/AIToolsGuide';
import { FAQPage } from './components/legal/FAQPage';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfService } from './components/legal/TermsOfService';
import { CookiePolicy } from './components/legal/CookiePolicy';
import { Disclaimer } from './components/legal/Disclaimer';
import { ContactUs } from './components/legal/ContactUs';
import { ArticlesHub } from './components/articles/ArticlesHub';
import { ArticleDetail } from './components/articles/ArticleDetail';
import { ALL_ARTICLES, getArticleBySlug } from './data/articles';
import { Project } from './types';
import { StudioApiService } from './services/api';
import { 
  DownloadCloud, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  ExternalLink, 
  Music,
  Trash2,
  HardDrive
} from 'lucide-react';

// SPA Route & Slug Parser for clean browser URL history & serverless hosting
const parsePath = (pathname: string): { route: string; slug?: string } => {
  const clean = pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  if (!clean || clean === 'home' || clean === 'dashboard' || clean === 'landing') return { route: 'landing' };
  
  if (clean === 'articles' || clean === 'guides' || clean === 'creator-guides' || clean === 'article') {
    return { route: 'articles' };
  }
  
  if (clean.startsWith('articles/') || clean.startsWith('article/') || clean.startsWith('guides/') || clean.startsWith('creator-guides/')) {
    const parts = clean.split('/');
    if (parts.length > 1 && parts[1]) {
      return { route: 'article-detail', slug: parts[1] };
    }
    return { route: 'articles' };
  }

  // Check if direct slug matches any of our 30 articles
  const matched = getArticleBySlug(clean);
  if (matched) {
    return { route: 'article-detail', slug: matched.slug };
  }

  if (clean === 'projects' || clean === 'project') return { route: 'projects' };
  if (clean === 'timeline-planner' || clean === '1min-timeline' || clean === 'timeline' || clean === 'flow' || clean === 'video-timeline') return { route: 'timeline-planner' };
  if (clean === 'ai-guide' || clean === 'guide' || clean === 'website-guide' || clean === 'assistant-guide') return { route: 'ai-guide' };
  if (clean === 'settings' || clean === 'setting') return { route: 'settings' };
  if (clean === 'video-generator' || clean === 'generator' || clean === 'generate') return { route: 'video-generator' };
  if (clean === 'shorts-creator' || clean === 'shorts' || clean === 'reels') return { route: 'shorts-creator' };
  if (clean === 'video-editor' || clean === 'editor') return { route: 'video-editor' };
  if (clean === 'content-assistant' || clean === 'seo' || clean === 'assistant') return { route: 'content-assistant' };
  if (clean === 'thumbnail-maker' || clean === 'thumbnail') return { route: 'thumbnail-maker' };
  if (clean === 'music-video' || clean === 'music') return { route: 'music-video' };
  if (clean === 'templates' || clean === 'template') return { route: 'templates' };
  if (clean === 'about-us' || clean === 'about') return { route: 'about-us' };
  if (clean === 'how-to-use' || clean === 'how' || clean === 'instructions') return { route: 'how-to-use' };
  if (clean === 'ai-tools-guide' || clean === 'tools-guide' || clean === 'model-guide') return { route: 'ai-tools-guide' };
  if (clean === 'faq' || clean === 'faqs' || clean === 'help') return { route: 'faq' };
  if (clean === 'contact-us' || clean === 'contact') return { route: 'contact-us' };
  if (clean === 'privacy-policy' || clean === 'privacy') return { route: 'privacy-policy' };
  if (clean === 'terms-of-service' || clean === 'terms') return { route: 'terms-of-service' };
  if (clean === 'cookie-policy' || clean === 'cookies') return { route: 'cookie-policy' };
  if (clean === 'disclaimer') return { route: 'disclaimer' };
  return { route: 'landing' };
};

const routeToPath = (route: string, slug?: string): string => {
  if (route === 'landing') return '/';
  if (route === 'articles') return '/articles';
  if (route === 'article-detail' && slug) return `/articles/${slug}`;
  return `/${route}`;
};

export default function App() {
  const initialParsed = parsePath(window.location.pathname);
  const [currentRoute, setCurrentRoute] = useState<string>(initialParsed.route);
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string>(
    initialParsed.slug || 'ai-youtube-video-script'
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Content Assistant prefill context from educational articles
  const [assistantPrefill, setAssistantPrefill] = useState<{
    tab?: 'youtube' | 'writing' | 'power-suite' | 'seo';
    writingTool?: string;
    powerTool?: 'ideas' | 'calendar' | 'script' | 'prompt' | 'shorts-caption';
    language?: string;
    topic?: string;
    prompt?: string;
  }>({});
  const [shortsPrefill, setShortsPrefill] = useState<{ topic?: string; hook?: string }>({});
  const [thumbnailPrefill, setThumbnailPrefill] = useState<{ idea?: string; title?: string }>({});

  // Cross-route navigation with browser history update
  const navigateTo = (route: string, slug?: string, prefillContext?: any) => {
    const targetRoute = route === 'dashboard' ? 'landing' : route;
    
    if (targetRoute === 'article-detail') {
      const activeSlug = slug || currentArticleSlug;
      setCurrentArticleSlug(activeSlug);
    }

    if (prefillContext) {
      if (prefillContext.prompt && targetRoute === 'video-generator') {
        setInitialGeneratorPrompt(prefillContext.prompt);
      }
      if (targetRoute === 'shorts-creator') {
        setShortsPrefill({
          topic: prefillContext.topic || prefillContext.prompt,
          hook: prefillContext.hook
        });
      }
      if (targetRoute === 'thumbnail-maker') {
        setThumbnailPrefill({
          idea: prefillContext.prompt || prefillContext.idea || prefillContext.topic,
          title: prefillContext.title
        });
      }
      if (targetRoute === 'content-assistant') {
        setAssistantPrefill({
          tab: prefillContext.tab,
          writingTool: prefillContext.writingTool,
          powerTool: prefillContext.toolType || prefillContext.powerTool,
          language: prefillContext.language,
          topic: prefillContext.topic,
          prompt: prefillContext.prompt
        });
      }
    }

    setCurrentRoute(targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const targetPath = routeToPath(targetRoute, slug || currentArticleSlug);
    if (window.location.pathname !== targetPath) {
      try {
        window.history.pushState({ route: targetRoute, slug }, '', targetPath);
      } catch {
        // Fallback for isolated iframe environments
      }
    }
  };

  // Sync route on browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePath(window.location.pathname);
      setCurrentRoute(parsed.route);
      if (parsed.slug) {
        setCurrentArticleSlug(parsed.slug);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Projects data from local storage
  const [projects, setProjects] = useState<Project[]>(() => StudioApiService.getProjects());
  const [currentEditingProject, setCurrentEditingProject] = useState<Project | null>(() => {
    const initial = StudioApiService.getProjects();
    return initial.length > 0 ? initial[0] : null;
  });

  // Cross-component prompt passing
  const [initialGeneratorPrompt, setInitialGeneratorPrompt] = useState<string>('');
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState<string>('');

  // User Settings & Preferences state (persisted locally)
  const [userPreferences, setUserPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('kiran_studio_preferences');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      defaultAspectRatio: '16:9',
      defaultLanguage: 'Nepali',
      defaultStyle: 'Cinematic',
      autoGenerateSEO: true,
      highBitrateRender: true
    };
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  const refreshProjects = () => {
    const fresh = StudioApiService.getProjects();
    setProjects(fresh);
  };

  const handleUseTemplate = (template: any) => {
    setInitialGeneratorPrompt(template.samplePrompt || template.prompt || '');
    navigateTo('video-generator');
  };

  const handleOpenProjectInEditor = (project: Project) => {
    setCurrentEditingProject(project);
    navigateTo('video-editor');
  };

  const handleOpenProjectInAssistant = (project: Project) => {
    setInitialAssistantPrompt(project.ideaPrompt);
    navigateTo('content-assistant');
  };

  const handleOpenProjectById = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setCurrentEditingProject(proj);
      navigateTo('video-editor');
    }
  };

  const isLegalRoute = [
    'about-us', 
    'how-to-use',
    'ai-tools-guide',
    'faq',
    'privacy-policy', 
    'terms-of-service', 
    'cookie-policy', 
    'disclaimer', 
    'contact-us'
  ].includes(currentRoute);

  const isArticleRoute = currentRoute === 'articles' || currentRoute === 'article-detail';

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onNavigate={navigateTo}
        currentRoute={currentRoute}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onQuickCreate={() => {
          setInitialGeneratorPrompt('');
          navigateTo('video-generator');
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${
          currentRoute === 'landing' || isLegalRoute || isArticleRoute
            ? 'md:ml-64 p-0 pb-16' 
            : 'md:ml-64 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12'
        }`}>
          {/* Landing / Home View */}
          {currentRoute === 'landing' && (
            <LandingPage
              onStartCreating={() => {
                setInitialGeneratorPrompt('');
                navigateTo('video-generator');
              }}
              onSelectFeature={(featureRoute) => {
                navigateTo(featureRoute);
              }}
              onSelectArticle={(slug) => {
                navigateTo('article-detail', slug);
              }}
            />
          )}

          {/* AI Creator Guides & Articles Hub (30 Original Guides) */}
          {currentRoute === 'articles' && (
            <ArticlesHub
              onSelectArticle={(slug) => navigateTo('article-detail', slug)}
              onOpenTool={(toolRoute, ctx) => navigateTo(toolRoute, undefined, ctx)}
              onNavigateHome={() => navigateTo('landing')}
            />
          )}

          {/* Individual Article Reader View */}
          {currentRoute === 'article-detail' && (
            <ArticleDetail
              article={getArticleBySlug(currentArticleSlug) || ALL_ARTICLES[0]}
              onNavigateBack={() => navigateTo('articles')}
              onSelectArticle={(slug) => navigateTo('article-detail', slug)}
              onOpenTool={(toolRoute, ctx) => navigateTo(toolRoute, undefined, ctx)}
              onNavigateHome={() => navigateTo('landing')}
            />
          )}

          {/* AI Video Planner */}
          {currentRoute === 'video-generator' && (
            <VideoGenerator
              initialTemplatePrompt={initialGeneratorPrompt}
              onProjectCreated={(newProject) => {
                StudioApiService.saveProject(newProject);
                refreshProjects();
                setCurrentEditingProject(newProject);
              }}
              onOpenEditor={(project) => {
                StudioApiService.saveProject(project);
                refreshProjects();
                handleOpenProjectInEditor(project);
              }}
              onOpenSEO={(project) => handleOpenProjectInAssistant(project)}
            />
          )}

          {/* Shorts & Reels Creator (9:16) */}
          {currentRoute === 'shorts-creator' && (
            <ShortsCreator
              initialTopic={shortsPrefill.topic}
              initialHook={shortsPrefill.hook}
              onOpenEditorWithShorts={(plan) => {
                const shortsProject: Project = {
                  id: 'short-' + Date.now(),
                  name: plan.title || 'Untitled Short',
                  type: 'YouTube Shorts',
                  aspectRatio: '9:16',
                  duration: '30 seconds',
                  style: 'Viral-style creator thumbnail' as any,
                  voice: 'Custom',
                  language: 'English',
                  music: 'AI Background Music',
                  ideaPrompt: plan.hook,
                  status: 'Draft',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                  scenes: plan.scenePlan.map((s, idx) => ({
                    id: `scene-${idx + 1}`,
                    sceneNumber: idx + 1,
                    timeRange: s.secondRange,
                    title: `Short Scene ${idx + 1}`,
                    description: s.action,
                    visualPrompt: `${s.action} - On-screen text: "${s.onScreenText}"`,
                    cameraAngle: s.cameraAngle,
                    lighting: 'Dynamic Studio',
                    soundCues: '128 BPM beat punch'
                  })),
                  script: plan.script
                };
                StudioApiService.saveProject(shortsProject);
                refreshProjects();
                handleOpenProjectInEditor(shortsProject);
              }}
            />
          )}

          {/* 1-Minute AI Video Timeline Planner */}
          {currentRoute === 'timeline-planner' && (
            <OneMinuteTimelinePlanner
              onOpenEditor={(project) => {
                StudioApiService.saveProject(project);
                refreshProjects();
                handleOpenProjectInEditor(project);
              }}
              onNavigateHome={() => navigateTo('landing')}
            />
          )}

          {/* Timeline Video Editor */}
          {currentRoute === 'video-editor' && (
            currentEditingProject ? (
              <VideoEditor
                project={currentEditingProject}
                onSaveProject={(proj) => {
                  StudioApiService.saveProject(proj);
                  refreshProjects();
                }}
              />
            ) : (
              <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#121622] border border-white/10 text-center space-y-4">
                <h3 className="text-lg font-bold text-white">No Project Selected</h3>
                <p className="text-xs text-slate-400">Choose a project from your workspace or plan a new one.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => navigateTo('projects')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10"
                  >
                    View My Projects
                  </button>
                  <button
                    onClick={() => navigateTo('video-generator')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Create New Plan
                  </button>
                </div>
              </div>
            )
          )}

          {/* AI Content & SEO Assistant */}
          {currentRoute === 'content-assistant' && (
            <ContentAssistant 
              initialPrompt={assistantPrefill.prompt || initialAssistantPrompt}
              initialTab={assistantPrefill.tab}
              initialWritingTool={assistantPrefill.writingTool}
              initialPowerTool={assistantPrefill.powerTool}
              initialLanguage={assistantPrefill.language}
              initialTopic={assistantPrefill.topic}
            />
          )}

          {/* Thumbnail Concept Maker */}
          {currentRoute === 'thumbnail-maker' && (
            <ThumbnailMaker 
              initialIdea={thumbnailPrefill.idea}
              initialTitle={thumbnailPrefill.title}
            />
          )}

          {/* My Projects */}
          {currentRoute === 'projects' && (
            <ProjectsManager
              projects={projects}
              onOpenProject={handleOpenProjectById}
              onCreateNew={() => {
                setInitialGeneratorPrompt('');
                navigateTo('video-generator');
              }}
              onRefreshProjects={refreshProjects}
            />
          )}

          {/* Templates Library */}
          {currentRoute === 'templates' && (
            <TemplatesLibrary onUseTemplate={handleUseTemplate} />
          )}

          {/* Music Video Storyboarder */}
          {currentRoute === 'music-video' && (
            <MusicVideoPlanner
              onCreateProject={(project) => {
                StudioApiService.saveProject(project);
                refreshProjects();
                handleOpenProjectInEditor(project);
              }}
              onOpenAssistant={(project) => {
                handleOpenProjectInAssistant(project);
              }}
            />
          )}

          {/* AI Website Guide */}
          {currentRoute === 'ai-guide' && (
            <AIWebsiteGuide onNavigate={navigateTo} />
          )}

          {/* Settings & Workspace Defaults */}
          {currentRoute === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white">Studio Settings & Preferences</h1>
                    <p className="text-xs text-slate-400">Configure default generation presets, language, and local browser workspace data.</p>
                  </div>
                </div>

                {preferencesSaved && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Preferences saved locally!</span>
                  </div>
                )}
              </div>

              {/* Creator Studio Attribution */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-4 text-xs shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Creator & Developer</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Kiran AI Video Studio is an open, independent creative workspace created and maintained by Kiran Chaulagain.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#171c2b] border border-white/5 space-y-1">
                    <span className="text-slate-400 text-[11px] font-semibold">Lead Developer</span>
                    <p className="text-white font-bold text-sm">Kiran Chaulagain</p>
                    <p className="text-slate-500 text-[10px]">Independent Developer & Video Creator</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#171c2b] border border-white/5 space-y-1">
                    <span className="text-slate-400 text-[11px] font-semibold">Official Contact Email</span>
                    <a 
                      href="mailto:kiranchaulagain094@gmail.com"
                      className="text-indigo-400 hover:text-indigo-300 font-mono font-bold text-xs block transition-colors"
                    >
                      kiranchaulagain094@gmail.com
                    </a>
                    <p className="text-slate-500 text-[10px]">Inquiries, bug reports & feedback</p>
                  </div>
                </div>
              </div>

              {/* Creator Defaults & Presets */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-5 text-xs shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-violet-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Creator Defaults & Presets</h3>
                      <p className="text-[11px] text-slate-400">Pre-populate new video generators and export workflows</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-semibold">Default Aspect Ratio</label>
                    <select
                      value={userPreferences.defaultAspectRatio}
                      onChange={(e) => setUserPreferences({ ...userPreferences, defaultAspectRatio: e.target.value })}
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="16:9">16:9 Landscape (YouTube)</option>
                      <option value="9:16">9:16 Vertical (Shorts / Reels)</option>
                      <option value="1:1">1:1 Square (Social Feed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 font-semibold">Default Creative Language</label>
                    <select
                      value={userPreferences.defaultLanguage}
                      onChange={(e) => setUserPreferences({ ...userPreferences, defaultLanguage: e.target.value })}
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Nepali">Nepali (नेपाली)</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 font-semibold">Default Visual Style</label>
                    <select
                      value={userPreferences.defaultStyle}
                      onChange={(e) => setUserPreferences({ ...userPreferences, defaultStyle: e.target.value })}
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Cinematic">Cinematic</option>
                      <option value="Realistic">Realistic</option>
                      <option value="Romantic">Romantic</option>
                      <option value="Anime">Anime</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPreferences.autoGenerateSEO}
                      onChange={(e) => setUserPreferences({ ...userPreferences, autoGenerateSEO: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:outline-none bg-[#171c2b] border-white/20"
                    />
                    <div>
                      <span className="text-white font-semibold">Auto-generate YouTube SEO Pack</span>
                      <p className="text-[10px] text-slate-500">Automatically prepares tags, descriptions, and hashtags when video plans complete</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPreferences.highBitrateRender}
                      onChange={(e) => setUserPreferences({ ...userPreferences, highBitrateRender: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:outline-none bg-[#171c2b] border-white/20"
                    />
                    <div>
                      <span className="text-white font-semibold">High-Quality Video Profile</span>
                      <p className="text-[10px] text-slate-500">Optimizes preview canvas and timeline rendering for 1080p outputs</p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      localStorage.setItem('kiran_studio_preferences', JSON.stringify(userPreferences));
                      setPreferencesSaved(true);
                      setTimeout(() => setPreferencesSaved(false), 3000);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>

              {/* Local Storage & Data Management */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-4 text-xs shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Local Browser Storage</h3>
                      <p className="text-[11px] text-slate-400">All project drafts and plans are stored directly in your browser.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold text-[10px] border border-cyan-500/20">
                    {projects.length} Saved Projects
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#171c2b] border border-white/5">
                  <div>
                    <h4 className="font-bold text-white text-xs">Reset Workspace to Default Projects</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Clears custom changes and restores standard sample project templates.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all projects in your local browser to default templates?')) {
                        localStorage.removeItem('kiran_studio_projects');
                        refreshProjects();
                        alert('Workspace reset to default templates.');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-300 border border-white/10 hover:border-red-500/20 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset Workspace</span>
                  </button>
                </div>
              </div>

              {/* Official YouTube Channel */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-4 text-xs shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-red-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Official YouTube Channel</h3>
                      <p className="text-[11px] text-slate-400">Official music and video creation channel by Kiran Chaulagain</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/20 via-[#171c2b] to-[#121622] border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/20">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Kiran AI Music</h4>
                      <p className="text-[11px] text-slate-400 font-mono">@kiranaimusic-94</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Official Creator Channel</p>
                    </div>
                  </div>

                  <a
                    href="https://youtube.com/@kiranaimusic-94?si=mTfia-Y4ZdAQqOFl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all w-fit"
                  >
                    <span>Visit YouTube Channel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Legal & Policy Pages */}
          {currentRoute === 'about-us' && (
            <AboutUs onNavigate={navigateTo} />
          )}

          {currentRoute === 'how-to-use' && (
            <HowToUse onNavigate={navigateTo} />
          )}

          {currentRoute === 'ai-tools-guide' && (
            <AIToolsGuide onNavigate={navigateTo} />
          )}

          {currentRoute === 'faq' && (
            <FAQPage onNavigate={navigateTo} />
          )}

          {currentRoute === 'privacy-policy' && (
            <PrivacyPolicy onNavigate={navigateTo} />
          )}

          {currentRoute === 'terms-of-service' && (
            <TermsOfService onNavigate={navigateTo} />
          )}

          {currentRoute === 'cookie-policy' && (
            <CookiePolicy onNavigate={navigateTo} />
          )}

          {currentRoute === 'disclaimer' && (
            <Disclaimer onNavigate={navigateTo} />
          )}

          {currentRoute === 'contact-us' && (
            <ContactUs onNavigate={navigateTo} />
          )}

          {/* Universal Website Footer with Policy Links */}
          {currentRoute !== 'landing' && (
            <Footer 
              onNavigate={navigateTo} 
              currentRoute={currentRoute} 
              className={isLegalRoute || isArticleRoute ? 'mt-0 border-t-0' : 'mt-12'} 
            />
          )}

        </main>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      {currentRoute !== 'landing' && (
        <BottomNav
          currentRoute={currentRoute}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
}
