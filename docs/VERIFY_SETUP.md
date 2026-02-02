# Phase 0 Setup Verification Checklist

Use this checklist to verify that your Supabase database is set up correctly.

## 1. Verify Tables Were Created

Go to your Supabase dashboard → **Table Editor**

You should see these 17 tables:

### Core Tables (3)
- ✓ `users`
- ✓ `households`
- ✓ `household_members`

### Nutrition Tables (5)
- ✓ `ingredients`
- ✓ `recipes`
- ✓ `recipe_ingredients`
- ✓ `meal_plans`
- ✓ `meal_plan_slots`
- ✓ `shopping_lists`
- ✓ `shopping_list_items`

### Exercise Tables (4)
- ✓ `exercises`
- ✓ `workout_templates`
- ✓ `workout_schedules`
- ✓ `scheduled_workouts`

### Progress Tables (3)
- ✓ `weight_logs`
- ✓ `workout_logs`
- ✓ `cycling_logs`

## 2. Verify Row Level Security (RLS)

In the Supabase dashboard, click on each table and check:

1. Click on any table
2. Click on "RLS" in the table menu
3. Verify that **"Row Level Security is enabled"** appears
4. You should see multiple policies for each table

### Expected Policies Count
- `users`: 3 policies
- `households`: 1 policy
- `household_members`: 1 policy
- `ingredients`: 1 policy (SELECT for authenticated)
- `recipes`: 1 policy (SELECT for authenticated)
- `recipe_ingredients`: 1 policy (SELECT for authenticated)
- `meal_plans`: 2 policies
- `meal_plan_slots`: 1 policy
- `shopping_lists`: 2 policies
- `shopping_list_items`: 1 policy
- `exercises`: 1 policy (SELECT for authenticated)
- `workout_templates`: 1 policy (SELECT for authenticated)
- `workout_schedules`: 2 policies
- `scheduled_workouts`: 2 policies
- `weight_logs`: 2 policies
- `workout_logs`: 2 policies
- `cycling_logs`: 2 policies

## 3. Verify Helper Function

Go to **Database** → **Functions**

You should see:
- ✓ `get_user_household_ids()` - Returns the household IDs for the current user
- ✓ `update_updated_at_column()` - Trigger function for updating timestamps

## 4. Quick SQL Verification (Optional)

If you want to verify via SQL, go to **SQL Editor** and run:

```sql
-- Check table count (should return 17)
SELECT COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public';

-- List all tables
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check RLS is enabled on all tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected result: All tables should show `rls_enabled = true`

## 5. Next Steps: Seed Initial Data

Once you've verified the schema is correct, load the seed data:

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy and paste the contents of `supabase/seed.sql`
4. Click "Run" or press Cmd/Ctrl + Enter

This will create:
- 1 household
- 2 user profiles (placeholder - see note below)
- ~35 ingredients
- 8 sample recipes
- 8 exercises with safety notes

### Important Note About User IDs

The seed file creates placeholder user records, but these won't work with authentication yet. After you create actual auth users:

1. Go to **Authentication** → **Users** in Supabase
2. Create two users with email/password
3. Note their User IDs (UUIDs)
4. Update the seed data by running:

```sql
-- Update Fernando's user record
UPDATE users
SET id = '<actual-auth-uid-from-auth-users>'
WHERE email = 'fernando@example.com';

-- Update Wife's user record
UPDATE users
SET id = '<actual-auth-uid-from-auth-users>'
WHERE email = 'wife@example.com';

-- Update household members
UPDATE household_members
SET user_id = '<fernando-auth-uid>'
WHERE user_id = '00000000-0000-0000-0000-000000000101';

UPDATE household_members
SET user_id = '<wife-auth-uid>'
WHERE user_id = '00000000-0000-0000-0000-000000000102';
```

## 6. Get API Credentials

For the React app to connect:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**
   - **anon public** key

3. Create `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://csquzljkicoawrgqfkav.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 7. Test the React App

```bash
npm run dev
```

Open http://localhost:5173/training-plan/

You should see:
- ✓ No Supabase credential warnings in console
- ✓ "Phase 0: Foundation Setup Complete" message
- ✓ No authentication errors (if you haven't created users yet, that's fine)

## Verification Complete! ✅

If all the above checks pass, your Phase 0 setup is complete and you're ready for Phase 1 (Meal Planning MVP).
