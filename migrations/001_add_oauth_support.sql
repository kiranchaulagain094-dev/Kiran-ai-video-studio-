-- ============================================================================
-- MIGRATION 001: ADD OAUTH & PROVIDER USER SUPPORT TO USERS TABLE
-- Safe, non-destructive migration compatible with Neon PostgreSQL
-- ============================================================================

-- 1. Add auth_provider, provider_user_id, and email columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(32) DEFAULT 'local',
ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(128),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Make password_hash nullable so OAuth users do not require a plaintext or fake password
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Create unique index on provider credentials for instant OAuth user retrieval
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id 
ON users (auth_provider, provider_user_id) 
WHERE provider_user_id IS NOT NULL;

-- 4. Create case-insensitive lookup index on email
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users (LOWER(email)) 
WHERE email IS NOT NULL;
