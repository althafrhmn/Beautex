-- Add owner_email column to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS owner_email TEXT;
