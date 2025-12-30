-- Fix RLS Policy for Profile Creation
-- Run this in Supabase SQL Editor

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also allow anon users to insert (for signup flow)
CREATE POLICY "Allow profile creation during signup"
ON profiles FOR INSERT
TO anon
WITH CHECK (true);
