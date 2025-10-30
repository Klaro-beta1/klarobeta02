/*
  # Add Demo Mode Tracking and Demo Client

  1. Changes to queries table
    - Add `mode` column to track whether response was from mock AI or real AI
    - Add `highlight` column to store highlight selectors
    - Add `steps` column to store step-by-step guidance

  2. Demo Client
    - Insert a demo client with API key 'klaro_demo123test' for testing
    - This allows the demo page to work without registration

  3. Important Notes
    - Uses IF NOT EXISTS to prevent errors on re-run
    - Demo client allows unlimited testing without authentication
*/

-- Add new columns to queries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'mode'
  ) THEN
    ALTER TABLE queries ADD COLUMN mode text DEFAULT 'mock';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'highlight'
  ) THEN
    ALTER TABLE queries ADD COLUMN highlight text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'steps'
  ) THEN
    ALTER TABLE queries ADD COLUMN steps jsonb;
  END IF;
END $$;

-- Create or update demo client
INSERT INTO clients (id, email, domain, name, api_key, plan, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@klaro.ai',
  'demo.klaro.ai',
  'Demo Client',
  'klaro_demo123test',
  'demo',
  'active'
)
ON CONFLICT (api_key) DO UPDATE
SET
  updated_at = now(),
  status = 'active';

-- Create index for mode filtering
CREATE INDEX IF NOT EXISTS idx_queries_mode ON queries(mode);
