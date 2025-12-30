-- ============================================
-- Add Profile Auto-Creation Trigger
-- ============================================
-- This trigger automatically creates a profile when a user signs up
-- Run this AFTER running complete_schema.sql

-- Function to create profile for new users
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, first_name, phone)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires when new user created in auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- Add INSERT policy for profiles
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
TO service_role
WITH CHECK (true);
