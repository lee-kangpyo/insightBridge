-- Migration: Create email_verifications table
-- Description: Stores email verification codes for user signup

CREATE TABLE IF NOT EXISTS email_verifications (
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (email, code)
);

-- Index for faster lookup during verification
CREATE INDEX IF NOT EXISTS idx_email_verifications_email
ON email_verifications(email);

-- Index for cleanup of expired codes
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at
ON email_verifications(expires_at);