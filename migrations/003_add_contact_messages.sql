-- ============================================================================
-- MIGRATION 003: CONTACT MESSAGES TABLE
-- Safe, idempotent migration for user contact and feedback inquiries
-- ============================================================================

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
