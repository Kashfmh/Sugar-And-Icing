-- FINAL FIX for Recently Viewed
-- Run this in Supabase SQL Editor
-- This will RESET the table to ensure it is 100% correct

-- 1. Drop existing table to clear any bad state
DROP TABLE IF EXISTS recently_viewed CASCADE;

-- 2. Recreate table with perfect constraints
CREATE TABLE recently_viewed (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 3. Create helpful index
CREATE INDEX idx_recently_viewed_user_desc 
ON recently_viewed(user_id, viewed_at DESC);

-- 4. Enable RLS
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (Explicit & Simple)

-- VIEW: My own history
CREATE POLICY "view_own_history" 
ON recently_viewed FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- INSERT: My own history
CREATE POLICY "insert_own_history" 
ON recently_viewed FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: My own history (for timestamp updates)
CREATE POLICY "update_own_history" 
ON recently_viewed FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- DELETE: My own history
CREATE POLICY "delete_own_history" 
ON recently_viewed FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 6. Grant basic permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON recently_viewed TO authenticated;

-- 7. Verification Query (Run this manually after executing above to check)
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'recently_viewed';
