import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ override: true });

let pool: Pool | null = null;
let isInitialized = false;

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0 && !url.includes('username:password'));
}

export function getDbPool(): Pool | null {
  if (!isDbConfigured()) {
    return null;
  }

  if (!pool) {
    const connectionString = process.env.DATABASE_URL!.trim();
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    pool.on('error', (err) => {
      console.error('Unexpected Neon database pool error:', err);
    });
  }

  return pool;
}

/**
 * Execute a parameterized query against Neon PostgreSQL
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getDbPool();
  if (!p) {
    throw new Error('Database is not configured. DATABASE_URL environment variable is required.');
  }

  // Ensure schema is verified on first query
  if (!isInitialized) {
    await initDbSchema();
  }

  const client = await p.connect();
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
  const p = getDbPool();
  if (!p) return;

  const client = await p.connect();
  try {
    // 1. Create types if not exist
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE user_status AS ENUM ('active', 'suspended');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'rendered', 'ready', 'completed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 2. Create users table
    await client.query(`
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

      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id ON users (auth_provider, provider_user_id) WHERE provider_user_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email)) WHERE email IS NOT NULL;
    `);

    // 3. Migrate existing users table if columns missing
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32) DEFAULT 'local';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(128);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    `);

    // 4. Create user_sessions table
    await client.query(`
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
    `);

    // 5. Create projects table
    await client.query(`
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

      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

      -- Add extended columns if not present
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS style VARCHAR(64) DEFAULT 'Cinematic';
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS voice VARCHAR(64) DEFAULT 'Female';
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS language VARCHAR(64) DEFAULT 'English';
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS music VARCHAR(64) DEFAULT 'AI Background Music';
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS idea_prompt TEXT DEFAULT '';
    `);

    isInitialized = true;
    console.log('Neon database connection and schema verified successfully.');
  } catch (err) {
    console.error('Error verifying database schema:', err);
  } finally {
    client.release();
  }
}
