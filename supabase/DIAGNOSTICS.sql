-- DIAGNOSTIC: Check Recently Viewed Data
-- Run these queries in Supabase SQL Editor to debug

-- 1. Check if table exists and has RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'recently_viewed';

-- 2. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'recently_viewed';

-- 3. Check if ANY data exists (as superuser/admin)
SELECT COUNT(*) as total_rows FROM recently_viewed;

-- 4. Check YOUR data (replace with your actual user ID from auth.users)
-- First get your user ID:
SELECT id, email FROM auth.users LIMIT 5;

-- Then check your recently viewed (replace YOUR_USER_ID):
-- SELECT * FROM recently_viewed WHERE user_id = 'YOUR_USER_ID';

-- 5. Try manual insert test (replace YOUR_USER_ID and A_PRODUCT_ID):
-- INSERT INTO recently_viewed (user_id, product_id, viewed_at)
-- VALUES (
--   'YOUR_USER_ID',
--   (SELECT id FROM products LIMIT 1),  -- Use any product
--   now()
-- );

-- 6. If insert fails, check error message and policies
