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

/**
 * Safely parses response from server, ensuring non-JSON or HTML server errors
 * (e.g., from Vercel 500/502/504) never throw raw SyntaxError exceptions.
 */
async function parseResponseSafely(res: Response, fallbackErrorMsg: string): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  let rawText = '';
  try {
    rawText = await res.text();
  } catch (readErr) {
    throw new Error('Unable to read response from authentication server.');
  }

  let data: any = null;
  const isJsonCandidate = contentType.includes('application/json') || 
    rawText.trim().startsWith('{') || 
    rawText.trim().startsWith('[');

  if (isJsonCandidate && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    // If structured JSON error returned
    if (data && typeof data === 'object') {
      const serverMsg = data.error || data.message || data.details;
      if (serverMsg) {
        throw new Error(serverMsg);
      }
    }

    // If server returned plain text that is not a giant HTML document
    const trimmed = rawText.trim();
    if (trimmed && trimmed.length > 0 && trimmed.length < 200 && !trimmed.includes('<html') && !trimmed.includes('<!DOCTYPE')) {
      // Clean up any known error prefix
      if (trimmed.startsWith('A server error') || trimmed.startsWith('An error occurred')) {
        throw new Error('The authentication server encountered a temporary error. Please try again in a few moments.');
      }
      throw new Error(trimmed);
    }

    // Meaningful fallback based on standard HTTP status codes
    if (res.status === 401) {
      throw new Error('Invalid username or password. Please check your credentials.');
    }
    if (res.status === 403) {
      throw new Error('Access denied. Account may be suspended or unauthorized.');
    }
    if (res.status === 404) {
      throw new Error('Authentication endpoint was not found (404). Please ensure server API routes are deployed.');
    }
    if (res.status === 429) {
      throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
    }
    if (res.status >= 500) {
      throw new Error(`Authentication server error (HTTP ${res.status}). Please check server logs or try again shortly.`);
    }

    throw new Error(`${fallbackErrorMsg} (HTTP ${res.status})`);
  }

  if (!data) {
    throw new Error('Received unexpected empty or non-JSON response from authentication server.');
  }

  return data;
}

export const AuthApiClient = {
  /**
   * Register with ONLY username and password
   */
  async register(username: string, password: string): Promise<SafeUser> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include', // Includes HttpOnly session cookie
      body: JSON.stringify({ username, password })
    });

    const data = await parseResponseSafely(res, 'Registration failed');

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
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await parseResponseSafely(res, 'Login failed');

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
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      await parseResponseSafely(res, 'Logout failed').catch(() => {});
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
        headers: {
          ...getAuthHeaders(),
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!res.ok) {
        return null;
      }

      const data = await parseResponseSafely(res, 'Session verification failed');
      return data && data.authenticated ? data.user : null;
    } catch {
      return null;
    }
  }
};
