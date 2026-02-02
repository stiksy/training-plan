# Agent-Specific Guidelines

## For UX/Frontend Agents
- **Component library**: Use shadcn/ui or Material-UI (decide during scaffolding)
- **Responsive design**: Mobile-first; test on 375px width minimum
- **Accessibility**: All interactive elements must be keyboard-navigable; use semantic HTML
- **Real-time updates**: Subscribe to Supabase changes in component `useEffect`; see `/src/services/realtime.ts` for patterns

## For Backend/Data Agents
- **Supabase migrations**: Use `supabase migration new <name>` to create; never edit existing migrations
- **RLS policies**: Test with `auth.uid()` mocking in Supabase dashboard SQL editor
- **Seed data**: Keep `/supabase/seed.sql` up to date with 30 recipes and 50 exercises minimum
- **Indexes**: Add indexes on `household_id`, `user_id`, `date` columns for performance

## For Training Logic Agents
- **Constraint enforcement**: See `/src/logic/workoutConstraints.ts` for filtering rules
- **Variety check**: Implement in `/src/logic/workoutScheduler.ts`; no consecutive-day repeats by category
- **Cycling progression**: 14-week plan logic in `/src/logic/cyclingPlan.ts`; adjust phase durations if event date changes
- **Pain flag handling**: See `/src/logic/adaptiveTraining.ts` for substitution logic

## For Nutrition Logic Agents
- **Unit conversion**: Central library in `/src/logic/unitConversion.ts`; use for all ingredient math
- **Shopping list aggregation**: Algorithm in `/src/logic/shoppingListGenerator.ts`; test with edge cases (duplicate ingredients, zero quantities)
- **Swap matching**: Logic in `/src/logic/mealSwaps.ts`; match by meal type and kid-friendly flag
- **Brazilian recipes**: Consult `/docs/recipes/brazilian-meal-ideas.md` for culturally appropriate options

## Conflict Resolution
If this file conflicts with `CLAUDE.md`, `CLAUDE.md` takes precedence (it defines project-wide rules; this file is agent-specific guidance).
