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
  ExternalLink
} from 'lucide-react';
import { Project, ProjectStatus, VideoType } from '../../types';
import { StudioApiService } from '../../services/api';

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

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StudioApiService.duplicateProject(id);
    onRefreshProjects();
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      StudioApiService.deleteProject(id);
      onRefreshProjects();
    }
  };

  const startRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setRenameValue(project.name);
  };

  const saveRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (renameValue.trim()) {
      StudioApiService.saveProject({
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
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

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
