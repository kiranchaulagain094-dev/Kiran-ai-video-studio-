import { Project } from '../types';

export interface AuthUser {
  id: string;
  username: string;
  display_username: string;
  email: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar: string | null;
  auth_provider?: string;
}

export interface AuthConfig {
  isConfigured: boolean;
  googleOAuth: boolean;
  database: boolean;
}

export class AuthClient {
  /**
   * Fetch auth configuration (Google OAuth and Neon status)
   */
  static async getAuthConfig(): Promise<AuthConfig> {
    try {
      const res = await fetch('/api/auth/config', { credentials: 'include' });
      if (!res.ok) {
        return { isConfigured: false, googleOAuth: false, database: false };
      }
      const data = await res.json();
      return {
        isConfigured: Boolean(data.isConfigured),
        googleOAuth: Boolean(data.googleOAuth),
        database: Boolean(data.database)
      };
    } catch (e) {
      console.error('Failed to get auth config:', e);
      return { isConfigured: false, googleOAuth: false, database: false };
    }
  }

  /**
   * Fetch currently authenticated user session
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.success && data.user) {
        return data.user as AuthUser;
      }
      return null;
    } catch (e) {
      console.error('Failed to get authenticated user:', e);
      return null;
    }
  }

  /**
   * Redirect to Google OAuth authorization endpoint
   */
  static loginWithGoogle(): void {
    window.location.href = '/api/auth/google';
  }

  /**
   * Terminate user session
   */
  static async logout(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return res.ok;
    } catch (e) {
      console.error('Logout error:', e);
      return false;
    }
  }

  // ==========================================
  // Neon PostgreSQL Projects API
  // ==========================================

  /**
   * Fetch projects for currently logged-in user from Neon database
   */
  static async getProjects(): Promise<{ success: boolean; projects?: Project[]; error?: string }> {
    try {
      const res = await fetch('/api/projects', { credentials: 'include' });
      if (res.status === 401) {
        return { success: false, error: 'unauthenticated' };
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to fetch projects.' };
      }
      return { success: true, projects: data.projects };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error fetching projects.' };
    }
  }

  /**
   * Save a project in Neon for the authenticated user
   */
  static async saveProject(project: Project): Promise<{ success: boolean; project?: Project; error?: string }> {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(project)
      });
      if (res.status === 401) {
        return { success: false, error: 'unauthenticated' };
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to save project.' };
      }
      return { success: true, project: data.project };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error saving project.' };
    }
  }

  /**
   * Update a project in Neon
   */
  static async updateProject(id: string, project: Partial<Project>): Promise<{ success: boolean; project?: Project; error?: string }> {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(project)
      });
      if (res.status === 401) {
        return { success: false, error: 'unauthenticated' };
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update project.' };
      }
      return { success: true, project: data.project };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error updating project.' };
    }
  }

  /**
   * Delete a project from Neon
   */
  static async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.status === 401) {
        return { success: false, error: 'unauthenticated' };
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to delete project.' };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error deleting project.' };
    }
  }
}
