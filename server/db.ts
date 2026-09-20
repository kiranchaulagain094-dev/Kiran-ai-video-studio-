import { Pool, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DbUser {
  id: string; // Immutable unique identifier: usr_<uuid>
  username: string; // Canonical username (trimmed, lowercase for lookup)
  displayUsername: string; // Original casing for display
  passwordHash: string; // Bcrypt hashed password - never plaintext
  role: 'user' | 'admin';
  createdAt: string;
  avatar?: string;
  status: 'active' | 'suspended';
}

export interface DbProject {
  id: string;
  userId: string; // Linked directly to DbUser.id
  title: string;
  description?: string;
  type: string;
  aspectRatio: string;
  duration: string;
  status: 'draft' | 'in_progress' | 'rendered' | 'ready' | 'completed';
  thumbnailUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  scenesCount?: number;
  quality?: string;
  script?: string;
  scenes?: any[];
}

interface RateLimitRecord {
  failedAttempts: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

interface DatabaseSchema {
  users: DbUser[];
  projects: DbProject[];
}

// -----------------------------------------------------------------------------
// PostgreSQL Connection Pool (Used when DATABASE_URL is configured)
// -----------------------------------------------------------------------------
let pgPool: Pool | null = null;
let pgInitialized = false;
let pgDisabledUntil = 0;

function handlePgError(context: string, err: any): void {
  console.warn(`PostgreSQL ${context} notice:`, err?.message || err);
  // Cooldown for 10 seconds to allow cold-start / wake up recovery
  pgDisabledUntil = Date.now() + 10000;
}

export function getPgPool(): Pool | null {
  const now = Date.now();
  if (pgDisabledUntil > now) return null;
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString || (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://'))) {
    return null;
  }
  if (!pgPool) {
    try {
      pgPool = new Pool({
        connectionString,
        ssl: connectionString.includes('sslmode=disable')
          ? false
          : { rejectUnauthorized: false }, // Compatible with Neon, Supabase, AWS RDS Aurora
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // 10s timeout accommodates Neon cold-start wake-up
      });
      pgPool.on('error', (err) => {
        console.warn('PostgreSQL pool background error:', err.message);
        pgDisabledUntil = Date.now() + 10000;
      });
    } catch (err: any) {
      console.warn('Failed to construct PostgreSQL pool, using fallback storage:', err?.message);
      pgDisabledUntil = Date.now() + 10000;
      return null;
    }
  }
  return pgPool;
}

/**
 * Automatically bootstraps PostgreSQL tables if connected for the first time
 */
async function initPgTables(pool: Pool): Promise<void> {
  if (pgInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        display_username VARCHAR(64) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'user' NOT NULL,
        status VARCHAR(32) DEFAULT 'active' NOT NULL,
        avatar TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));

      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(128) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        type VARCHAR(64) DEFAULT 'YouTube Video' NOT NULL,
        aspect_ratio VARCHAR(32) DEFAULT '16:9' NOT NULL,
        duration VARCHAR(64) DEFAULT '60 seconds' NOT NULL,
        status VARCHAR(32) DEFAULT 'draft' NOT NULL,
        thumbnail_url TEXT,
        video_url TEXT,
        tags TEXT[] DEFAULT ARRAY['AI Video']::TEXT[],
        scenes_count INTEGER DEFAULT 3 NOT NULL,
        quality VARCHAR(64) DEFAULT '1080p Full HD',
        script TEXT DEFAULT '',
        scenes JSONB DEFAULT '[]'::JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    `);
    pgInitialized = true;
    console.log('PostgreSQL tables verified and initialized successfully.');
  } catch (err: any) {
    handlePgError('table init failed (falling back to storage engine)', err);
  }
}

// -----------------------------------------------------------------------------
// Fallback Local File Storage (Used when DATABASE_URL is not set or fails)
// -----------------------------------------------------------------------------
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? path.join('/tmp', 'kiran_studio_data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'studio_database.json');

function ensureDatabaseFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = { users: [], projects: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  } catch (err: any) {
    console.warn('Fallback database directory notice:', err.message);
  }
}

// In-memory rate limiting store (sliding window: 5 attempts per 15 minutes)
const rateLimits = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

export class DatabaseService {
  private static cache: DatabaseSchema | null = null;

  // Local file read/write helpers
  private static readLocalData(): DatabaseSchema {
    try {
      ensureDatabaseFile();
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.projects)) {
          this.cache = parsed;
          return this.cache!;
        }
      }
    } catch (e: any) {
      console.warn('Local database read notice:', e.message);
    }
    if (this.cache && Array.isArray(this.cache.users) && Array.isArray(this.cache.projects)) {
      return this.cache;
    }
    this.cache = { users: [], projects: [] };
    return this.cache;
  }

  private static writeLocalData(data: DatabaseSchema): void {
    this.cache = data;
    try {
      ensureDatabaseFile();
      const tempPath = `${DB_FILE}.${Date.now()}.${crypto.randomBytes(4).toString('hex')}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e: any) {
      console.warn('Local database file persist notice (in-memory state active):', e.message);
    }
  }

  // ===========================================================================
  // User Operations
  // ===========================================================================

  static async findUserByUsername(username: string): Promise<DbUser | null> {
    const normalized = username.trim().toLowerCase();
    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        const res: QueryResult = await pool.query(
          'SELECT id, username, display_username, password_hash, role, status, avatar, created_at FROM users WHERE LOWER(username) = $1 LIMIT 1',
          [normalized]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          id: row.id,
          username: row.username,
          displayUsername: row.display_username,
          passwordHash: row.password_hash,
          role: row.role,
          status: row.status,
          avatar: row.avatar,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
        };
      } catch (pgErr: any) {
        handlePgError('findUserByUsername', pgErr);
      }
    }

    const data = this.readLocalData();
    return data.users.find(u => u.username === normalized) || null;
  }

  static async findUserById(id: string): Promise<DbUser | null> {
    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        const res: QueryResult = await pool.query(
          'SELECT id, username, display_username, password_hash, role, status, avatar, created_at FROM users WHERE id = $1 LIMIT 1',
          [id]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          id: row.id,
          username: row.username,
          displayUsername: row.display_username,
          passwordHash: row.password_hash,
          role: row.role,
          status: row.status,
          avatar: row.avatar,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
        };
      } catch (pgErr: any) {
        handlePgError('findUserById', pgErr);
      }
    }

    const data = this.readLocalData();
    return data.users.find(u => u.id === id) || null;
  }

  static async createUser(user: Omit<DbUser, 'id' | 'createdAt' | 'status'>): Promise<DbUser> {
    const normalized = user.username.trim().toLowerCase();
    const uniqueId = `usr_${crypto.randomUUID().replace(/-/g, '')}`;
    const createdAt = new Date().toISOString();
    const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayUsername || user.username)}&background=6366f1&color=fff`;

    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        // Check count to auto-promote first user or admin username
        const countRes = await pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(countRes.rows[0]?.count || '0', 10);
        const isAdmin = user.role === 'admin' || userCount === 0 || normalized.includes('admin') || normalized === 'kiran';
        const role = isAdmin ? 'admin' : 'user';

        await pool.query(
          `INSERT INTO users (id, username, display_username, password_hash, role, status, avatar, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
          [uniqueId, normalized, user.displayUsername || user.username.trim(), user.passwordHash, role, 'active', avatar, createdAt]
        );

        return {
          id: uniqueId,
          username: normalized,
          displayUsername: user.displayUsername || user.username.trim(),
          passwordHash: user.passwordHash,
          role,
          createdAt,
          avatar,
          status: 'active'
        };
      } catch (err: any) {
        if (err.code === '23505') { // Postgres unique_violation
          throw new Error('Username already exists');
        }
        handlePgError('createUser', err);
      }
    }

    // Local fallback
    const data = this.readLocalData();
    if (data.users.some(u => u.username === normalized)) {
      throw new Error('Username already exists');
    }

    const isAdmin = user.role === 'admin' || data.users.length === 0 || normalized.includes('admin') || normalized === 'kiran';
    const newUser: DbUser = {
      id: uniqueId,
      username: normalized,
      displayUsername: user.displayUsername || user.username.trim(),
      passwordHash: user.passwordHash,
      role: isAdmin ? 'admin' : 'user',
      createdAt,
      avatar,
      status: 'active'
    };

    data.users.push(newUser);
    this.writeLocalData(data);
    return newUser;
  }

  static async getAllUsers(): Promise<Omit<DbUser, 'passwordHash'>[]> {
    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        const res = await pool.query(
          'SELECT id, username, display_username, role, status, avatar, created_at FROM users ORDER BY created_at DESC'
        );
        return res.rows.map(row => ({
          id: row.id,
          username: row.username,
          displayUsername: row.display_username,
          role: row.role,
          status: row.status,
          avatar: row.avatar,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
        }));
      } catch (err: any) {
        handlePgError('getAllUsers', err);
      }
    }

    const data = this.readLocalData();
    return data.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  static async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<boolean> {
    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        const res = await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, userId]);
        return (res.rowCount ?? 0) > 0;
      } catch (err: any) {
        handlePgError('updateUserStatus', err);
      }
    }

    const data = this.readLocalData();
    const user = data.users.find(u => u.id === userId);
    if (!user) return false;
    user.status = status;
    this.writeLocalData(data);
    return true;
  }

  // ===========================================================================
  // Session Operations (PostgreSQL user_sessions Table)
  // ===========================================================================

  static async registerSession(userId: string, token: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const pool = getPgPool();
    if (!pool) return;

    try {
      await initPgTables(pool);
      const sessionId = `ses_${crypto.randomUUID().replace(/-/g, '')}`;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await pool.query(
        `INSERT INTO user_sessions (id, user_id, token_hash, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sessionId, userId, tokenHash, ipAddress || 'unknown', userAgent || '', expiresAt]
      );
    } catch (err) {
      console.error('Failed to register session in PostgreSQL:', err);
    }
  }

  static async deleteSession(token: string): Promise<void> {
    const pool = getPgPool();
    if (!pool) return;

    try {
      await initPgTables(pool);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await pool.query('DELETE FROM user_sessions WHERE token_hash = $1', [tokenHash]);
    } catch (err) {
      console.error('Failed to delete session from PostgreSQL:', err);
    }
  }

  // ===========================================================================
  // Project Operations (Isolated per User)
  // ===========================================================================

  static async getProjectsForUser(userId: string, isAdmin: boolean = false): Promise<DbProject[]> {
    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        let query = 'SELECT * FROM projects ORDER BY updated_at DESC';
        let params: any[] = [];
        if (!isAdmin) {
          query = 'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC';
          params = [userId];
        }
        const res = await pool.query(query, params);
        return res.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          title: row.title,
          description: row.description || '',
          type: row.type,
          aspectRatio: row.aspect_ratio,
          duration: row.duration,
          status: row.status,
          thumbnailUrl: row.thumbnail_url,
          videoUrl: row.video_url,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          tags: row.tags || ['AI Video'],
          scenesCount: row.scenes_count,
          quality: row.quality,
          script: row.script || '',
          scenes: typeof row.scenes === 'string' ? JSON.parse(row.scenes) : (row.scenes || [])
        }));
      } catch (err: any) {
        handlePgError('getProjectsForUser', err);
      }
    }

    const data = this.readLocalData();
    if (isAdmin) {
      return data.projects;
    }
    return data.projects.filter(p => p.userId === userId);
  }

  static async getProjectById(projectId: string): Promise<DbProject | null> {
    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        const res = await pool.query('SELECT * FROM projects WHERE id = $1 LIMIT 1', [projectId]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          title: row.title,
          description: row.description || '',
          type: row.type,
          aspectRatio: row.aspect_ratio,
          duration: row.duration,
          status: row.status,
          thumbnailUrl: row.thumbnail_url,
          videoUrl: row.video_url,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          tags: row.tags || ['AI Video'],
          scenesCount: row.scenes_count,
          quality: row.quality,
          script: row.script || '',
          scenes: typeof row.scenes === 'string' ? JSON.parse(row.scenes) : (row.scenes || [])
        };
      } catch (err: any) {
        handlePgError('getProjectById', err);
      }
    }

    const data = this.readLocalData();
    return data.projects.find(p => p.id === projectId) || null;
  }

  static async createProject(userId: string, projectData: Partial<DbProject>): Promise<DbProject> {
    const id = `proj_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const title = (projectData.title || 'Untitled Project').trim();
    const description = projectData.description || '';
    const type = projectData.type || 'YouTube Video';
    const aspectRatio = projectData.aspectRatio || '16:9';
    const duration = projectData.duration || '60 seconds';
    const status = (projectData.status as any) || 'draft';
    const thumbnailUrl = projectData.thumbnailUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80';
    const videoUrl = projectData.videoUrl || '';
    const now = new Date().toISOString();
    const tags = projectData.tags || ['AI Video'];
    const scenesCount = projectData.scenesCount || 3;
    const quality = projectData.quality || '1080p Full HD';
    const script = projectData.script || '';
    const scenes = projectData.scenes || [];

    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        await pool.query(
          `INSERT INTO projects (
            id, user_id, title, description, type, aspect_ratio, duration,
            status, thumbnail_url, video_url, tags, scenes_count, quality,
            script, scenes, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $16
          )`,
          [
            id, userId, title, description, type, aspectRatio, duration,
            status, thumbnailUrl, videoUrl, tags, scenesCount, quality,
            script, JSON.stringify(scenes), now
          ]
        );

        return {
          id, userId, title, description, type, aspectRatio, duration,
          status, thumbnailUrl, videoUrl, createdAt: now, updatedAt: now,
          tags, scenesCount, quality, script, scenes
        };
      } catch (err: any) {
        handlePgError('createProject', err);
      }
    }

    // Local fallback
    const data = this.readLocalData();
    const newProject: DbProject = {
      id,
      userId,
      title,
      description,
      type,
      aspectRatio,
      duration,
      status,
      thumbnailUrl,
      videoUrl,
      createdAt: now,
      updatedAt: now,
      tags,
      scenesCount,
      quality,
      script,
      scenes
    };

    data.projects.unshift(newProject);
    this.writeLocalData(data);
    return newProject;
  }

  static async updateProject(projectId: string, userId: string, updates: Partial<DbProject>, isAdmin: boolean = false): Promise<DbProject> {
    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        const existing = await this.getProjectById(projectId);
        if (!existing) {
          throw new Error('Project not found');
        }
        if (existing.userId !== userId && !isAdmin) {
          throw new Error('Unauthorized: You do not own this project');
        }

        const now = new Date().toISOString();
        const title = updates.title !== undefined ? updates.title.trim() : existing.title;
        const description = updates.description !== undefined ? updates.description : existing.description;
        const type = updates.type !== undefined ? updates.type : existing.type;
        const aspectRatio = updates.aspectRatio !== undefined ? updates.aspectRatio : existing.aspectRatio;
        const duration = updates.duration !== undefined ? updates.duration : existing.duration;
        const status = updates.status !== undefined ? (updates.status as any) : existing.status;
        const thumbnailUrl = updates.thumbnailUrl !== undefined ? updates.thumbnailUrl : existing.thumbnailUrl;
        const videoUrl = updates.videoUrl !== undefined ? updates.videoUrl : existing.videoUrl;
        const tags = updates.tags !== undefined ? updates.tags : existing.tags;
        const scenesCount = updates.scenesCount !== undefined ? updates.scenesCount : existing.scenesCount;
        const quality = updates.quality !== undefined ? updates.quality : existing.quality;
        const script = updates.script !== undefined ? updates.script : existing.script;
        const scenes = updates.scenes !== undefined ? updates.scenes : existing.scenes;

        await pool.query(
          `UPDATE projects SET
            title = $1, description = $2, type = $3, aspect_ratio = $4, duration = $5,
            status = $6, thumbnail_url = $7, video_url = $8, tags = $9, scenes_count = $10,
            quality = $11, script = $12, scenes = $13, updated_at = $14
          WHERE id = $15`,
          [
            title, description, type, aspectRatio, duration,
            status, thumbnailUrl, videoUrl, tags, scenesCount,
            quality, script, JSON.stringify(scenes), now, projectId
          ]
        );

        return {
          ...existing,
          title,
          description,
          type,
          aspectRatio,
          duration,
          status,
          thumbnailUrl,
          videoUrl,
          tags,
          scenesCount,
          quality,
          script,
          scenes,
          updatedAt: now
        };
      } catch (err: any) {
        if (err.message?.includes('Unauthorized') || err.message?.includes('not found')) {
          throw err;
        }
        handlePgError('updateProject', err);
      }
    }

    // Local fallback
    const data = this.readLocalData();
    const index = data.projects.findIndex(p => p.id === projectId);
    if (index === -1) {
      throw new Error('Project not found');
    }

    const project = data.projects[index];
    if (project.userId !== userId && !isAdmin) {
      throw new Error('Unauthorized: You do not own this project');
    }

    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.id;
    delete sanitizedUpdates.userId;

    const updatedProject: DbProject = {
      ...project,
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString()
    };

    data.projects[index] = updatedProject;
    this.writeLocalData(data);
    return updatedProject;
  }

  static async deleteProject(projectId: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
    const pool = getPgPool();
    if (pool) {
      try {
        await initPgTables(pool);
        const existing = await this.getProjectById(projectId);
        if (!existing) {
          throw new Error('Project not found');
        }
        if (existing.userId !== userId && !isAdmin) {
          throw new Error('Unauthorized: You do not own this project');
        }

        await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
        return true;
      } catch (err: any) {
        if (err.message?.includes('Unauthorized') || err.message?.includes('not found')) {
          throw err;
        }
        handlePgError('deleteProject', err);
      }
    }

    // Local fallback
    const data = this.readLocalData();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.userId !== userId && !isAdmin) {
      throw new Error('Unauthorized: You do not own this project');
    }

    data.projects = data.projects.filter(p => p.id !== projectId);
    this.writeLocalData(data);
    return true;
  }

  // ===========================================================================
  // Rate Limiting Operations
  // ===========================================================================

  static checkRateLimit(key: string): { allowed: boolean; remainingMinutes?: number } {
    const now = Date.now();
    const record = rateLimits.get(key);

    if (!record) {
      return { allowed: true };
    }

    if (record.blockedUntil && now < record.blockedUntil) {
      const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
      return { allowed: false, remainingMinutes };
    }

    if (now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
      rateLimits.delete(key);
      return { allowed: true };
    }

    if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION_MS;
      rateLimits.set(key, record);
      return { allowed: false, remainingMinutes: Math.ceil(BLOCK_DURATION_MS / 60000) };
    }

    return { allowed: true };
  }

  static recordFailedAttempt(key: string): void {
    const now = Date.now();
    const record = rateLimits.get(key) || { failedAttempts: 0, firstAttemptAt: now };

    if (now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
      record.failedAttempts = 1;
      record.firstAttemptAt = now;
      record.blockedUntil = undefined;
    } else {
      record.failedAttempts += 1;
    }

    if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION_MS;
    }

    rateLimits.set(key, record);
  }

  static resetRateLimit(key: string): void {
    rateLimits.delete(key);
  }
}
