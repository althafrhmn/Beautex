-- Add manager_pin column to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS manager_pin TEXT DEFAULT '1234';

-- Ensure all existing salons have a default PIN
UPDATE salons SET manager_pin = '1234' WHERE manager_pin IS NULL;
