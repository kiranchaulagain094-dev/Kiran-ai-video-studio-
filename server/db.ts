import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ override: true });

let sqlClient: any = null;
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

export function getDbPool(): any {
  return getDbClient();
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
        console.warn('Schema initialization note:', err?.message || err);
        isInitialized = true;
      });
    }
    await initPromise;
  }

  const sql = getDbClient();
  if (!sql) {
    throw new Error('Unable to connect to Neon database client.');
  }

  try {
    if (params && params.length > 0) {
      return (await sql.query(text, params)) as T[];
    } else {
      return (await sql.query(text)) as T[];
    }
  } catch (err: any) {
    console.error('Neon database query error:', err?.message || err);
    throw err;
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
    // 1. Ensure enum types exist
    await sql.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE user_status AS ENUM ('active', 'suspended');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'rendered', 'ready', 'completed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `).catch(() => {});

    // 2. Ensure users table exists with OAuth columns
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

      ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32) DEFAULT 'local';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(128);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    `).catch(() => {});

    // 3. Ensure user_sessions table exists
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

    // 4. Ensure projects table exists
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

    isInitialized = true;
  } catch (err) {
    console.warn('Schema verification note:', err);
    isInitialized = true;
  }
}
