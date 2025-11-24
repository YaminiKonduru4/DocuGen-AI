-- Create `profiles` table to store user display names and emails
-- Run this in your Supabase SQL editor if the `profiles` table does not exist.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  updated_at timestamptz DEFAULT now()
);

-- Optional: create an index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
