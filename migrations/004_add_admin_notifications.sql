-- ============================================================================
-- MIGRATION 004: ADMIN NOTIFICATIONS TABLE (DEDUPLICATION & AUDIT LOG)
-- Safe, idempotent migration for tracking sent administrative notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
    id VARCHAR(64) PRIMARY KEY,
    event_key VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'sent' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_notifications_event_key ON admin_notifications(event_key);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
