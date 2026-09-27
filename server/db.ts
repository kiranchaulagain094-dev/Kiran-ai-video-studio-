import { neon, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ override: true });

let sqlClient: any = null;
let fallbackPool: Pool | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0 && !url.includes('username:password'));
}

export function getDbClient() {
  if (!isDbConfigured()) {
    return null;
  }

  if (!sqlClient) {
    const connectionString = process.env.DATABASE_URL!.trim();
    sqlClient = neon(connectionString);
  }

  return sqlClient;
}

export function getDbPool(): Pool | null {
  if (!isDbConfigured()) {
    return null;
  }

  if (!fallbackPool) {
    const connectionString = process.env.DATABASE_URL!.trim();
    fallbackPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    fallbackPool.on('error', (err) => {
      console.warn('Neon database pool error (non-fatal):', err?.message || err);
    });
  }

  return fallbackPool;
}

/**
 * Execute a parameterized query against Neon PostgreSQL using HTTP serverless driver
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured. DATABASE_URL environment variable is required.');
  }

  // Ensure schema is verified on first query
  if (!isInitialized) {
    if (!initPromise) {
      initPromise = initDbSchema().catch((err) => {
        console.warn('Schema initialization warning:', err?.message || err);
        isInitialized = true;
      });
    }
    await initPromise;
  }

  const sql = getDbClient();
  if (sql) {
    try {
      if (params && params.length > 0) {
        return (await sql.query(text, params)) as T[];
      } else {
        return (await sql.query(text)) as T[];
      }
    } catch (httpErr: any) {
      console.warn('Neon HTTP query failed, attempting Pool fallback:', httpErr?.message || httpErr);
    }
  }

  // Fallback to Pool if HTTP query failed
  const pool = getDbPool();
  if (!pool) {
    throw new Error('Unable to connect to Neon database.');
  }

  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Automatically initializes and verifies database schema if not present
 */
export async function initDbSchema(): Promise<void> {
  if (isInitialized) return;
  if (!isDbConfigured()) return;

  const sql = getDbClient();
  if (!sql) return;

  try {
    // 1. Create types if not exist
    await sql.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `).catch(() => {});

    await sql.query(`
      DO $$ BEGIN
        CREATE TYPE user_status AS ENUM ('active', 'suspended');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `).catch(() => {});

    await sql.query(`
      DO $$ BEGIN
        CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'rendered', 'ready', 'completed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `).catch(() => {});

    // 2. Create users table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        display_username VARCHAR(64) NOT NULL,
        email VARCHAR(255),
        auth_provider VARCHAR(32) DEFAULT 'local' NOT NULL,
        provider_user_id VARCHAR(128),
        password_hash VARCHAR(255),
        role user_role DEFAULT 'user' NOT NULL,
        status user_status DEFAULT 'active' NOT NULL,
        avatar TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `).catch(() => {});

    await sql.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));`).catch(() => {});
    await sql.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id ON users (auth_provider, provider_user_id) WHERE provider_user_id IS NOT NULL;`).catch(() => {});
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email)) WHERE email IS NOT NULL;`).catch(() => {});

    // 3. Migrate existing users table if columns missing
    await sql.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32) DEFAULT 'local';`).catch(() => {});
    await sql.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(128);`).catch(() => {});
    await sql.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);`).catch(() => {});
    await sql.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`).catch(() => {});

    // 4. Create user_sessions table
    await sql.query(`
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
    `).catch(() => {});

    await sql.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);`).catch(() => {});
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);`).catch(() => {});

    // 5. Create projects table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        type VARCHAR(64) DEFAULT 'YouTube Video' NOT NULL,
        aspect_ratio VARCHAR(32) DEFAULT '16:9' NOT NULL,
        duration VARCHAR(64) DEFAULT '60 seconds' NOT NULL,
        status project_status DEFAULT 'draft' NOT NULL,
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
    `).catch(() => {});

    await sql.query(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);`).catch(() => {});
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);`).catch(() => {});

    // Add extended columns if not present
    await sql.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS style VARCHAR(64) DEFAULT 'Cinematic';`).catch(() => {});
    await sql.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS voice VARCHAR(64) DEFAULT 'Female';`).catch(() => {});
    await sql.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS language VARCHAR(64) DEFAULT 'English';`).catch(() => {});
    await sql.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS music VARCHAR(64) DEFAULT 'AI Background Music';`).catch(() => {});
    await sql.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS idea_prompt TEXT DEFAULT '';`).catch(() => {});

    isInitialized = true;
  } catch (err) {
    console.warn('Schema verification note:', err);
    isInitialized = true;
  }
}
