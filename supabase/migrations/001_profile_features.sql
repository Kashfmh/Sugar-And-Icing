-- =====================================================
-- MIGRATION: Profile Features (Avatar Upload & Recently Viewed)
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create recently_viewed table
CREATE TABLE IF NOT EXISTS recently_viewed (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_date 
ON recently_viewed(user_id, viewed_at DESC);

-- 2. Add avatar_url to profiles table (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 3. Storage bucket for avatars
-- NOTE: This must be created in Supabase Dashboard > Storage
-- Bucket name: "avatars"
-- Public: false
-- File size limit: 5242880 (5MB)
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- 4. Storage policies for avatars bucket
-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view avatars (public read)
CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'avatars');

-- 5. Enable RLS on recently_viewed table
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for recently_viewed
-- Users can view their own recently viewed products
CREATE POLICY "Users can view own recently viewed" 
ON recently_viewed 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can insert their own recently viewed
CREATE POLICY "Users can insert own recently viewed" 
ON recently_viewed 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own recently viewed
CREATE POLICY "Users can delete own recently viewed" 
ON recently_viewed 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 7. Grant permissions
GRANT SELECT, INSERT, DELETE ON recently_viewed TO authenticated;
