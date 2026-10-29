-- ============================================================================
-- Migration 005: Add Secure Authentication, Email Verification & OTP Verifier Table
-- ============================================================================

-- 1. Ensure email_verified column exists on users table
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 2. Automatically mark existing Google OAuth users as verified
UPDATE users 
SET email_verified = true 
WHERE auth_provider = 'google' AND email_verified = false;

-- 3. Create email_verifications table for cryptographically secure 6-digit OTP codes
-- Requirements:
-- - One-time use verification codes (keyed SHA-256 hash stored, never plaintext)
-- - Supports both 'signup_verification' and 'password_reset'
-- - Enforces max attempt limits (5) to mitigate brute-force attacks
-- - Tracks 10-minute expiry
CREATE TABLE IF NOT EXISTS email_verifications (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    code_hash VARCHAR(128) NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    max_attempts INTEGER DEFAULT 5 NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_verif_lookup ON email_verifications (LOWER(email), purpose);
CREATE INDEX IF NOT EXISTS idx_email_verif_expires ON email_verifications (expires_at);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users (email_verified);
