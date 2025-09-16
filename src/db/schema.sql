-- Create the clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for the clients table
-- This is a security best practice in Supabase.
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Create policies to define access rules for the 'clients' table.

-- 1. Allow authenticated users to view all clients.
CREATE POLICY "Allow authenticated users to view clients"
ON clients
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow authenticated users to insert new clients.
CREATE POLICY "Allow authenticated users to insert clients"
ON clients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Allow authenticated users to update their own clients (optional, if needed).
--    This example assumes you might add a user_id column to track who created the client.
--    If you add a user_id column: ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
--
-- CREATE POLICY "Allow users to update their own clients"
-- ON clients
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

-- 4. Allow authenticated users to delete their own clients (optional, if needed).
-- CREATE POLICY "Allow users to delete their own clients"
-- ON clients
-- FOR DELETE
-- TO authenticated
-- USING (auth.uid() = user_id);
