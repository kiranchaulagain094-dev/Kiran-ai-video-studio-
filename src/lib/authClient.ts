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
  recaptcha?: {
    isConfigured: boolean;
    siteKey: string;
  };
}

export class AuthClient {
  /**
   * Fetch auth configuration (Google OAuth, Neon status, and reCAPTCHA)
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
        database: Boolean(data.database),
        recaptcha: data.recaptcha
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

  /**
   * Register a new account with email and password
   */
  static async signup(params: {
    email: string;
    password: string;
    display_username?: string;
    recaptchaToken?: string;
  }): Promise<{ success: boolean; message?: string; error?: string; email?: string }> {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed.' };
      }
      return { success: true, message: data.message, email: data.email };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error during registration.' };
    }
  }

  /**
   * Verify 6-digit OTP code sent to user email
   */
  static async verifyOtp(params: {
    email: string;
    code: string;
    purpose?: 'signup_verification' | 'password_reset';
    recaptchaToken?: string;
  }): Promise<{ success: boolean; message?: string; error?: string; user?: AuthUser }> {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Verification failed.' };
      }
      return { success: true, message: data.message, user: data.user };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error during verification.' };
    }
  }

  /**
   * Request a fresh 6-digit OTP code (subject to 60s cooldown)
   */
  static async resendOtp(params: {
    email: string;
    purpose?: 'signup_verification' | 'password_reset';
    recaptchaToken?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to resend code.' };
      }
      return { success: true, message: data.message };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error resending code.' };
    }
  }

  /**
   * Log in with email and password
   */
  static async loginWithEmail(params: {
    email: string;
    password: string;
    recaptchaToken?: string;
  }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    user?: AuthUser;
    requiresVerification?: boolean;
    email?: string;
  }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Login failed.',
          requiresVerification: Boolean(data.requiresVerification),
          email: data.email
        };
      }
      return { success: true, message: data.message, user: data.user };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error during login.' };
    }
  }

  /**
   * Request password reset 6-digit code
   */
  static async forgotPassword(params: {
    email: string;
    recaptchaToken?: string;
  }): Promise<{ success: boolean; message?: string; error?: string; email?: string }> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to process request.' };
      }
      return { success: true, message: data.message, email: data.email };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error during password reset request.' };
    }
  }

  /**
   * Submit 6-digit recovery code and set new password
   */
  static async resetPassword(params: {
    email: string;
    code: string;
    newPassword: string;
    recaptchaToken?: string;
  }): Promise<{ success: boolean; message?: string; error?: string; user?: AuthUser }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to reset password.' };
      }
      return { success: true, message: data.message, user: data.user };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error setting new password.' };
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
