-- Verify all tables were created
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count tables (should be 17)
SELECT COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public';

-- Verify RLS is enabled on all tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if helper function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_household_ids';
