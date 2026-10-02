-- ============================================================================
-- MIGRATION 002: TEMPLATES, TEMPLATE USAGE, AND UPDATES MANAGEMENT
-- Non-destructive, safe migration compatible with Neon PostgreSQL
-- ============================================================================

-- 1. Ensure user_role and user_status enums exist if using enum types
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

-- 2. Ensure role and status columns exist on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active';

-- 3. Templates Table (Database-Driven AI Template Maker)
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

-- 4. Template Usage Analytics Table
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

-- 5. Updates Management Table (What's New banner & Announcements)
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
