import { DbTemplate, StudioUpdate } from '../types';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  renderedVideos: number;
  totalTemplates: number;
  totalTemplateUsage: number;
}

export interface AdminUser {
  id: string;
  username: string;
  display_username: string;
  email: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar: string | null;
  auth_provider: string;
  created_at: string;
  updated_at: string;
  project_count: number;
}

export interface AdminActivity {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  badge: string;
}

export class AdminService {
  /**
   * Fetch aggregate admin statistics and recent logs
   */
  static async getStats(): Promise<{
    stats: AdminStats;
    recentUsers: AdminUser[];
    recentProjects: any[];
    recentActivity: AdminActivity[];
  }> {
    const res = await fetch('/api/admin/stats', {
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch admin stats (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      stats: data.stats,
      recentUsers: data.recentUsers || [],
      recentProjects: data.recentProjects || [],
      recentActivity: data.recentActivity || []
    };
  }

  /**
   * Search and list registered users
   */
  static async getUsers(queryParam = ''): Promise<AdminUser[]> {
    const q = queryParam ? `?q=${encodeURIComponent(queryParam)}` : '';
    const res = await fetch(`/api/admin/users${q}`, {
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to query users (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.users || [];
  }

  /**
   * Get single user details and their associated projects
   */
  static async getUser(userId: string): Promise<{ user: AdminUser; projects: any[] }> {
    const res = await fetch(`/api/admin/users/${userId}`, {
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to load user (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      user: data.user,
      projects: data.projects || []
    };
  }

  /**
   * Toggle user status (active / suspended)
   */
  static async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update status (HTTP ${res.status})`);
    }
  }

  /**
   * Update user role (user / admin)
   */
  static async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to change role (HTTP ${res.status})`);
    }
  }

  /**
   * List all templates (including unpublished) for admin management
   */
  static async getTemplates(): Promise<DbTemplate[]> {
    const res = await fetch('/api/admin/templates', {
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch admin templates (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.templates || [];
  }

  /**
   * Create new template
   */
  static async createTemplate(templateData: Partial<DbTemplate>): Promise<DbTemplate> {
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(templateData)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create template (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.template;
  }

  /**
   * Update existing template
   */
  static async updateTemplate(templateId: string, templateData: Partial<DbTemplate>): Promise<DbTemplate> {
    const res = await fetch(`/api/admin/templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(templateData)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update template (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.template;
  }

  /**
   * Delete template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    const res = await fetch(`/api/admin/templates/${templateId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete template (HTTP ${res.status})`);
    }
  }

  /**
   * Toggle template publish state
   */
  static async togglePublishTemplate(templateId: string, is_published: boolean): Promise<DbTemplate> {
    const res = await fetch(`/api/admin/templates/${templateId}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ is_published })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to toggle publish (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.template;
  }

  /**
   * Toggle template featured state
   */
  static async toggleFeaturedTemplate(templateId: string, is_featured: boolean): Promise<DbTemplate> {
    const res = await fetch(`/api/admin/templates/${templateId}/featured`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ is_featured })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to toggle featured (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.template;
  }

  /**
   * List all studio announcements & updates
   */
  /**
   * List all updates and releases with release dashboard metrics
   */
  static async getUpdates(): Promise<StudioUpdate[]> {
    const res = await fetch('/api/admin/updates', {
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to load updates (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.updates || [];
  }

  static async getUpdatesWithMetrics(): Promise<{
    updates: StudioUpdate[];
    metrics?: {
      currentLiveVersion: string;
      latestScheduledVersion: string | null;
      upcomingReleasesCount: number;
      publishedReleasesCount: number;
      draftReleasesCount: number;
    };
  }> {
    const res = await fetch('/api/admin/updates', {
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to load updates (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      updates: data.updates || [],
      metrics: data.metrics
    };
  }

  /**
   * Schedule update for future date and time
   */
  static async scheduleUpdate(updateId: string, scheduled_at: string, timezone: string = 'UTC'): Promise<StudioUpdate> {
    const res = await fetch(`/api/admin/updates/${updateId}/schedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ scheduled_at, timezone })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to schedule update (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.update;
  }

  /**
   * Create studio update
   */
  static async createUpdate(updateData: Partial<StudioUpdate>): Promise<StudioUpdate> {
    const res = await fetch('/api/admin/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updateData)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create update (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.update;
  }

  /**
   * Update announcement
   */
  static async updateUpdate(updateId: string, updateData: Partial<StudioUpdate>): Promise<StudioUpdate> {
    const res = await fetch(`/api/admin/updates/${updateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updateData)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update record (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.update;
  }

  /**
   * Delete update
   */
  static async deleteUpdate(updateId: string): Promise<void> {
    const res = await fetch(`/api/admin/updates/${updateId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete update (HTTP ${res.status})`);
    }
  }

  /**
   * Toggle update publish
   */
  static async togglePublishUpdate(updateId: string, is_published: boolean): Promise<StudioUpdate> {
    const res = await fetch(`/api/admin/updates/${updateId}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ is_published })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to toggle publish (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.update;
  }

  /**
   * Toggle update pin
   */
  static async togglePinUpdate(updateId: string, is_pinned: boolean): Promise<StudioUpdate> {
    const res = await fetch(`/api/admin/updates/${updateId}/pin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ is_pinned })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to toggle pin (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.update;
  }

  /**
   * Storage abstraction upload for thumbnails/preview videos
   */
  static async uploadAsset(dataUrl: string, filename?: string, mimeType?: string): Promise<string> {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ dataUrl, filename, mimeType })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to upload file (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.url;
  }
}
