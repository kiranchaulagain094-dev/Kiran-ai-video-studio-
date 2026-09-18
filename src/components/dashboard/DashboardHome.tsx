import React from 'react';
import { 
  FolderGit2, 
  Video, 
  Film, 
  Sparkles, 
  HardDrive, 
  Plus, 
  ArrowRight, 
  Clock, 
  MoreVertical, 
  Play, 
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Project, UserProfile, Announcement } from '../../types';

interface DashboardHomeProps {
  currentUser: UserProfile;
  projects: Project[];
  announcements: Announcement[];
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
  onNavigate: (route: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  currentUser,
  projects,
  announcements,
  onCreateProject,
  onOpenProject,
  onNavigate,
}) => {
  const activeAnnouncements = announcements.filter(a => a.isActive);

  // Computed metrics
  const totalProjects = projects.length;
  const videosCreated = projects.filter(p => p.type !== 'YouTube Shorts' && p.type !== 'TikTok/Reels').length;
  const shortsCreated = projects.filter(p => p.type === 'YouTube Shorts' || p.type === 'TikTok/Reels').length;
  const totalGenerations = currentUser.generationsCount || 24;
  const storageUsed = currentUser.storageUsedMB || 480;

  const statCards = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: FolderGit2,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Videos Created',
      value: videosCreated,
      icon: Video,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20'
    },
    {
      title: 'Shorts Created',
      value: shortsCreated,
      icon: Film,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'AI Generations',
      value: totalGenerations,
      icon: Sparkles,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Storage Used',
      value: `${storageUsed} MB`,
      icon: HardDrive,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      subtext: 'of 5,120 MB (Pro)'
    }
  ];

  const workflowSteps = [
    'Create Project',
    'Enter Idea',
    'AI Analyzes Idea',
    'Generate Script',
    'Generate Scenes',
    'Generate Video',
    'Browser Edit',
    'Add Captions / Music',
    'Title / SEO Pack',
    'Thumbnail',
    'Preview & Export'
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171c2b] via-[#151926] to-[#121520] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kiran AI Video Studio • Active Creator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xl">
              What will you produce today? Transform a rough concept into a fully scripted, edited, and SEO-optimized YouTube video or viral Short.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="dashboard-create-project-btn"
              onClick={onCreateProject}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Admin YouTube Channel Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#141926] to-[#121622] border border-red-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/20">
                Official Admin Channel
              </span>
              <span className="text-[10px] text-slate-400 font-mono">@kiranaimusic-94</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Kiran AI Music • Official YouTube Channel
            </h3>
            <p className="text-[11px] text-slate-400">
              AI Music Productions, Nepali Folk-Fusion, Soundtracks & Cinematic Visualizers produced with this studio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://youtube.com/@kiranaimusic-94?si=mTfia-Y4ZdAQqOFl"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/25 transition-all active:scale-95"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => onNavigate('music-video')}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all"
          >
            Plan Music Video
          </button>
        </div>
      </div>


      {/* Active Announcements */}
      {activeAnnouncements.length > 0 && (
        <div className="space-y-2">
          {activeAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
                ann.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="font-semibold text-white mr-2">{ann.title}</strong>
                <span className="text-slate-300">{ann.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5 Core Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl bg-[#121622] border ${card.bg} shadow-lg flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">{card.value}</p>
                {card.subtext && (
                  <p className="text-[10px] text-slate-500 mt-0.5">{card.subtext}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Production Workflow Chain */}
      <div className="p-5 rounded-3xl bg-[#121622] border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Studio Production Workflow
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Step-by-step roadmap from raw concept to 4K YouTube export</p>
          </div>
          <button 
            onClick={() => onNavigate('video-generator')}
            className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            Start workflow <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max">
            {workflowSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#171c2b] border border-white/5 text-xs text-slate-300 font-medium">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="text-slate-600">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Creator Tools */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Quick Launch Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('video-generator')}
            className="p-4 rounded-2xl bg-[#131724] hover:bg-[#191f30] border border-white/5 text-left transition-all group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">AI Video Generator</h4>
              <p className="text-[11px] text-slate-400 mt-1">Multi-scene cinematic storytelling generator</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('shorts-creator')}
            className="p-4 rounded-2xl bg-[#131724] hover:bg-[#191f30] border border-white/5 text-left transition-all group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-violet-300">Shorts Creator</h4>
              <p className="text-[11px] text-slate-400 mt-1">9:16 vertical hooks and retention scripts</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('content-assistant')}
            className="p-4 rounded-2xl bg-[#131724] hover:bg-[#191f30] border border-white/5 text-left transition-all group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">AI Content Assistant</h4>
              <p className="text-[11px] text-slate-400 mt-1">YouTube SEO, titles, tags & descriptions</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('thumbnail-maker')}
            className="p-4 rounded-2xl bg-[#131724] hover:bg-[#191f30] border border-white/5 text-left transition-all group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Thumbnail Maker</h4>
              <p className="text-[11px] text-slate-400 mt-1">High-CTR cover layouts and typography</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Projects
            </h3>
            <p className="text-xs text-slate-500">Pick up where you left off</p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all projects ({projects.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#121622] border border-white/5">
            <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">No projects found</h4>
            <p className="text-xs text-slate-400 mt-1">Start by generating an AI video or opening a template.</p>
            <button
              onClick={onCreateProject}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="group relative rounded-2xl bg-[#121622] hover:bg-[#181e2e] border border-white/5 hover:border-indigo-500/30 overflow-hidden cursor-pointer transition-all shadow-lg flex flex-col"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-[#0a0c10] overflow-hidden">
                  <img
                    src={project.thumbnailUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80'}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-black/30" />
                  
                  {/* Status badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      project.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      project.status === 'Exported' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      project.status === 'Generating' ? 'bg-amber-500/20 text-amber-300 animate-pulse' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Duration and Aspect ratio */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                    <span>{project.aspectRatio}</span>
                    <span>•</span>
                    <span>{project.duration}</span>
                  </div>
                </div>

                {/* Project Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-indigo-400 font-semibold">{project.type}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] text-slate-500">{project.style}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {project.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {project.ideaPrompt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="text-indigo-400 font-semibold group-hover:underline">
                      Open in Studio →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
