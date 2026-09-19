import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { VideoGenerator } from './components/generator/VideoGenerator';
import { ShortsCreator } from './components/shorts/ShortsCreator';
import { VideoEditor } from './components/editor/VideoEditor';
import { ContentAssistant } from './components/assistant/ContentAssistant';
import { ThumbnailMaker } from './components/thumbnail/ThumbnailMaker';
import { ProjectsManager } from './components/projects/ProjectsManager';
import { TemplatesLibrary } from './components/templates/TemplatesLibrary';
import { AdminPanel } from './components/admin/AdminPanel';
import { AuthModal } from './components/auth/AuthModal';
import { WelcomeLoginPage } from './components/auth/WelcomeLoginPage';
import { AuthLoadingScreen } from './components/auth/AuthLoadingScreen';
import { MusicVideoPlanner } from './components/music/MusicVideoPlanner';
import { VideoGenerationComingSoon } from './components/generator/VideoGenerationComingSoon';
import { Project, UserProfile, Announcement, User } from './types';
import { useAuth } from './context/AuthContext';
import { StudioApiService } from './services/api';
import { ShieldAlert, AlertTriangle, DownloadCloud, Settings as SettingsIcon, ShieldCheck, CheckCircle2, HardDrive, Sparkles, Film, Sliders, ExternalLink, Music } from 'lucide-react';

// SPA Route Path Mapping for Firebase Hosting & browser URL history
const pathToRoute = (pathname: string): string => {
  const clean = pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  if (!clean || clean === 'dashboard') return 'dashboard';
  if (clean === 'admin') return 'admin';
  if (clean === 'projects' || clean === 'project') return 'projects';
  if (clean === 'settings' || clean === 'setting') return 'settings';
  if (clean === 'login' || clean === 'signin') return 'login';
  if (clean === 'video-generator' || clean === 'generator' || clean === 'generate') return 'video-generator';
  if (clean === 'shorts-creator' || clean === 'shorts') return 'shorts-creator';
  if (clean === 'video-editor' || clean === 'editor') return 'video-editor';
  if (clean === 'content-assistant' || clean === 'assistant') return 'content-assistant';
  if (clean === 'thumbnail-maker' || clean === 'thumbnail') return 'thumbnail-maker';
  if (clean === 'templates' || clean === 'template') return 'templates';
  if (clean === 'music-video' || clean === 'music') return 'music-video';
  if (clean === 'exports' || clean === 'export') return 'exports';
  return 'dashboard';
};

const routeToPath = (route: string): string => {
  if (route === 'dashboard') return '/';
  return `/${route}`;
};

export default function App() {
  // Authentication Context
  const { currentUser: sessionUser, isAdmin, isLoading, signOut } = useAuth();

  // Navigation & UI state with persistent SPA URL support
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return pathToRoute(window.location.pathname);
    }
    return 'dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Keep browser address bar synchronized with SPA navigation
  const navigateTo = (route: string, replace = false) => {
    setCurrentRoute(route);
    setIsSidebarOpen(false);
    if (typeof window !== 'undefined') {
      const targetPath = routeToPath(route);
      if (window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ route }, '', targetPath);
        } else {
          window.history.pushState({ route }, '', targetPath);
        }
      }
    }
  };

  // Sync route on browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const targetRoute = pathToRoute(window.location.pathname);
      setCurrentRoute(targetRoute);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Authenticated Creator User Profile state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Projects & Announcements data
  const [projects, setProjects] = useState<Project[]>(StudioApiService.getProjects());
  const [announcements, setAnnouncements] = useState<Announcement[]>(StudioApiService.getAnnouncements());
  const [currentEditingProject, setCurrentEditingProject] = useState<Project | null>(null);

  // Synchronize authenticated user profile and fetch user-isolated projects
  useEffect(() => {
    if (sessionUser) {
      StudioApiService.fetchProjectsFromServer().then(freshProjects => {
        setProjects(freshProjects);
      });
      setCurrentUser({
        id: sessionUser.id,
        name: sessionUser.username,
        email: `${sessionUser.username}@studio.local`,
        avatar: sessionUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionUser.username)}&background=6366f1&color=fff`,
        role: isAdmin ? 'Admin' : 'User',
        plan: 'Pro',
        status: 'active',
        createdAt: sessionUser.createdAt || new Date().toISOString(),
        projectsCount: projects.filter(p => p.userId === sessionUser.id).length,
        generationsCount: 48,
        storageUsedMB: 1240
      });
      // If user was on login or landing, route to dashboard or preserve the requested deep link
      if (currentRoute === 'landing' || currentRoute === 'login') {
        const deepRoute = pathToRoute(window.location.pathname);
        if (deepRoute && deepRoute !== 'login' && deepRoute !== 'landing') {
          navigateTo(deepRoute, true);
        } else {
          navigateTo('dashboard', true);
        }
      }
    } else {
      setCurrentUser(null);
      setProjects([]);
    }
  }, [sessionUser, isAdmin]);

  // User-isolated projects: Admins see all, standard creators see ONLY projects matching their immutable user ID
  const userProjects = (isAdmin || currentUser?.role === 'Admin')
    ? projects
    : projects.filter(p => p.userId === sessionUser?.id);

  // Cross-component prompt passing
  const [initialGeneratorPrompt, setInitialGeneratorPrompt] = useState<string>('');
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState<string>('');

  // User Settings & Preferences state
  const [userPreferences, setUserPreferences] = useState({
    defaultAspectRatio: '16:9',
    defaultLanguage: 'Nepali',
    defaultStyle: 'Cinematic',
    autoGenerateSEO: true,
    highBitrateRender: true
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  const refreshProjects = () => {
    StudioApiService.fetchProjectsFromServer().then(setProjects);
  };

  const refreshAnnouncements = () => {
    setAnnouncements(StudioApiService.getAnnouncements());
  };

  const handleSwitchUserRole = (newRole: 'user' | 'admin') => {
    if (currentUser) {
      const updated: UserProfile = {
        ...currentUser,
        role: newRole
      };
      setCurrentUser(updated);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error', err);
    }
    setCurrentUser(null);
    setProjects([]);
    try {
      localStorage.removeItem('kiran_studio_projects');
      localStorage.removeItem('kiran_studio_current_user');
    } catch {}
    navigateTo('login');
  };

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
    const deepRoute = pathToRoute(window.location.pathname);
    if (deepRoute && deepRoute !== 'login' && deepRoute !== 'landing') {
      navigateTo(deepRoute, true);
    } else {
      navigateTo('dashboard', true);
    }
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
    const proj = userProjects.find(p => p.id === id);
    if (proj) {
      setCurrentEditingProject(proj);
      navigateTo('video-editor');
    } else {
      console.warn('Unauthorized or project not found for current user');
    }
  };

  // MANDATORY AUTHENTICATION GUARDS
  // 1. If auth session is loading, show clean loading screen
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // 2. If user is NOT signed in, render full-screen Welcome/Login page only
  // Absolutely no access to dashboard or protected features without custom sign-in
  if (!sessionUser) {
    return (
      <WelcomeLoginPage 
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Check maintenance mode
  const adminStats = StudioApiService.getAdminStats();
  const isMaintenanceActive = adminStats.maintenanceMode && !isAdmin;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Maintenance Mode Alert Banner if active */}
      {isMaintenanceActive && (
        <div className="bg-amber-500 text-black px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Notice: Studio maintenance mode is currently active. Some AI generation queues may be delayed.</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onSwitchUserRole={handleSwitchUserRole}
        onNavigate={(route) => {
          navigateTo(route);
        }}
        currentRoute={currentRoute}
        announcements={announcements}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onQuickCreate={() => {
          setInitialGeneratorPrompt('');
          navigateTo('video-generator');
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar / Drawer on Mobile */}
        {currentRoute !== 'landing' && (
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={(route) => {
              navigateTo(route);
            }}
            currentUser={currentUser}
            isAdmin={isAdmin}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Viewport */}
        <main className={`flex-1 overflow-y-auto ${currentRoute === 'landing' ? 'p-0' : 'md:ml-64 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12'}`}>
          {currentRoute === 'landing' && (
            <LandingPage
              onStartCreating={() => {
                if (!currentUser) setIsAuthModalOpen(true);
                else navigateTo('video-generator');
              }}
              onOpenLogin={() => setIsAuthModalOpen(true)}
              onSelectFeature={(featureRoute) => {
                navigateTo(featureRoute);
              }}
            />
          )}

          {currentRoute === 'dashboard' && currentUser && (
            <DashboardHome
              currentUser={currentUser}
              projects={userProjects}
              announcements={announcements}
              onCreateProject={() => {
                setInitialGeneratorPrompt('');
                navigateTo('video-generator');
              }}
              onOpenProject={handleOpenProjectById}
              onNavigate={(route) => navigateTo(route)}
            />
          )}

          {currentRoute === 'video-generator' && (
            <VideoGenerator
              initialTemplatePrompt={initialGeneratorPrompt}
              onProjectCreated={(newProject) => {
                const userProj = { ...newProject, userId: sessionUser.id };
                StudioApiService.saveProject(userProj);
                refreshProjects();
                setCurrentEditingProject(userProj);
              }}
              onOpenEditor={(project) => {
                const userProj = { ...project, userId: sessionUser.id };
                StudioApiService.saveProject(userProj);
                refreshProjects();
                handleOpenProjectInEditor(userProj);
              }}
              onOpenSEO={(project) => handleOpenProjectInAssistant(project)}
            />
          )}

          {currentRoute === 'shorts-creator' && (
            <ShortsCreator
              onOpenEditorWithShorts={(plan) => {
                const shortsProject: Project = {
                  id: 'short-' + Date.now(),
                  userId: sessionUser.id,
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

          {currentRoute === 'video-editor' && (
            currentEditingProject && (isAdmin || currentEditingProject.userId === sessionUser.id) ? (
              <VideoEditor
                project={currentEditingProject}
                onSaveProject={(proj) => {
                  const secured = { ...proj, userId: sessionUser.id };
                  StudioApiService.saveProject(secured);
                  refreshProjects();
                }}
              />
            ) : (
              <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#121622] border border-white/10 text-center space-y-4">
                <h3 className="text-lg font-bold text-white">Project Not Found</h3>
                <p className="text-xs text-slate-400">This project does not exist or belongs to another creator account.</p>
                <button
                  onClick={() => navigateTo('projects')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Return to My Projects
                </button>
              </div>
            )
          )}

          {currentRoute === 'content-assistant' && (
            <ContentAssistant initialPrompt={initialAssistantPrompt} />
          )}

          {currentRoute === 'thumbnail-maker' && (
            <ThumbnailMaker />
          )}

          {currentRoute === 'projects' && (
            <ProjectsManager
              projects={userProjects}
              onOpenProject={handleOpenProjectById}
              onCreateNew={() => {
                setInitialGeneratorPrompt('');
                navigateTo('video-generator');
              }}
              onRefreshProjects={refreshProjects}
            />
          )}

          {currentRoute === 'templates' && (
            <TemplatesLibrary onUseTemplate={handleUseTemplate} />
          )}

          {currentRoute === 'music-video' && (
            <MusicVideoPlanner
              onCreateProject={(project) => {
                const userProj = { ...project, userId: sessionUser.id };
                StudioApiService.saveProject(userProj);
                refreshProjects();
                handleOpenProjectInEditor(userProj);
              }}
              onOpenAssistant={(project) => {
                handleOpenProjectInAssistant(project);
              }}
            />
          )}

          {currentRoute === 'video-generation-coming-soon' && (
            <VideoGenerationComingSoon
              onExplorePlanner={() => navigateTo('video-generator')}
            />
          )}

          {currentRoute === 'admin' && (
            <AdminPanel
              currentUser={
                currentUser
                  ? {
                      id: currentUser.id,
                      name: currentUser.name,
                      email: currentUser.email,
                      avatar: currentUser.avatar,
                      role: isAdmin ? 'Admin' : 'User',
                      status: currentUser.status === 'active' ? 'Active' : 'Suspended',
                      videosGenerated: currentUser.generationsCount,
                      createdAt: currentUser.createdAt
                    }
                  : null
              }
              isAdmin={isAdmin}
              onReturnToDashboard={() => navigateTo('dashboard')}
              onAnnouncementsUpdated={refreshAnnouncements}
            />
          )}

          {/* Exports View */}
          {currentRoute === 'exports' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">Exports & Render Queue</h1>
                  <p className="text-xs text-slate-400">Download rendered videos, subtitles, and audio masters.</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Output Files</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Storage: 480 MB / 5 GB</span>
                </div>

                <div className="space-y-3">
                  {userProjects.filter(p => p.status === 'Completed' || p.status === 'Exported').map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={p.thumbnailUrl} alt={p.name} className="w-14 h-9 object-cover rounded-lg" />
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.aspectRatio} • {p.duration} • MP4 H.264</p>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Downloading "${p.name}.mp4" (1080p Full HD)...`)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentRoute === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white">Studio Settings</h1>
                    <p className="text-xs text-slate-400">Manage account credentials, usage quotas, and generation presets.</p>
                  </div>
                </div>

                {preferencesSaved && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold animate-pulse">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Preferences saved!</span>
                  </div>
                )}
              </div>

              {/* Account Profile & Plan */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-5 text-xs shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Account Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Creator Name</label>
                      <input
                        type="text"
                        value={currentUser?.name || ''}
                        disabled
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Active Plan</h3>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-violet-900/20 border border-indigo-500/30 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-400 text-base">Studio Pro Creator</span>
                      <p className="text-slate-400 text-[11px]">Unlimited 4K exports, 1080p 60fps renders, YouTube SEO Suite</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature 18: Usage Limits & Quota Breakdown */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-5 text-xs shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Usage & Quota Limits</h3>
                      <p className="text-[11px] text-slate-400">Current consumption against platform allowances</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Quota Good Standing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Daily Generations */}
                  <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold">Daily Generations</span>
                      <span className="font-mono text-white font-bold">14 / 50</span>
                    </div>
                    <div className="w-full bg-[#11141e] h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: '28%' }} />
                    </div>
                    <span className="text-[10px] text-slate-500">Resets daily at 00:00 UTC (36 remaining)</span>
                  </div>

                  {/* Monthly Generations */}
                  <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold">Monthly AI Quota</span>
                      <span className="font-mono text-white font-bold">{currentUser?.generationsCount || 48} / 500</span>
                    </div>
                    <div className="w-full bg-[#11141e] h-2 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: '9.6%' }} />
                    </div>
                    <span className="text-[10px] text-slate-500">452 AI generation credits remaining</span>
                  </div>

                  {/* Storage Allocation */}
                  <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold">Cloud Storage</span>
                      <span className="font-mono text-white font-bold">{currentUser?.storageUsedMB || 1240} MB / 5,120 MB</span>
                    </div>
                    <div className="w-full bg-[#11141e] h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: '24.2%' }} />
                    </div>
                    <span className="text-[10px] text-slate-500">3,880 MB available for projects & clips</span>
                  </div>

                  {/* Max Video Duration */}
                  <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1">
                    <span className="text-slate-400 font-semibold block">Max Video Duration</span>
                    <p className="text-lg font-black text-white font-mono">180s (3 min)</p>
                    <span className="text-[10px] text-slate-500">Extended long-form multi-scene export</span>
                  </div>

                  {/* Max Render Resolution */}
                  <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1">
                    <span className="text-slate-400 font-semibold block">Max Resolution</span>
                    <p className="text-lg font-black text-white font-mono">4K Ultra HD</p>
                    <span className="text-[10px] text-slate-500">3840x2160 @ 60fps MP4 H.264</span>
                  </div>

                  {/* Shorts Monthly Cap */}
                  <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold">Shorts (9:16)</span>
                      <span className="font-mono text-white font-bold">12 / 120</span>
                    </div>
                    <div className="w-full bg-[#11141e] h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '10%' }} />
                    </div>
                    <span className="text-[10px] text-slate-500">108 vertical renders remaining</span>
                  </div>
                </div>
              </div>

              {/* Creator Studio Defaults & Presets */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-5 text-xs shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-violet-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Creator Defaults & Preferences</h3>
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
                      <option value="1:1">1:1 Square (Feed)</option>
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
                      <p className="text-[10px] text-slate-500">Automatically prepares tags, description, and hashtags when videos complete</p>
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
                      <span className="text-white font-semibold">High-Bitrate 60fps Render Profile</span>
                      <p className="text-[10px] text-slate-500">Ensures studio-grade color grading and high frame rate exports</p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setPreferencesSaved(true);
                      setTimeout(() => setPreferencesSaved(false), 3000);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Studio Preferences</span>
                  </button>
                </div>
              </div>

              {/* Connected Platforms & Official YouTube Channel */}
              <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-4 text-xs shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-red-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Connected Studio Channel</h3>
                      <p className="text-[11px] text-slate-400">Target channel for video uploads and music planning</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-[10px] border border-emerald-500/20">
                    Connected & Verified
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/20 via-[#171c2b] to-[#121622] border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/20">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Kiran AI Music</h4>
                      <p className="text-[11px] text-slate-400 font-mono">@kiranaimusic-94</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Admin Account: kiranchaulagain094@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://youtube.com/@kiranaimusic-94?si=mTfia-Y4ZdAQqOFl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all"
                    >
                      <span>Open in YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      {currentRoute !== 'landing' && (
        <BottomNav
          currentRoute={currentRoute}
          onNavigate={(route) => navigateTo(route)}
        />
      )}

      {/* Auth Modal with Username/Password Authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
