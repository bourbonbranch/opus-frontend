-- Migration: Add publish fields to seating_configurations table (Approach A)

ALTER TABLE seating_configurations
ADD COLUMN published_at TIMESTAMPTZ NULL,
ADD COLUMN published_by_user_id INT NULL,
ADD COLUMN publish_note TEXT NULL;

-- Optional: Index on published_at for faster queries
CREATE INDEX idx_seating_configurations_published_at ON seating_configurations(published_at);
