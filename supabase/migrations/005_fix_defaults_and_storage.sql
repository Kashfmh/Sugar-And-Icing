-- Fix Defaults and Ensure Storage Bucket Exists

-- 1. Set default preferred_contact_method to 'whatsapp'
ALTER TABLE profiles 
ALTER COLUMN preferred_contact_method SET DEFAULT 'whatsapp';

-- Update existing NULLs to 'whatsapp' (optional, but good for consistency)
UPDATE profiles 
SET preferred_contact_method = 'whatsapp' 
WHERE preferred_contact_method IS NULL;

-- 2. Ensure 'avatars' bucket exists (Idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Ensure Storage Policies exist (Idempotent-ish replacement)
-- We drop and recreate to be sure
DROP POLICY IF EXISTS "Avatar Public View" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Delete" ON storage.objects;

-- View: Public
CREATE POLICY "Avatar Public View" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Upload: Authenticated users can upload their own files
CREATE POLICY "Avatar User Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Update: Users can update their own files
CREATE POLICY "Avatar User Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Delete: Users can delete their own files
CREATE POLICY "Avatar User Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );
