/**
 * Client-Side Authentication Service
 * Communicates with custom server-side authentication backend.
 * Sessions are securely managed via HttpOnly cookies and in-memory tokens.
 * Passwords and authentication secrets are NEVER stored in localStorage.
 */

export interface SafeUser {
  id: string; // Unique immutable user ID
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
  avatar?: string;
}

// In-memory token storage (ephemeral - strictly never in localStorage)
let inMemoryToken: string | null = null;

export function setMemoryToken(token: string | null): void {
  inMemoryToken = token;
}

export function getMemoryToken(): string | null {
  return inMemoryToken;
}

export function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (inMemoryToken) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }
  return headers;
}

export const AuthApiClient = {
  /**
   * Register with ONLY username and password
   */
  async register(username: string, password: string): Promise<SafeUser> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Includes HttpOnly session cookie
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    if (data.token) {
      setMemoryToken(data.token);
    }
    return data.user;
  },

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<SafeUser> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.token) {
      setMemoryToken(data.token);
    }
    return data.user;
  },

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
    } finally {
      setMemoryToken(null);
    }
  },

  /**
   * Verify existing authenticated session on page load
   */
  async getSession(): Promise<SafeUser | null> {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.authenticated ? data.user : null;
    } catch {
      return null;
    }
  }
};
