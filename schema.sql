-- ============================================================================
-- KIRAN AI VIDEO STUDIO - POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Compatible with Neon, Supabase, AWS RDS Aurora, and standard PostgreSQL (v13+)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'rendered', 'ready', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. USERS TABLE
-- Requirements:
-- - Immutable unique user ID format: 'usr_' + hex/uuid
-- - Unique normalized username (case-insensitive indexing)
-- - Password hash strictly bcrypt hashed (never plaintext)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    display_username VARCHAR(64) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Case-insensitive unique index on normalized username
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));

-- 4. USER SESSIONS TABLE
-- Requirements:
-- - Secure server-side session registry
-- - Tied to unique user ID with ON DELETE CASCADE
-- - Automatic session revocation and expiration tracking
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

-- 5. PROJECTS TABLE (User-Specific Application Data)
-- Requirements:
-- - Strict user isolation: user_id foreign key referencing users(id)
-- - Standard and AI-generated video project state (title, script, scenes, tags, render config)
-- - Cascade deletion if user account is permanently deleted
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

-- 6. RATE LIMITING TABLE (Optional persistent rate limiter for distributed serverless)
CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(128) PRIMARY KEY,
    failed_attempts INTEGER DEFAULT 1 NOT NULL,
    first_attempt_at BIGINT NOT NULL,
    blocked_until BIGINT
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON rate_limits(blocked_until);

-- 7. TRIGGER: AUTO-UPDATE updated_at TIMESTAMP
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
