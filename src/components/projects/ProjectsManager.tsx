import React, { useState } from 'react';
import { 
  FolderGit2, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Scissors, 
  Copy, 
  Trash2, 
  Edit3, 
  DownloadCloud, 
  Clock, 
  Film, 
  Check, 
  X,
  ExternalLink,
  Database,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';
import { Project, ProjectStatus, VideoType } from '../../types';
import { StudioApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ProjectsManagerProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateNew: () => void;
  onRefreshProjects: () => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onOpenProject,
  onCreateNew,
  onRefreshProjects,
}) => {
  const { user, isAuthenticated, openLoginModal, loginWithGoogle } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Filter logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.ideaPrompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesType = selectedType === 'all' || p.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await StudioApiService.duplicateProjectAsync(id);
    onRefreshProjects();
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await StudioApiService.deleteProjectAsync(id);
      onRefreshProjects();
    }
  };

  const startRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setRenameValue(project.name);
  };

  const saveRename = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (renameValue.trim()) {
      await StudioApiService.saveProjectAsync({
        ...project,
        name: renameValue.trim()
      });
      onRefreshProjects();
    }
    setEditingProjectId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Workspace Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage, duplicate, rename, edit, and export your video productions.
          </p>
        </div>

        <button
          id="new-project-btn"
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Cloud & Authentication Status Strip */}
      {isAuthenticated && user ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-[#0f1320] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Neon PostgreSQL Cloud Sync Active</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-400">
                User account: <span className="text-cyan-300 font-medium">{user.display_username}</span> ({user.email || user.username}) • User ID: <span className="font-mono text-slate-300">{user.id}</span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict User Isolation</span>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#171a2b] via-[#121622] to-[#10141f] border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 sm:mt-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-white text-sm">
                Enable Cloud Storage & Multi-Device Sync
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Sign in with Google to store your video projects in <strong>Neon PostgreSQL</strong>, prevent data loss, and access your creations from any device.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="projects-signin-btn"
            onClick={openLoginModal}
            className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or idea..."
            className="w-full bg-[#171c2b] text-xs text-white rounded-xl pl-10 pr-4 py-2 border border-white/5 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#171c2b] text-slate-300 text-xs rounded-xl px-3 py-2 border border-white/5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Generating">Generating</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Exported">Exported</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#171c2b] text-slate-300 text-xs rounded-xl px-3 py-2 border border-white/5 focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="YouTube Video">YouTube Video</option>
            <option value="YouTube Shorts">YouTube Shorts</option>
            <option value="Music Video">Music Video</option>
            <option value="Cinematic Video">Cinematic Video</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#121622] border border-white/5">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No projects match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or create a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onOpenProject(project.id)}
              className="group relative rounded-3xl bg-[#121622] hover:bg-[#171d2b] border border-white/5 hover:border-indigo-500/30 overflow-hidden cursor-pointer transition-all shadow-xl flex flex-col justify-between"
            >
              {/* Media Card Top */}
              <div>
                <div className="relative aspect-video bg-[#0c0f16] overflow-hidden">
                  <img
                    src={project.thumbnailUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80'}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-black/40" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      project.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      project.status === 'Exported' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      project.status === 'Generating' ? 'bg-amber-500/20 text-amber-300 animate-pulse' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Duration & Aspect Ratio */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                    <span>{project.aspectRatio}</span>
                    <span>•</span>
                    <span>{project.duration}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase">{project.type}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500">{project.style}</span>
                  </div>

                  {editingProjectId === project.id ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 bg-[#1c2233] text-white text-xs px-2 py-1 rounded border border-indigo-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={(e) => saveRename(project, e)}
                        className="p-1 rounded bg-indigo-600 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProjectId(null);
                        }}
                        className="p-1 rounded bg-[#1c2233] text-slate-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                  )}

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {project.ideaPrompt}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => startRename(project, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    title="Rename"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDuplicate(project.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(project.id, project.name, e)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
