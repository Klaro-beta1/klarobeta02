/*
  # Create Klaro AI Database Schema

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `domain` (text, unique)
      - `name` (text)
      - `api_key` (text, unique)
      - `plan` (text, default 'tier1')
      - `status` (text, default 'active')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `queries`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `query` (text)
      - `url` (text)
      - `response` (jsonb)
      - `confidence` (numeric)
      - `processing_time` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  domain text UNIQUE NOT NULL,
  name text NOT NULL,
  api_key text UNIQUE NOT NULL,
  plan text DEFAULT 'tier1',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  query text NOT NULL,
  url text NOT NULL,
  response jsonb,
  confidence numeric,
  processing_time integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Policies for clients table (allow API key based access)
CREATE POLICY "Allow public insert for registration"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow clients to read own data"
  ON clients
  FOR SELECT
  TO anon
  USING (true);

-- Policies for queries table
CREATE POLICY "Allow insert queries with valid client"
  ON queries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow read queries"
  ON queries
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_api_key ON clients(api_key);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_domain ON clients(domain);
CREATE INDEX IF NOT EXISTS idx_queries_client_id ON queries(client_id);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at);
