# Supabase Setup Guide

This guide walks you through setting up a Supabase project for the Exercise & Nutrition Tracker.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Training Plan
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest region to your location
   - **Pricing Plan**: Free tier is sufficient for Phase 0 and beyond
4. Click "Create new project"
5. Wait for the project to be provisioned (1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Find and copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
3. Add these to your `.env.local` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Set Up Database Schema

1. In the Supabase dashboard, go to the **SQL Editor**
2. Open the migration files in the `supabase/migrations` folder
3. Run them in order:
   - `001_create_core_tables.sql` - Creates users, households, and relationships
   - `002_create_nutrition_tables.sql` - Creates recipe and meal planning tables
   - `003_create_exercise_tables.sql` - Creates exercise and workout tables
   - `004_create_progress_tables.sql` - Creates logging tables
   - `005_create_rls_policies.sql` - Sets up row-level security

**Alternative**: If you have the Supabase CLI installed, you can run:
```bash
supabase db push
```

## Step 4: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (it should be enabled by default)
3. Configure email settings:
   - **Enable email confirmations**: Optional (disable for easier testing)
   - **Secure email change**: Enabled (recommended)

## Step 5: Seed Initial Data

1. In the SQL Editor, run the seed file:
   - `supabase/seed.sql` - Creates household and two user profiles

This will create:
- One household
- Two user profiles (you and your wife) with appropriate health constraints
- Initial set of recipes (30 Brazilian-inspired meals)
- Exercise library (50 exercises with YouTube links)

## Step 6: Configure GitHub Secrets (for deployment)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Step 7: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Open the browser console and check for any Supabase connection errors
3. If configured correctly, you should see no warnings about missing credentials

## Supabase CLI (Optional but Recommended)

For easier local development and migration management:

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your local project to Supabase:
   ```bash
   supabase link --project-ref your-project-id
   ```

3. You can now use commands like:
   - `supabase db pull` - Pull the schema from remote
   - `supabase db push` - Push local migrations to remote
   - `supabase migration new <name>` - Create a new migration
   - `supabase db reset` - Reset local database

## Troubleshooting

### "Invalid API key" error
- Check that your `.env.local` file exists and has the correct values
- Make sure you're using the **anon public** key, not the **service_role** key
- Restart your development server after changing environment variables

### Authentication not working
- Verify that email authentication is enabled in Supabase
- Check the browser console for detailed error messages
- Ensure RLS policies are correctly set up (run migration 005)

### Data not syncing between devices
- Check that RLS policies allow access to your household_id
- Verify that real-time subscriptions are enabled in Supabase settings
- Look for WebSocket connection errors in the browser console

## Next Steps

Once Supabase is set up:
1. Proceed to Phase 1: Meal Planning MVP
2. Test authentication by creating user accounts
3. Verify that household data is shared between users
4. Monitor the Supabase logs for any errors

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
