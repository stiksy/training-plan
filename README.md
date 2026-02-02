# Exercise & Nutrition Tracker

A web-based health tracking system for a two-person household, enabling shared meal planning, exercise scheduling, and progress tracking.

## Features

- **Shared meal planning** with Brazilian-inspired, kid-friendly recipes
- **Automated shopping list generation** with ingredient deduplication
- **Daily exercise suggestions** with injury-aware constraints
- **Cycling-focused progression** for endurance events
- **Real-time synchronisation** across devices

## Architecture

- **Frontend**: React + TypeScript, hosted on GitHub Pages
- **Backend**: Supabase (PostgreSQL + real-time subscriptions)
- **Authentication**: Supabase email/password with row-level security

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/training-plan.git
   cd training-plan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Follow the instructions in `docs/SUPABASE_SETUP.md`
   - Run the migrations in the `supabase/migrations` folder

4. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Supabase credentials.

5. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment

The application automatically deploys to GitHub Pages when you push to the `main` branch.

Before deploying:
1. Enable GitHub Pages in your repository settings
2. Set `Source` to `GitHub Actions`
3. Add your Supabase credentials as repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
/src
  /components       # React UI components
  /services         # API client, Supabase wrappers
  /logic            # Business logic (workouts, meals, shopping lists)
  /types            # TypeScript interfaces
/docs
  /plans            # Implementation plans
  /recipes          # Recipe reference documents
/supabase
  /migrations       # Database schema versions
```

## Documentation

- [Implementation Plan](docs/plans/local-exercise-nutrition-tracker.md)
- [Supabase Setup Guide](docs/SUPABASE_SETUP.md)
- [Agent Guidelines](AGENTS.md)
- [Governance](CLAUDE.md)

## Development Workflow

1. Create a feature branch from `main`
2. Implement with tests
3. Test locally
4. Create a pull request
5. Merge to `main` → auto-deploys to GitHub Pages

## Safety Notes

This tool provides general fitness and nutrition suggestions for informational purposes only. It is **not medical advice**. Always consult qualified healthcare professionals before starting any new exercise or nutrition programme.

## Licence

Private project for household use.
