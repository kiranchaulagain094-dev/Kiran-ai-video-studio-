import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutTemplate, 
  Bell, 
  BarChart3, 
  ShieldAlert, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Star, 
  Upload, 
  RefreshCw, 
  ExternalLink,
  Film,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileVideo,
  Clock,
  Sparkles,
  ArrowUpRight,
  Calendar,
  ShieldCheck,
  Lock,
  Globe,
  Rocket,
  Send,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminService, AdminStats, AdminUser, AdminActivity } from '../../services/adminService';
import { DbTemplate, StudioUpdate, TemplateSlotMetadata } from '../../types';

interface AdminPanelProps {
  onNavigateHome: () => void;
  onOpenTemplates: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'templates' | 'updates' | 'system';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateHome, onOpenTemplates }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Stats & Overview
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<AdminActivity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  // Users Management
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState<string>('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<{ user: AdminUser; projects: any[] } | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

  // Templates Management
  const [templatesList, setTemplatesList] = useState<DbTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<DbTemplate> | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [templateSaveError, setTemplateSaveError] = useState<string | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);

  // Updates & Release Management
  const [updatesList, setUpdatesList] = useState<StudioUpdate[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState<boolean>(false);
  const [editingUpdate, setEditingUpdate] = useState<Partial<StudioUpdate> | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [updateSaveError, setUpdateSaveError] = useState<string | null>(null);
  const [isSavingUpdate, setIsSavingUpdate] = useState<boolean>(false);

  // Release Dashboard Filters & Modals
  const [releaseFilter, setReleaseFilter] = useState<'all' | 'published' | 'scheduled' | 'draft'>('all');
  const [deleteConfirmUpdate, setDeleteConfirmUpdate] = useState<StudioUpdate | null>(null);
  const [scheduleModalUpdate, setScheduleModalUpdate] = useState<StudioUpdate | null>(null);
  const [scheduleDateInput, setScheduleDateInput] = useState<string>('');
  const [scheduleTimeInput, setScheduleTimeInput] = useState<string>('10:00');
  const [scheduleTimezoneInput, setScheduleTimezoneInput] = useState<string>('UTC');
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [releaseMetrics, setReleaseMetrics] = useState<{
    currentLiveVersion: string;
    latestScheduledVersion: string | null;
    upcomingReleasesCount: number;
    publishedReleasesCount: number;
    draftReleasesCount: number;
  }>({
    currentLiveVersion: '1.1.0',
    latestScheduledVersion: null,
    upcomingReleasesCount: 0,
    publishedReleasesCount: 0,
    draftReleasesCount: 0
  });

  // Global Action Feedback Toast
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setActionError(null);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const showError = (msg: string) => {
    setActionError(msg);
    setActionFeedback(null);
    setTimeout(() => setActionError(null), 5000);
  };

  // Enforce server-side & client-side role security
  const isAdmin = Boolean(isAuthenticated && user && user.role === 'admin');

  // Load Dashboard Stats
  const loadDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await AdminService.getStats();
      setStats(data.stats);
      setRecentUsers(data.recentUsers);
      setRecentProjects(data.recentProjects);
      setRecentActivity(data.recentActivity);
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load Users List
  const loadUsers = async (q = '') => {
    setIsLoadingUsers(true);
    try {
      const users = await AdminService.getUsers(q);
      setUsersList(users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load Templates
  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const tpls = await AdminService.getTemplates();
      setTemplatesList(tpls);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Load Updates and Release Metrics
  const loadUpdates = async () => {
    setIsLoadingUpdates(true);
    try {
      const data = await AdminService.getUpdatesWithMetrics();
      setUpdatesList(data.updates);
      if (data.metrics) {
        setReleaseMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load updates:', err);
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardStats();
      loadUsers();
      loadTemplates();
      loadUpdates();
    }
  }, [isAdmin]);

  // If user is not authorized, block completely
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#121622] border border-rose-500/20 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You do not have permission to view the Kiran AI Studio Admin Panel. Administrator credentials and verified server-side privileges are strictly required.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Return to Studio Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>KIRAN AI STUDIO • PRIVILEGED ADMIN CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authenticated as <span className="text-white font-medium">{user.display_username}</span> ({user.email})
          </p>
        </div>

        {/* Global Feedback Banner */}
        {actionFeedback && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {actionError && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadDashboardStats();
              if (activeTab === 'users') loadUsers(searchUserQuery);
              if (activeTab === 'templates') loadTemplates();
              if (activeTab === 'updates') loadUpdates();
              showFeedback('Refreshed administrative data');
            }}
            className="p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a2030] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh current data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            Exit to Studio
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121622] rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('users');
            loadUsers(searchUserQuery);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users Management</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('templates');
            loadTemplates();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'templates'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Template Management</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('updates');
            loadUpdates();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'updates'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Release Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'system'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System & Database</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#121622] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Total Users</span>
              <div className="text-2xl font-black text-white">{stats?.totalUsers ?? '...'}</div>
              <div className="text-[10px] text-cyan-400">Google OAuth & Local</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Active Users</span>
              <div className="text-2xl font-black text-emerald-400">{stats?.activeUsers ?? '...'}</div>
              <div className="text-[10px] text-slate-500">Unrestricted status</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Total Projects</span>
              <div className="text-2xl font-black text-indigo-400">{stats?.totalProjects ?? '...'}</div>
              <div className="text-[10px] text-slate-500">Saved in Neon DB</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Rendered Videos</span>
              <div className="text-2xl font-black text-violet-400">{stats?.renderedVideos ?? '...'}</div>
              <div className="text-[10px] text-slate-500">Completed exports</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Total Templates</span>
              <div className="text-2xl font-black text-amber-400">{stats?.totalTemplates ?? '...'}</div>
              <div className="text-[10px] text-slate-500">Curated studio presets</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Template Usage</span>
              <div className="text-2xl font-black text-fuchsia-400">{stats?.totalTemplateUsage ?? '...'}</div>
              <div className="text-[10px] text-slate-500">Creator project launches</div>
            </div>
          </div>

          {/* Activity Feeds: Recent Activity & Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity Stream */}
            <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live System Activity</h3>
                </div>
                <span className="text-[10px] text-slate-500">Real-time Neon audit stream</span>
              </div>

              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No recent activity logged yet.</p>
                ) : (
                  recentActivity.map((act) => (
                    <div key={act.id} className="p-3 rounded-2xl bg-[#171c2b] border border-white/5 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{act.title}</div>
                        <div className="text-[11px] text-slate-400">{act.subtitle}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[10px] text-slate-400 block">
                          {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : 'Just now'}
                        </span>
                        <span className="text-[10px] text-cyan-300 font-mono uppercase">{act.badge}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Users</h3>
                </div>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2.5">
                {recentUsers.slice(0, 5).map((u) => (
                  <div key={u.id} className="p-3 rounded-2xl bg-[#171c2b] border border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.display_username} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {u.display_username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">{u.display_username}</div>
                        <div className="text-[11px] text-slate-400">{u.email || u.username}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-300 font-mono">{u.project_count || 0} projects</div>
                      <div className="text-[10px] text-cyan-400 uppercase font-mono">{u.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => {
                  setSearchUserQuery(e.target.value);
                  loadUsers(e.target.value);
                }}
                placeholder="Search users by email, name, or ID..."
                className="w-full bg-[#121622] text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {usersList.length} registered creator accounts
            </span>
          </div>

          {/* Users Table */}
          <div className="rounded-3xl bg-[#121622] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#171c2b] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">User</th>
                    <th className="py-3.5 px-4 font-semibold">Email</th>
                    <th className="py-3.5 px-4 font-semibold">Registered</th>
                    <th className="py-3.5 px-4 font-semibold">Role</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Projects</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.display_username} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                              {u.display_username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">{u.display_username}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        {u.email || <span className="text-slate-500 italic">No email</span>}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          u.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {u.project_count || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View details */}
                          <button
                            onClick={async () => {
                              try {
                                const details = await AdminService.getUser(u.id);
                                setSelectedUserDetail(details);
                              } catch (err) {
                                console.error('Failed to load user detail:', err);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            Details
                          </button>

                          {/* Toggle status (Suspend / Activate) */}
                          <button
                            onClick={async () => {
                              const nextStatus = u.status === 'active' ? 'suspended' : 'active';
                              try {
                                await AdminService.updateUserStatus(u.id, nextStatus);
                                showFeedback(`User status changed to ${nextStatus}`);
                                loadUsers(searchUserQuery);
                              } catch (err: any) {
                                showError(err.message || 'Failed to update user status');
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              u.status === 'active' 
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>

                          {/* Change role */}
                          <button
                            onClick={async () => {
                              const nextRole = u.role === 'admin' ? 'user' : 'admin';
                              try {
                                await AdminService.updateUserRole(u.id, nextRole);
                                showFeedback(`User role changed to ${nextRole}`);
                                loadUsers(searchUserQuery);
                              } catch (err: any) {
                                showError(err.message || 'Failed to update user role');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium transition-colors"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Detail Modal */}
          {selectedUserDetail && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#121622] border border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    {selectedUserDetail.user.avatar ? (
                      <img src={selectedUserDetail.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                        {selectedUserDetail.user.display_username.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedUserDetail.user.display_username}</h3>
                      <p className="text-xs text-slate-400 font-mono">{selectedUserDetail.user.email || selectedUserDetail.user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUserDetail(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#171c2b]">
                    <span className="text-slate-500 block text-[10px]">User ID</span>
                    <span className="font-mono text-white text-[11px] truncate block">{selectedUserDetail.user.id}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#171c2b]">
                    <span className="text-slate-500 block text-[10px]">Role</span>
                    <span className="font-mono text-cyan-300 uppercase font-bold">{selectedUserDetail.user.role}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#171c2b]">
                    <span className="text-slate-500 block text-[10px]">Status</span>
                    <span className="font-mono text-emerald-300">{selectedUserDetail.user.status}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#171c2b]">
                    <span className="text-slate-500 block text-[10px]">Provider</span>
                    <span className="font-mono text-white">{selectedUserDetail.user.auth_provider}</span>
                  </div>
                </div>

                {/* User's projects */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Created Projects ({selectedUserDetail.projects.length})
                  </h4>
                  {selectedUserDetail.projects.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">This user has not created any projects yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedUserDetail.projects.map((p) => (
                        <div key={p.id} className="p-3 rounded-xl bg-[#171c2b] border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-white">{p.title}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {p.type} • {p.aspect_ratio} • {p.duration}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedUserDetail(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEMPLATES MANAGEMENT */}
      {activeTab === 'templates' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Database Template Library</h2>
              <p className="text-xs text-slate-400">Curate and manage production templates for creators.</p>
            </div>

            <button
              onClick={() => {
                setEditingTemplate({
                  title: '',
                  description: '',
                  category: 'Trending',
                  aspect_ratio: '9:16',
                  duration: '15 seconds',
                  duration_seconds: 15,
                  media_slots: 3,
                  slots_metadata: [
                    { slotIndex: 0, label: 'Opening Hook', type: 'video', duration: '3.0s', suggested: 'High energy action' },
                    { slotIndex: 1, label: 'Beat Drop Hit', type: 'photo', duration: '4.0s', suggested: 'Clean portrait or subject' },
                    { slotIndex: 2, label: 'Outro Climax', type: 'video', duration: '8.0s', suggested: 'Grand finale shot' }
                  ],
                  thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
                  preview_video_url: 'https://assets.mixkit.co/videos/preview/mixkit-urban-fashion-model-in-neon-city-41551-large.mp4',
                  is_published: true,
                  is_featured: false
                });
                setTemplateSaveError(null);
                setIsTemplateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Template</span>
            </button>
          </div>

          {/* Templates Grid for Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templatesList.map((tpl) => (
              <div key={tpl.id} className="p-5 rounded-3xl bg-[#121622] border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="space-y-3">
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40">
                    <img src={tpl.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white text-[10px] font-mono">
                        {tpl.category}
                      </span>
                      {tpl.is_featured && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/80 text-black text-[10px] font-bold flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-black" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-slate-300 font-mono text-[10px]">
                      {tpl.aspect_ratio} • {tpl.duration}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{tpl.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{tpl.description}</p>
                  </div>

                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <span>{tpl.media_slots} media slots</span>
                    <span className="font-mono text-cyan-300">{tpl.usage_count} uses</span>
                    <span className={tpl.is_published ? 'text-emerald-400' : 'text-amber-400'}>
                      {tpl.is_published ? 'Published' : 'Unpublished'}
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {/* Toggle publish */}
                    <button
                      onClick={async () => {
                        try {
                          await AdminService.togglePublishTemplate(tpl.id, !tpl.is_published);
                          showFeedback(`Template ${tpl.is_published ? 'unpublished' : 'published'}`);
                          loadTemplates();
                        } catch (err: any) {
                          showError(err.message || 'Failed to update template status');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs"
                      title={tpl.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {tpl.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                    </button>

                    {/* Toggle featured */}
                    <button
                      onClick={async () => {
                        try {
                          await AdminService.toggleFeaturedTemplate(tpl.id, !tpl.is_featured);
                          showFeedback(`Template ${tpl.is_featured ? 'removed from featured' : 'marked as featured'}`);
                          loadTemplates();
                        } catch (err: any) {
                          showError(err.message || 'Failed to update featured flag');
                        }
                      }}
                      className={`p-1.5 rounded-lg text-xs ${tpl.is_featured ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                      title={tpl.is_featured ? 'Unmark featured' : 'Mark featured'}
                    >
                      <Star className={`w-4 h-4 ${tpl.is_featured ? 'fill-amber-300' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit template */}
                    <button
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setTemplateSaveError(null);
                        setIsTemplateModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete template */}
                    <button
                      onClick={async () => {
                        try {
                          await AdminService.deleteTemplate(tpl.id);
                          showFeedback('Template deleted');
                          loadTemplates();
                        } catch (err: any) {
                          showError(err.message || 'Failed to delete template');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Template Add/Edit Modal */}
          {isTemplateModalOpen && editingTemplate && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#121622] border border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-base font-bold text-white">
                    {editingTemplate.id ? 'Edit Template' : 'Add New Template'}
                  </h3>
                  <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {templateSaveError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/20">
                    {templateSaveError}
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={editingTemplate.title || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                      placeholder="e.g. Viral Velocity Beat Drop"
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={editingTemplate.description || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                      placeholder="Short overview of visual transitions, tempo, and style..."
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Category</label>
                      <select
                        value={editingTemplate.category || 'Trending'}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="Trending">Trending</option>
                        <option value="Beat Sync">Beat Sync</option>
                        <option value="Photo Transition">Photo Transition</option>
                        <option value="Love">Love</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Travel">Travel</option>
                        <option value="DJ">DJ</option>
                        <option value="Emotional">Emotional</option>
                        <option value="Festival">Festival</option>
                        <option value="Shorts">Shorts</option>
                        <option value="TikTok Style">TikTok Style</option>
                        <option value="Reels Style">Reels Style</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Aspect Ratio</label>
                      <select
                        value={editingTemplate.aspect_ratio || '9:16'}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, aspect_ratio: e.target.value })}
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="9:16">9:16 Vertical (Shorts/Reels)</option>
                        <option value="16:9">16:9 Landscape (YouTube)</option>
                        <option value="1:1">1:1 Square</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Media Slots</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={editingTemplate.media_slots || 3}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, media_slots: Number(e.target.value) })}
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Duration Label</label>
                      <input
                        type="text"
                        value={editingTemplate.duration || '15 seconds'}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, duration: e.target.value })}
                        placeholder="e.g. 15 seconds"
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Duration (Seconds)</label>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        value={editingTemplate.duration_seconds || 15}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, duration_seconds: Number(e.target.value) })}
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Thumbnail URL</label>
                    <input
                      type="text"
                      value={editingTemplate.thumbnail_url || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, thumbnail_url: e.target.value })}
                      placeholder="https://... or upload below"
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Reference / Preview Video URL</label>
                    <input
                      type="text"
                      value={editingTemplate.preview_video_url || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, preview_video_url: e.target.value })}
                      placeholder="https://... MP4 link"
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingTemplate.is_published)}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, is_published: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-600 bg-[#171c2b] border-white/20"
                      />
                      <span className="text-white font-semibold">Published</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingTemplate.is_featured)}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-600 bg-[#171c2b] border-white/20"
                      />
                      <span className="text-white font-semibold">Featured on Top</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingTemplate}
                    onClick={async () => {
                      if (!editingTemplate.title?.trim()) {
                        setTemplateSaveError('Title is required');
                        return;
                      }
                      setIsSavingTemplate(true);
                      setTemplateSaveError(null);
                      try {
                        if (editingTemplate.id) {
                          await AdminService.updateTemplate(editingTemplate.id, editingTemplate);
                          showFeedback('Template updated successfully');
                        } else {
                          await AdminService.createTemplate(editingTemplate);
                          showFeedback('New template created');
                        }
                        setIsTemplateModalOpen(false);
                        loadTemplates();
                      } catch (err: any) {
                        setTemplateSaveError(err.message || 'Failed to save template');
                      } finally {
                        setIsSavingTemplate(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    {isSavingTemplate ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: APPLICATION RELEASE & VERSION MANAGEMENT */}
      {activeTab === 'updates' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <Rocket className="w-3.5 h-3.5" />
                <span>RELEASE MANAGEMENT & AUTOMATION</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Application Release Dashboard</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Create future releases, schedule automated publishing, configure minimum supported versions, and deploy live updates.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingUpdate({
                  version: '1.2.0',
                  minimum_supported_version: '1.0.0',
                  title: '',
                  description: '',
                  release_notes: '- New AI Template Maker\n- Improved AI Creator Assistant\n- Studio performance improvements',
                  tag: 'New Feature',
                  image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
                  button_text: 'Try Now',
                  button_link: '/templates',
                  scheduled_at: null,
                  timezone: 'UTC',
                  is_required: false,
                  requires_sign_in: false,
                  is_featured: false,
                  status: 'draft',
                  is_published: false,
                  is_pinned: false
                });
                setUpdateSaveError(null);
                setIsUpdateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer w-fit shrink-0 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Release</span>
            </button>
          </div>

          {/* Release Overview Metrics Grid (Requirement 5) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-[#121622] border border-cyan-500/20 shadow-md">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider font-mono">Current Live</span>
              <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>v{releaseMetrics.currentLiveVersion}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Active for users</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-amber-500/20 shadow-md">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider font-mono">Latest Scheduled</span>
              <div className="text-xl font-black text-white mt-1 font-mono truncate">
                {releaseMetrics.latestScheduledVersion ? `v${releaseMetrics.latestScheduledVersion}` : 'None'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Upcoming release</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-indigo-500/20 shadow-md">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider font-mono">Upcoming</span>
              <div className="text-xl font-black text-white mt-1 font-mono">
                {releaseMetrics.upcomingReleasesCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Scheduled releases</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-emerald-500/20 shadow-md">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider font-mono">Published</span>
              <div className="text-xl font-black text-white mt-1 font-mono">
                {releaseMetrics.publishedReleasesCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Live updates</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121622] border border-slate-500/20 shadow-md col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Drafts</span>
              <div className="text-xl font-black text-white mt-1 font-mono">
                {releaseMetrics.draftReleasesCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Unpublished work</p>
            </div>
          </div>

          {/* Release Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5 text-xs">
            <button
              onClick={() => setReleaseFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                releaseFilter === 'all'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Releases ({updatesList.length})
            </button>
            <button
              onClick={() => setReleaseFilter('published')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                releaseFilter === 'published'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Published ({releaseMetrics.publishedReleasesCount})</span>
            </button>
            <button
              onClick={() => setReleaseFilter('scheduled')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                releaseFilter === 'scheduled'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming / Scheduled ({releaseMetrics.upcomingReleasesCount})</span>
            </button>
            <button
              onClick={() => setReleaseFilter('draft')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                releaseFilter === 'draft'
                  ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Drafts ({releaseMetrics.draftReleasesCount})</span>
            </button>
          </div>

          {/* Releases List */}
          <div className="space-y-3.5">
            {updatesList
              .filter(upd => {
                if (releaseFilter === 'published') return upd.is_published || upd.status === 'published';
                if (releaseFilter === 'scheduled') return upd.status === 'scheduled';
                if (releaseFilter === 'draft') return upd.status === 'draft' || (!upd.is_published && upd.status !== 'scheduled');
                return true;
              })
              .map((upd) => {
                const isScheduled = upd.status === 'scheduled';
                const isLive = upd.is_published || upd.status === 'published';
                const isDraft = upd.status === 'draft' || (!upd.is_published && !isScheduled);

                return (
                  <div 
                    key={upd.id} 
                    className={`p-5 rounded-3xl bg-[#121622] border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl ${
                      isLive ? 'border-emerald-500/20' : isScheduled ? 'border-amber-500/25' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {upd.image_url ? (
                        <img 
                          src={upd.image_url} 
                          alt="" 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-white/10" 
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                          <Rocket className="w-7 h-7" />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Badges strip */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            v{upd.version || '1.1.0'}
                          </span>

                          {/* Status Badge */}
                          {isLive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Live Published</span>
                            </span>
                          )}
                          {isScheduled && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Scheduled for {upd.scheduled_at ? new Date(upd.scheduled_at).toLocaleDateString() : 'Future Date'} ({upd.timezone || 'UTC'})</span>
                            </span>
                          )}
                          {isDraft && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-400 border border-white/10">
                              Draft
                            </span>
                          )}

                          {/* Requirement Badge */}
                          {upd.is_required ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              ⚠️ Required Update
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-400">
                              Optional
                            </span>
                          )}

                          {/* Google Sign-in Requirement */}
                          {upd.requires_sign_in && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Requires Google Sign-in</span>
                            </span>
                          )}

                          {/* Pinned Badge */}
                          {upd.is_pinned && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-amber-300" />
                              <span>Pinned Banner</span>
                            </span>
                          )}

                          {/* Featured Badge */}
                          {upd.is_featured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight">{upd.title}</h3>
                          <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">{upd.description}</p>
                        </div>

                        {/* Release Notes Preview */}
                        {upd.release_notes && (
                          <div className="text-[11px] text-slate-400 bg-black/25 p-2 rounded-xl border border-white/5 line-clamp-2 whitespace-pre-line font-mono">
                            {upd.release_notes}
                          </div>
                        )}

                        {/* Timing details */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                          {upd.published_at && (
                            <span>Published: {new Date(upd.published_at).toLocaleString()}</span>
                          )}
                          {upd.scheduled_at && (
                            <span className="text-amber-300">Scheduled: {new Date(upd.scheduled_at).toLocaleString()} ({upd.timezone || 'UTC'})</span>
                          )}
                          <span>Min Supported: v{upd.minimum_supported_version || '1.0.0'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions Bar (Requirement 5) */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5 w-full lg:w-auto justify-end">
                      {/* Quick Schedule Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setScheduleModalUpdate(upd);
                          const d = new Date();
                          d.setDate(d.getDate() + 15);
                          setScheduleDateInput(d.toISOString().split('T')[0]);
                          setScheduleTimeInput('10:00');
                          setScheduleTimezoneInput(upd.timezone || 'UTC');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Schedule Release Date & Time"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule</span>
                      </button>

                      {/* Toggle publish / unpublish */}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await AdminService.togglePublishUpdate(upd.id, !upd.is_published);
                            showFeedback(`Release ${upd.is_published ? 'unpublished' : 'published as live'}`);
                            loadUpdates();
                          } catch (err: any) {
                            showError(err.message || 'Failed to toggle release state');
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          upd.is_published 
                            ? 'bg-white/5 hover:bg-white/10 text-slate-300' 
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                        }`}
                        title={upd.is_published ? 'Unpublish' : 'Publish Live Now'}
                      >
                        {upd.is_published ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Publish Live</span>
                          </>
                        )}
                      </button>

                      {/* Toggle pin */}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await AdminService.togglePinUpdate(upd.id, !upd.is_pinned);
                            showFeedback(`Update ${upd.is_pinned ? 'unpinned' : 'pinned to top'}`);
                            loadUpdates();
                          } catch (err: any) {
                            showError(err.message || 'Failed to toggle pin');
                          }
                        }}
                        className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          upd.is_pinned ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                        title={upd.is_pinned ? 'Unpin' : 'Pin to Home Banner'}
                      >
                        <Star className={`w-4 h-4 ${upd.is_pinned ? 'fill-amber-300' : ''}`} />
                      </button>

                      {/* Edit update */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUpdate(upd);
                          setUpdateSaveError(null);
                          setIsUpdateModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete with Confirmation Modal */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmUpdate(upd)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete Release"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

            {updatesList.length === 0 && !isLoadingUpdates && (
              <div className="p-8 rounded-3xl bg-[#121622] border border-white/5 text-center space-y-3">
                <Rocket className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No releases configured yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Create your first application release or scheduled update using the button above.
                </p>
              </div>
            )}
          </div>

          {/* Quick Schedule Modal (Requirement 2) */}
          {scheduleModalUpdate && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#121622] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">Schedule Release</h3>
                      <p className="text-[11px] text-slate-400 font-mono">v{scheduleModalUpdate.version || '1.1.0'} - {scheduleModalUpdate.title}</p>
                    </div>
                  </div>
                  <button onClick={() => setScheduleModalUpdate(null)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Preset Quick Schedules */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Quick Presets</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[7, 15, 20, 30].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + days);
                            setScheduleDateInput(d.toISOString().split('T')[0]);
                          }}
                          className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-mono text-[11px] border border-white/10 text-center cursor-pointer transition-colors"
                        >
                          +{days} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Input */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Release Date</label>
                      <input
                        type="date"
                        value={scheduleDateInput}
                        onChange={(e) => setScheduleDateInput(e.target.value)}
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Release Time</label>
                      <input
                        type="time"
                        value={scheduleTimeInput}
                        onChange={(e) => setScheduleTimeInput(e.target.value)}
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Time Zone */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Time Zone</label>
                    <select
                      value={scheduleTimezoneInput}
                      onChange={(e) => setScheduleTimezoneInput(e.target.value)}
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="Asia/Kathmandu">Asia/Kathmandu (+05:45)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
                    💡 <strong>Automated Activation:</strong> When the scheduled date and time is reached, the system will automatically activate this release. You do not need to manually press publish again.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setScheduleModalUpdate(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isScheduling || !scheduleDateInput}
                    onClick={async () => {
                      if (!scheduleDateInput) return;
                      setIsScheduling(true);
                      try {
                        const scheduledDateTime = new Date(`${scheduleDateInput}T${scheduleTimeInput || '10:00'}:00Z`).toISOString();
                        await AdminService.scheduleUpdate(scheduleModalUpdate.id, scheduledDateTime, scheduleTimezoneInput);
                        showFeedback(`Release scheduled for ${scheduleDateInput} at ${scheduleTimeInput}`);
                        setScheduleModalUpdate(null);
                        loadUpdates();
                      } catch (err: any) {
                        showError(err.message || 'Failed to schedule release');
                      } finally {
                        setIsScheduling(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 text-white font-bold text-xs shadow-lg cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal (Requirement 5) */}
          {deleteConfirmUpdate && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#121622] border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Release?</h3>
                    <p className="text-xs text-slate-400">Confirmation Required</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to permanently delete release <strong>v{deleteConfirmUpdate.version || '1.1.0'} "{deleteConfirmUpdate.title}"</strong>? This destructive action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmUpdate(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await AdminService.deleteUpdate(deleteConfirmUpdate.id);
                        showFeedback('Release deleted');
                        setDeleteConfirmUpdate(null);
                        loadUpdates();
                      } catch (err: any) {
                        showError(err.message || 'Failed to delete release');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                  >
                    Delete Release
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create / Edit Release Modal (Requirement 1 & 5) */}
          {isUpdateModalOpen && editingUpdate && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#121622] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto text-left">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {editingUpdate.id ? 'Edit Release Configuration' : 'Create New Application Release'}
                    </h3>
                    <p className="text-xs text-slate-400">Configure versioning, release notes, scheduling, and user requirements.</p>
                  </div>
                  <button onClick={() => setIsUpdateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {updateSaveError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/20">
                    {updateSaveError}
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  {/* Version Numbers Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Release Version Number <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingUpdate.version || '1.1.0'}
                        onChange={(e) => setEditingUpdate({ ...editingUpdate, version: e.target.value })}
                        placeholder="e.g. 1.1.0, 1.2.0"
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Target version string shown to users</p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Minimum Supported Version
                      </label>
                      <input
                        type="text"
                        value={editingUpdate.minimum_supported_version || '1.0.0'}
                        onChange={(e) => setEditingUpdate({ ...editingUpdate, minimum_supported_version: e.target.value })}
                        placeholder="e.g. 1.0.0"
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Clients below this will be forced to update</p>
                    </div>
                  </div>

                  {/* Title & Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-semibold mb-1">
                        Update Title <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingUpdate.title || ''}
                        onChange={(e) => setEditingUpdate({ ...editingUpdate, title: e.target.value })}
                        placeholder='e.g. "AI Template Maker Update"'
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Category Tag</label>
                      <input
                        type="text"
                        value={editingUpdate.tag || 'New Feature'}
                        onChange={(e) => setEditingUpdate({ ...editingUpdate, tag: e.target.value })}
                        placeholder="e.g. Major Release"
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Short Description <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={editingUpdate.description || ''}
                      onChange={(e) => setEditingUpdate({ ...editingUpdate, description: e.target.value })}
                      placeholder="Brief overview of what this release introduces..."
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Detailed Release Notes */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Release Notes (Bullet Points)
                    </label>
                    <textarea
                      rows={4}
                      value={editingUpdate.release_notes || ''}
                      onChange={(e) => setEditingUpdate({ ...editingUpdate, release_notes: e.target.value })}
                      placeholder={`- New AI Template Maker\n- New Template Library\n- Improved AI Creator Assistant\n- Improved project management`}
                      className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none font-mono text-xs leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Shown in the "What's New" modal to users</p>
                  </div>

                  {/* Image URL & Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Image URL (Optional)</label>
                      <input
                        type="text"
                        value={editingUpdate.image_url || ''}
                        onChange={(e) => setEditingUpdate({ ...editingUpdate, image_url: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Call-To-Action Link</label>
                      <input
                        type="text"
                        value={editingUpdate.button_link || '/templates'}
                        onChange={(e) => setEditingUpdate({ ...editingUpdate, button_link: e.target.value })}
                        placeholder="/templates or target route"
                        className="w-full bg-[#171c2b] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Scheduled Release Config (Requirement 1 & 2) */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Scheduling (Optional Future Release)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Schedule Date</label>
                        <input
                          type="date"
                          value={editingUpdate.scheduled_at ? new Date(editingUpdate.scheduled_at).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const existingTime = editingUpdate.scheduled_at ? new Date(editingUpdate.scheduled_at).toISOString().split('T')[1] : '10:00:00.000Z';
                              setEditingUpdate({ ...editingUpdate, scheduled_at: `${val}T${existingTime}` });
                            } else {
                              setEditingUpdate({ ...editingUpdate, scheduled_at: null });
                            }
                          }}
                          className="w-full bg-[#171c2b] text-white px-2.5 py-1.5 rounded-xl border border-white/10 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Schedule Time</label>
                        <input
                          type="time"
                          defaultValue="10:00"
                          onChange={(e) => {
                            const t = e.target.value;
                            const existingDate = editingUpdate.scheduled_at ? new Date(editingUpdate.scheduled_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                            setEditingUpdate({ ...editingUpdate, scheduled_at: `${existingDate}T${t}:00.000Z` });
                          }}
                          className="w-full bg-[#171c2b] text-white px-2.5 py-1.5 rounded-xl border border-white/10 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Time Zone</label>
                        <select
                          value={editingUpdate.timezone || 'UTC'}
                          onChange={(e) => setEditingUpdate({ ...editingUpdate, timezone: e.target.value })}
                          className="w-full bg-[#171c2b] text-white px-2.5 py-1.5 rounded-xl border border-white/10 text-xs"
                        >
                          <option value="UTC">UTC</option>
                          <option value="Asia/Kathmandu">Asia/Kathmandu</option>
                          <option value="America/New_York">America/New_York</option>
                          <option value="Europe/London">Europe/London</option>
                          <option value="Asia/Tokyo">Asia/Tokyo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Requirements & Feature Switches */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Optional vs Required */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <span className="block font-semibold text-white">Update Enforcement Type:</span>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="update_type"
                            checked={!editingUpdate.is_required}
                            onChange={() => setEditingUpdate({ ...editingUpdate, is_required: false })}
                            className="text-cyan-600"
                          />
                          <span className="text-slate-300">Optional Update (User can choose "Later")</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="update_type"
                            checked={Boolean(editingUpdate.is_required)}
                            onChange={() => setEditingUpdate({ ...editingUpdate, is_required: true })}
                            className="text-amber-500"
                          />
                          <span className="text-amber-300 font-semibold">⚠️ Required Update (Non-dismissible)</span>
                        </label>
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <span className="block font-semibold text-white">Access & Promotion:</span>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingUpdate.requires_sign_in)}
                            onChange={(e) => setEditingUpdate({ ...editingUpdate, requires_sign_in: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 bg-[#171c2b] border-white/20"
                          />
                          <span className="text-slate-300">Requires Google Sign-in to access</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingUpdate.is_featured)}
                            onChange={(e) => setEditingUpdate({ ...editingUpdate, is_featured: e.target.checked })}
                            className="w-4 h-4 rounded text-violet-600 bg-[#171c2b] border-white/20"
                          />
                          <span className="text-slate-300">Mark as Featured Release</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingUpdate.is_pinned)}
                            onChange={(e) => setEditingUpdate({ ...editingUpdate, is_pinned: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 bg-[#171c2b] border-white/20"
                          />
                          <span className="text-slate-300">Pin to Homepage Announcement Bar</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Save as Draft */}
                    <button
                      type="button"
                      disabled={isSavingUpdate}
                      onClick={async () => {
                        if (!editingUpdate.title?.trim() || !editingUpdate.description?.trim()) {
                          setUpdateSaveError('Title and description are required');
                          return;
                        }
                        setIsSavingUpdate(true);
                        setUpdateSaveError(null);
                        try {
                          const payload = {
                            ...editingUpdate,
                            status: 'draft',
                            is_published: false
                          };
                          if (editingUpdate.id) {
                            await AdminService.updateUpdate(editingUpdate.id, payload);
                            showFeedback('Saved as draft');
                          } else {
                            await AdminService.createUpdate(payload);
                            showFeedback('New release draft saved');
                          }
                          setIsUpdateModalOpen(false);
                          loadUpdates();
                        } catch (err: any) {
                          setUpdateSaveError(err.message || 'Failed to save draft');
                        } finally {
                          setIsSavingUpdate(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Save Draft
                    </button>

                    {/* Schedule Release */}
                    {editingUpdate.scheduled_at && (
                      <button
                        type="button"
                        disabled={isSavingUpdate}
                        onClick={async () => {
                          if (!editingUpdate.title?.trim() || !editingUpdate.description?.trim()) {
                            setUpdateSaveError('Title and description are required');
                            return;
                          }
                          setIsSavingUpdate(true);
                          setUpdateSaveError(null);
                          try {
                            const payload = {
                              ...editingUpdate,
                              status: 'scheduled',
                              is_published: false
                            };
                            if (editingUpdate.id) {
                              await AdminService.updateUpdate(editingUpdate.id, payload);
                              showFeedback('Release scheduled');
                            } else {
                              await AdminService.createUpdate(payload);
                              showFeedback('New release scheduled');
                            }
                            setIsUpdateModalOpen(false);
                            loadUpdates();
                          } catch (err: any) {
                            setUpdateSaveError(err.message || 'Failed to schedule release');
                          } finally {
                            setIsSavingUpdate(false);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Release</span>
                      </button>
                    )}

                    {/* Publish Immediately */}
                    <button
                      type="button"
                      disabled={isSavingUpdate}
                      onClick={async () => {
                        if (!editingUpdate.title?.trim() || !editingUpdate.description?.trim()) {
                          setUpdateSaveError('Title and description are required');
                          return;
                        }
                        setIsSavingUpdate(true);
                        setUpdateSaveError(null);
                        try {
                          const payload = {
                            ...editingUpdate,
                            status: 'published',
                            is_published: true
                          };
                          if (editingUpdate.id) {
                            await AdminService.updateUpdate(editingUpdate.id, payload);
                            showFeedback('Release published live');
                          } else {
                            await AdminService.createUpdate(payload);
                            showFeedback('New release published live');
                          }
                          setIsUpdateModalOpen(false);
                          loadUpdates();
                        } catch (err: any) {
                          setUpdateSaveError(err.message || 'Failed to publish release');
                        } finally {
                          setIsSavingUpdate(false);
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Publish Live Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SYSTEM & DATABASE (ADMIN-ONLY TECHNICAL AUDIT) */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-[#121622] border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Technical Architecture & Database Diagnostics (Admin View Only)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono text-[10px] border border-cyan-500/20">
                Hidden From Normal Users
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Per studio security guidelines, technical connection parameters, SQL database provider names, and internal credentials are never visible to regular creators. Below is your live administrator diagnostics summary:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold block">Primary Database</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Provider:</span>
                  <span className="text-cyan-300 font-mono">Neon Serverless PostgreSQL</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Connected
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">SSL / Encryption:</span>
                  <span className="text-slate-300 font-mono">require (TLS 1.3)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold block">Authentication Architecture</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Provider:</span>
                  <span className="text-indigo-300 font-mono">Google OAuth 2.0 Web Client</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Session Token:</span>
                  <span className="text-slate-300 font-mono">SHA-256 HttpOnly Cookie</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">RBAC Security:</span>
                  <span className="text-emerald-400 font-mono">Server-Enforced (users.role)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold block">Storage Abstraction</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Upload Handler:</span>
                  <span className="text-slate-300 font-mono">/api/admin/upload</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Vercel Blob:</span>
                  <span className="text-amber-300 font-mono">Optional Token Ready</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">Database Persistence:</span>
                  <span className="text-cyan-300 font-mono">Metadata Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
