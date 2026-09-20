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
 * Formats any error (string, Error instance, object with message/error/details, HTTP error, etc.)
 * into a safe, human-readable string.
 * Strictly guarantees that "[object Object]" is NEVER returned or rendered.
 */
export function formatErrorMessage(
  err: unknown, 
  fallback: string = 'Unable to create account. Please try again.'
): string {
  if (err === null || err === undefined) return fallback;

  // 1. If it's already a clean string
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (!trimmed || trimmed === '[object Object]' || trimmed.includes('[object Object]')) {
      return fallback;
    }
    return trimmed;
  }

  // 2. If it's an Error instance or object
  if (typeof err === 'object') {
    const anyErr = err as Record<string, any>;

    // Priority 1: Check 'error' property
    if (typeof anyErr.error === 'string') {
      const trimmed = anyErr.error.trim();
      if (trimmed && trimmed !== '[object Object]' && !trimmed.includes('[object Object]')) {
        return trimmed;
      }
    } else if (typeof anyErr.error === 'object' && anyErr.error !== null) {
      const nested = formatErrorMessage(anyErr.error, '');
      if (nested && nested !== '[object Object]') return nested;
    }

    // Priority 2: Check 'message' property
    if (typeof anyErr.message === 'string') {
      const trimmed = anyErr.message.trim();
      if (trimmed && trimmed !== '[object Object]' && !trimmed.includes('[object Object]')) {
        return trimmed;
      }
    } else if (typeof anyErr.message === 'object' && anyErr.message !== null) {
      const nested = formatErrorMessage(anyErr.message, '');
      if (nested && nested !== '[object Object]') return nested;
    }

    // Priority 3: Check 'details' or 'msg' or 'reason'
    const candidate = anyErr.details || anyErr.msg || anyErr.reason;
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed && trimmed !== '[object Object]' && !trimmed.includes('[object Object]')) {
        return trimmed;
      }
    }

    // Priority 4: Status text
    if (typeof anyErr.statusText === 'string' && anyErr.statusText.trim()) {
      return anyErr.statusText.trim();
    }

    // Priority 5: Parse stringified JSON if it contains key values
    try {
      const jsonStr = JSON.stringify(anyErr);
      if (jsonStr && jsonStr !== '{}' && jsonStr.length < 250) {
        const match = jsonStr.match(/"(?:error|message|details)":\s*"([^"]+)"/i);
        if (match && match[1] && match[1] !== '[object Object]') {
          return match[1];
        }
      }
    } catch {}
  }

  return fallback;
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
  } catch {
    throw new Error('Unable to read response from authentication server.');
  }

  let data: any = null;
  const trimmed = rawText.trim();
  const isJsonCandidate = contentType.includes('application/json') || 
    trimmed.startsWith('{') || 
    trimmed.startsWith('[');

  if (isJsonCandidate && trimmed.length > 0) {
    try {
      data = JSON.parse(trimmed);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    let resolvedMsg = '';

    if (data && typeof data === 'object') {
      resolvedMsg = formatErrorMessage(data, '');
    }

    // If server returned plain text that is not a giant HTML document
    if (!resolvedMsg && trimmed && trimmed.length > 0 && trimmed.length < 200 && !trimmed.includes('<html') && !trimmed.includes('<!DOCTYPE')) {
      if (trimmed.startsWith('A server error') || trimmed.startsWith('An error occurred')) {
        resolvedMsg = 'The authentication server encountered a temporary error. Please try again in a few moments.';
      } else {
        resolvedMsg = trimmed;
      }
    }

    // Meaningful fallback based on standard HTTP status codes
    if (!resolvedMsg) {
      if (res.status === 400) {
        resolvedMsg = 'Username must be 3-30 characters';
      } else if (res.status === 409) {
        resolvedMsg = 'Username already exists';
      } else if (res.status === 401) {
        resolvedMsg = 'Invalid username or password. Please check your credentials.';
      } else if (res.status === 403) {
        resolvedMsg = 'Access denied. Account may be suspended or unauthorized.';
      } else if (res.status === 404) {
        resolvedMsg = 'Authentication endpoint was not found (404). Please ensure server API routes are deployed.';
      } else if (res.status === 429) {
        resolvedMsg = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (res.status >= 500) {
        resolvedMsg = 'Unable to create account. Please try again.';
      } else {
        resolvedMsg = fallbackErrorMsg;
      }
    }

    throw new Error(formatErrorMessage(resolvedMsg, fallbackErrorMsg));
  }

  // Even if res.ok is true (HTTP 200), verify backend didn't return failure JSON { success: false, error: ... }
  if (data && typeof data === 'object') {
    if (data.success === false || (data.error && !data.user)) {
      const errorMsg = formatErrorMessage(data, fallbackErrorMsg);
      throw new Error(errorMsg);
    }
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
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Includes HttpOnly session cookie
        body: JSON.stringify({ username, password })
      });

      const data = await parseResponseSafely(res, 'Unable to create account. Please try again.');

      if (!data.user) {
        throw new Error('Unable to create account. Please try again.');
      }

      if (data.token) {
        setMemoryToken(data.token);
      }
      return data.user;
    } catch (err: any) {
      const clean = formatErrorMessage(err, 'Unable to create account. Please try again.');
      throw new Error(clean);
    }
  },

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<SafeUser> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await parseResponseSafely(res, 'Invalid username or password.');

      if (!data.user) {
        throw new Error('Invalid username or password.');
      }

      if (data.token) {
        setMemoryToken(data.token);
      }
      return data.user;
    } catch (err: any) {
      const clean = formatErrorMessage(err, 'Invalid username or password.');
      throw new Error(clean);
    }
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
