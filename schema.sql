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
-- - Password hash nullable for OAuth users (never plaintext)
-- - OAuth provider and provider user ID for Google authentication
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

-- Case-insensitive unique index on normalized username
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id ON users (auth_provider, provider_user_id) WHERE provider_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email)) WHERE email IS NOT NULL;

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

-- 8. TEMPLATES TABLE (AI Template Maker Library)
CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(64) NOT NULL DEFAULT 'Trending',
    aspect_ratio VARCHAR(32) NOT NULL DEFAULT '9:16',
    duration VARCHAR(64) NOT NULL DEFAULT '15 seconds',
    duration_seconds INTEGER NOT NULL DEFAULT 15,
    media_slots INTEGER NOT NULL DEFAULT 3,
    slots_metadata JSONB DEFAULT '[]'::JSONB,
    thumbnail_url TEXT NOT NULL DEFAULT '',
    preview_video_url TEXT DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(is_published);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_templates_updated_at ON templates(updated_at DESC);

-- 9. TEMPLATE USAGE ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS template_usage (
    id VARCHAR(64) PRIMARY KEY,
    template_id VARCHAR(64) NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_template_usage_tpl_id ON template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_created_at ON template_usage(created_at DESC);

-- 10. UPDATES MANAGEMENT TABLE (What's New banner & Announcements)
CREATE TABLE IF NOT EXISTS updates (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tag VARCHAR(64) DEFAULT 'New Feature',
    image_url TEXT,
    button_text VARCHAR(64) DEFAULT 'Try Now',
    button_link VARCHAR(255) DEFAULT '/templates',
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_updates_published ON updates(is_published);
CREATE INDEX IF NOT EXISTS idx_updates_pinned ON updates(is_pinned);
CREATE INDEX IF NOT EXISTS idx_updates_published_at ON updates(published_at DESC);

-- 11. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(64) DEFAULT 'General Inquiry & Feedback',
    subject VARCHAR(255) DEFAULT '',
    message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'received',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(LOWER(email));


