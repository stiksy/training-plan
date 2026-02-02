# Claude Code Governance: Exercise + Nutrition Tracker

## Project Overview
Web-based health tracking system for a two-person household. Meal planning, exercise scheduling, and progress tracking with shared data access.

## Architecture Decisions
- **Frontend**: Static site hosted on GitHub Pages (React with TypeScript)
- **Backend**: Supabase (PostgreSQL + real-time + auth)
- **Auth**: Supabase email/password, JWT tokens, RLS policies
- **Sync**: Real-time subscriptions for meal plans, shopping lists, workouts

## Critical Constraints (DO NOT VIOLATE)
1. **Safety-first**: All exercises must respect health constraints (diastasis, knee issues)
2. **30-minute cap**: Weekday workouts ≤30 min; weekend cycling rides ≤120 min (event prep exception)
3. **Kid-friendly dinners**: All dinner recipes must be family-appropriate
4. **Non-medical disclaimer**: Prominently displayed; no medical advice or diagnosis features

## Code Conventions
- **Language**: UK English throughout (e.g. "colour", "favour", "organised")
- **Testing**: All logic functions (meal swaps, shopping list aggregation, workout constraints) must have unit tests
- **Database**: Use Supabase migrations; never alter schema directly in production
- **RLS**: All tables must have household_id-scoped policies; test with multiple users

## File Structure
```
/src
  /components       # React UI components
  /services         # API client, Supabase wrappers
  /logic            # Workout generation, meal swaps, shopping list aggregation
  /types            # TypeScript interfaces
/docs
  /plans            # Implementation plans
  /adr              # Architecture decision records
  /recipes          # Recipe reference documents
/supabase
  /migrations       # SQL schema versions
  /seed.sql         # Initial data (recipes, exercises)
```

## Development Workflow
1. Create feature branch from `main`
2. Implement with tests
3. Manual testing in Supabase staging project (if available) or local
4. Merge to `main` → auto-deploy to GitHub Pages
5. Monitor Supabase logs for errors

## Future Agents: Read This First
- Meal/workout logic lives in `/src/logic`; never hardcode constraints in UI components
- Recipe database seed is in `/supabase/seed.sql`; update there, not in code
- Exercise library is in `/supabase/seed.sql` with YouTube links
- Real-time subscriptions are set up in `/src/services/realtime.ts`; reuse patterns there

## Security Notes
- Never commit Supabase anon key to public repos (use environment variables)
- RLS policies are the primary security boundary; test thoroughly
- User passwords are handled by Supabase (never stored in frontend)
