import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Video, 
  Film, 
  DownloadCloud, 
  Activity, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight, 
  Megaphone, 
  Trash2, 
  Plus, 
  Lock,
  Search,
  Server,
  ExternalLink,
  RefreshCw,
  Music,
  Sparkles,
  Radio,
  Check,
  Edit3
} from 'lucide-react';
import { User, AdminStats, Announcement, AdminUsageControl, ConnectedYouTubeChannel } from '../../types';
import { StudioApiService } from '../../services/api';
import { auth } from '../../lib/firebase';

interface AdminPanelProps {
  currentUser: User | null;
  isAdmin?: boolean;
  onAnnouncementsUpdated?: () => void;
  onReturnToDashboard?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser, 
  isAdmin = false,
  onAnnouncementsUpdated,
  onReturnToDashboard 
}) => {
  // Strictly rely on server-verified admin authorization
  const isAuthorizedAdmin = Boolean(isAdmin);

  const [stats, setStats] = useState<AdminStats>(StudioApiService.getAdminStats());
  const [users, setUsers] = useState<User[]>(StudioApiService.getUsers());
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    StudioApiService.getAnnouncements()
  );
  const [usageControl, setUsageControl] = useState<AdminUsageControl>(
    StudioApiService.getUsageControl()
  );
  const [usageSavedFeedback, setUsageSavedFeedback] = useState(false);

  // Official Admin YouTube Channel State
  const [ytChannel, setYtChannel] = useState<ConnectedYouTubeChannel>(
    StudioApiService.getAdminYouTubeChannel()
  );
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [channelUrlInput, setChannelUrlInput] = useState(ytChannel.url);
  const [isSyncingChannel, setIsSyncingChannel] = useState(false);
  const [channelSavedFeedback, setChannelSavedFeedback] = useState(false);

  const handleSyncChannel = async () => {
    setIsSyncingChannel(true);
    try {
      const updated = await StudioApiService.syncAdminYouTubeChannel(channelUrlInput);
      setYtChannel(updated);
      setChannelSavedFeedback(true);
      setTimeout(() => setChannelSavedFeedback(false), 3000);
      setIsEditingChannel(false);
    } catch (err) {
      console.error('Failed to sync channel', err);
    } finally {
      setIsSyncingChannel(false);
    }
  };

  // New announcement form
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerMessage, setNewBannerMessage] = useState('');
  const [newBannerType, setNewBannerType] = useState<'info' | 'warning' | 'success'>('info');

  useEffect(() => {
    // Fetch from the secure admin API using verified Firebase token
    const fetchSecureStats = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch secure admin stats', err);
      }
    };
    if (isAuthorizedAdmin) {
      fetchSecureStats();
    }
  }, [isAuthorizedAdmin]);

  const [searchUser, setSearchUser] = useState('');

  const handleToggleMaintenance = () => {
    const updated = StudioApiService.toggleMaintenanceMode();
    setStats({ ...stats, maintenanceMode: updated });
  };

  const handleToggleUserStatus = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Suspended' : 'Active';
    StudioApiService.updateUserStatus(userId, newStatus);
    setUsers(StudioApiService.getUsers());
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim() || !newBannerMessage.trim()) return;

    StudioApiService.addAnnouncement({
      title: newBannerTitle,
      message: newBannerMessage,
      type: newBannerType
    });
    setAnnouncements(StudioApiService.getAnnouncements());
    setNewBannerTitle('');
    setNewBannerMessage('');
    if (onAnnouncementsUpdated) onAnnouncementsUpdated();
  };

  const handleDeleteAnnouncement = (id: string) => {
    StudioApiService.deleteAnnouncement(id);
    setAnnouncements(StudioApiService.getAnnouncements());
    if (onAnnouncementsUpdated) onAnnouncementsUpdated();
  };

  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#121622] border border-rose-500/20 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase tracking-wider">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-xl font-bold text-white">Unauthorized Access</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This console is restricted strictly to verified Kiran AI Video Studio administrators. Your account does not have administrative privileges.
          </p>
        </div>

        {onReturnToDashboard && (
          <button
            onClick={onReturnToDashboard}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
          >
            Return to Studio Dashboard
          </button>
        )}
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrative Console (Privileged)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Studio Admin Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform metrics, user access management, server health, and user banner broadcasts.
          </p>
        </div>

        {/* Maintenance mode toggle switch */}
        <div className="flex items-center gap-3 bg-[#121622] p-3 rounded-2xl border border-white/10">
          <div className="text-right">
            <p className="text-xs font-bold text-white">Maintenance Mode</p>
            <p className="text-[10px] text-slate-400">
              {stats.maintenanceMode ? 'ACTIVE (Users Blocked)' : 'DISABLED (Normal Operations)'}
            </p>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className={`p-1.5 rounded-xl transition-colors ${
              stats.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-[#181e2b] text-slate-400'
            }`}
          >
            {stats.maintenanceMode ? (
              <ToggleRight className="w-6 h-6" />
            ) : (
              <ToggleLeft className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.totalUsers}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">+18% this week</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Videos Generated</span>
            <Video className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.totalVideosGenerated}</p>
          <span className="text-[10px] text-cyan-400 font-semibold">Multi-scene productions</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Shorts Generated</span>
            <Film className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.totalShortsGenerated}</p>
          <span className="text-[10px] text-violet-400 font-semibold">9:16 Vertical formats</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Exports</span>
            <DownloadCloud className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.totalExports}</p>
          <span className="text-[10px] text-amber-400 font-semibold">1080p & 4K renders</span>
        </div>
      </div>

      {/* System Status & API Connection Status */}
      <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>System & API Services Health</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gemini AI Engine:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                {stats.apiConnectionStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Gemini 2.5 Flash / Pro Multimodal</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Express Studio Core:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                Operational
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Port 3000 Ingress Proxy Ready</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Rendering Service:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                Modular Standby
              </span>
            </div>
            <p className="text-[11px] text-slate-500">FFmpeg / Veo Provider Hooked</p>
          </div>
        </div>
      </div>

      {/* Official Admin YouTube Channel Connection Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#141926] via-[#121622] to-[#181119] border border-red-500/30 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold uppercase tracking-wider border border-red-500/30">
                  Official Connected Channel
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Check className="w-3 h-3" /> Admin Verified
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                <span>{ytChannel.channelName}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">{ytChannel.handle}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={ytChannel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <span>Visit on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleSyncChannel}
              disabled={isSyncingChannel}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all text-xs flex items-center gap-1.5"
              title="Sync & Verify Channel"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingChannel ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={() => setIsEditingChannel(!isEditingChannel)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all text-xs flex items-center gap-1.5"
              title="Edit Channel URL"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit URL</span>
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {channelSavedFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Admin YouTube Channel successfully verified and synchronized with Kiran AI Video Studio!</span>
          </div>
        )}

        {/* Channel Editing Form */}
        {isEditingChannel && (
          <div className="p-4 rounded-2xl bg-[#0e121c] border border-red-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Update Admin YouTube Channel URL
              </label>
              <span className="text-[10px] text-slate-400">Supports channel link with @handle</span>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={channelUrlInput}
                onChange={(e) => setChannelUrlInput(e.target.value)}
                placeholder="https://youtube.com/@kiranaimusic-94"
                className="flex-1 bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={handleSyncChannel}
                disabled={isSyncingChannel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
              >
                Save & Connect
              </button>
              <button
                onClick={() => {
                  setChannelUrlInput(ytChannel.url);
                  setIsEditingChannel(false);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Channel Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Direct Channel URL</span>
            <p className="text-slate-200 font-mono text-[11px] truncate">{ytChannel.url}</p>
            <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Real Admin Channel Active</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Channel Identity & Focus</span>
            <p className="text-slate-200 font-medium">{ytChannel.description}</p>
            <p className="text-[10px] text-red-300 font-semibold">Category: {ytChannel.category}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Admin Authorized By</span>
            <p className="text-white font-bold">{ytChannel.connectedEmail}</p>
            <p className="text-[10px] text-slate-400">
              Connected: {new Date(ytChannel.connectedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Channel Featured Playlists */}
        {ytChannel.featuredPlaylists && (
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-red-400" />
              <span>Catalog Playlists Linked with Studio Music Video Planner</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {ytChannel.featuredPlaylists.map((pl, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#181e2e] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300 font-medium truncate">{pl.title}</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-mono font-bold shrink-0 ml-2">
                    {pl.count} tracks
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Management Table */}
      <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Directory</h3>
            <p className="text-xs text-slate-400">Manage account privileges and access states</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search user..."
              className="w-full bg-[#171c2b] text-xs text-white rounded-xl pl-9 pr-3 py-1.5 border border-white/5 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Videos Created</th>
                <th className="py-2.5 px-3">Join Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'Admin' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{u.videosGenerated}</td>
                  <td className="py-3 px-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Limits & Quota Control */}
      <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                System Usage Limits & Quota Controls
              </h3>
              <p className="text-xs text-slate-400">Configure operational thresholds and user tier quotas</p>
            </div>
          </div>

          {usageSavedFeedback && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" /> Quota limits updated!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1.5">
            <label className="block text-slate-400 font-semibold">Daily AI Generations / User</label>
            <input
              type="number"
              min="1"
              max="500"
              value={usageControl.dailyAIGenerations}
              onChange={(e) => setUsageControl({ ...usageControl, dailyAIGenerations: Number(e.target.value) })}
              className="w-full bg-[#11141e] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Maximum daily video & script calls</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1.5">
            <label className="block text-slate-400 font-semibold">Monthly AI Generations</label>
            <input
              type="number"
              min="10"
              max="5000"
              value={usageControl.monthlyAIGenerations}
              onChange={(e) => setUsageControl({ ...usageControl, monthlyAIGenerations: Number(e.target.value) })}
              className="w-full bg-[#11141e] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Monthly aggregate per creator</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1.5">
            <label className="block text-slate-400 font-semibold">Max Video Duration (Seconds)</label>
            <input
              type="number"
              min="15"
              max="600"
              value={usageControl.maxVideoDurationSec}
              onChange={(e) => setUsageControl({ ...usageControl, maxVideoDurationSec: Number(e.target.value) })}
              className="w-full bg-[#11141e] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">180s = 3 minutes standard limit</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1.5">
            <label className="block text-slate-400 font-semibold">Max Export Resolution</label>
            <select
              value={usageControl.maxExportResolution}
              onChange={(e) => setUsageControl({ ...usageControl, maxExportResolution: e.target.value as any })}
              className="w-full bg-[#11141e] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
            >
              <option value="720p">720p HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="4K">4K Ultra HD</option>
            </select>
            <span className="text-[10px] text-slate-500">Platform render profile ceiling</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1.5">
            <label className="block text-slate-400 font-semibold">Storage Quota Per User (MB)</label>
            <input
              type="number"
              min="500"
              max="20480"
              value={usageControl.storageLimitMB}
              onChange={(e) => setUsageControl({ ...usageControl, storageLimitMB: Number(e.target.value) })}
              className="w-full bg-[#11141e] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">5120 MB = 5 GB Pro plan tier</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#171c2b] border border-white/5 space-y-1.5">
            <label className="block text-slate-400 font-semibold">Shorts Generation Limit</label>
            <input
              type="number"
              min="10"
              max="500"
              value={usageControl.shortsGenerationLimit}
              onChange={(e) => setUsageControl({ ...usageControl, shortsGenerationLimit: Number(e.target.value) })}
              className="w-full bg-[#11141e] text-white px-3 py-2 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Monthly 9:16 vertical video renders</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              StudioApiService.saveUsageControl(usageControl);
              setUsageSavedFeedback(true);
              setTimeout(() => setUsageSavedFeedback(false), 3000);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Quota Controls</span>
          </button>
        </div>
      </div>

      {/* Announcement / Banner Manager */}
      <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Studio Broadcast Banners
            </h3>
          </div>
        </div>

        {/* Existing announcements list */}
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-3 rounded-2xl bg-[#171c2b] border border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-white">{ann.title}</strong>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 uppercase">
                    {ann.type}
                  </span>
                </div>
                <p className="text-slate-400 mt-0.5">{ann.message}</p>
              </div>

              <button
                onClick={() => handleDeleteAnnouncement(ann.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400"
                title="Remove Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* New announcement form */}
        <form onSubmit={handleAddAnnouncement} className="p-4 rounded-2xl bg-[#0f121a] border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase">Publish New Announcement</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newBannerTitle}
              onChange={(e) => setNewBannerTitle(e.target.value)}
              placeholder="Banner title"
              className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none"
              required
            />
            <input
              type="text"
              value={newBannerMessage}
              onChange={(e) => setNewBannerMessage(e.target.value)}
              placeholder="Message shown to all users"
              className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none"
              required
            />
            <select
              value={newBannerType}
              onChange={(e) => setNewBannerType(e.target.value as any)}
              className="w-full bg-[#171c2b] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none"
            >
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Yellow)</option>
              <option value="success">Success (Green)</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Broadcast Banner</span>
          </button>
        </form>
      </div>
    </div>
  );
};
