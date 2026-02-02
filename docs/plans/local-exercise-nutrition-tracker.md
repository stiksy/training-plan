# Local Exercise + Nutrition Tracker: Implementation Plan

**Document version**: 1.0
**Target deployment**: GitHub Pages (frontend) + shared backend
**Date**: 2 February 2026
**Status**: Planning phase

---

## Executive Summary

This plan outlines the implementation of a web-based health tracking system for a two-person household, enabling shared meal planning, exercise scheduling, and progress tracking. The system must support static hosting on GitHub Pages whilst providing real-time shared data access for meal plans, workout schedules, shopping lists, and logs.

**Key architectural challenge**: Enabling shared, synchronised data access from a static GitHub Pages frontend requires careful backend selection and sync strategy.

**Recommended approach**: Supabase Backend-as-a-Service with PostgreSQL database, real-time subscriptions, and row-level security.

---

## 1. Goals, Non-Goals, and Success Metrics

### Goals

1. **Shared household workspace** where both users access the same meal plans, shopping lists, and workout schedules
2. **Weekly meal planning** with Brazilian-inspired, kid-friendly recipes and the ability to swap meals
3. **Automated shopping list generation** from selected meals with ingredient deduplication
4. **Daily exercise suggestions** (≤30 minutes) with injury-aware constraints and YouTube technique links
5. **Cycling-focused progression** for the 17 May Hampshire Hilly Hundred (68 miles)
6. **Calorie deficit support** with conservative, sustainable nutrition guidance
7. **Injury-safe programming** for abdominal diastasis and knee chondromalacia

### Non-Goals

- Medical diagnosis or treatment advice
- Social network features or multi-household sharing
- Macro tracking beyond basic calorie awareness
- Professional physique optimisation programming
- Mobile native apps (web-first, responsive design)
- Real-time video coaching or AI form analysis
- Integration with third-party fitness devices (MVP)

### Success Metrics

**Quantitative**
- System generates weekly meal plan in <3 seconds
- Shopping list aggregates ingredients with 100% accuracy
- Workout variety: no exercise category repeated on consecutive days
- Page load time <2 seconds on 3G connection
- Data sync latency <1 second for updates
- Zero workout suggestions that violate injury constraints

**Qualitative**
- Users can plan a week's meals in <10 minutes
- Meal swap interface is intuitive (≤2 clicks to swap)
- Exercise safety notes are prominent and clear
- Non-medical disclaimer is visible but non-intrusive
- Cycling progression feels achievable and structured

**User outcome targets** (12-week horizon)
- Sustainable calorie deficit maintained (not measured by system)
- Zero injury aggravations from prescribed exercises
- Me: prepared for 68-mile ride (17 May)
- Wife: improved strength without diastasis/knee issues

---

## 2. UX and Feature Set

### MVP (Minimum Viable Product)

**Essential for day-one use**

1. **User profiles**
   - Basic info: name, age, height, weight, goals
   - Health constraints (diastasis, knee issues, cycling goal)
   - Activity preferences

2. **Weekly meal planner**
   - Grid view: 7 days × 3 meals (breakfast, lunch, dinner)
   - Pre-populated with sensible defaults
   - Click-to-swap interface with 3–5 alternatives per meal slot
   - Visual indicators for kid-friendly dinners

3. **Shopping list generator**
   - One-click generation from current week's meals
   - Grouped by category (produce, protein, pantry, etc.)
   - Quantities aggregated and deduplicated
   - Print and export (plain text, PDF)

4. **Workout calendar**
   - 7-day view with daily workout cards
   - Exercise name, duration, intensity
   - Contraindication badges (e.g. "Knee-safe", "Diastasis-modified")
   - YouTube links for gym exercises
   - Mark as complete/skip with optional note

5. **Exercise library**
   - Searchable list of all available exercises
   - Filterable by type, duration, difficulty, equipment
   - Safety notes and modifications
   - YouTube technique links

6. **Basic dashboard**
   - Current week overview
   - Quick access to shopping list
   - Workout completion streak
   - Next workout preview

### V1 (Post-MVP enhancements)

**Valuable additions after MVP validation**

7. **Progress tracking**
   - Weekly weight log (optional)
   - Workout completion history
   - Cycling-specific metrics (distance, avg speed, elevation)
   - Simple charts (completion rate, training volume)

8. **Meal history and favourites**
   - Mark meals as favourites
   - View past meal plans
   - Quick-add favourites to future weeks

9. **Workout adaptation logic**
   - Suggest replacement if session is skipped
   - Reduce intensity if pain is flagged
   - Reschedule missed cycling rides

10. **Shopping list enhancements**
    - Check-off items as purchased
    - Carry-over common pantry staples
    - Manual item additions

11. **Multi-week planning**
    - View/plan up to 4 weeks ahead
    - Copy previous week's meals
    - Template week creation

### Nice-to-Haves (Future considerations)

12. **Recipe detail pages** with cooking instructions and photos
13. **Meal prep suggestions** (batch cooking, advance prep)
14. **Exercise video filtering** (preferred YouTube channels)
15. **Weather-aware cycling suggestions** (API integration)
16. **Export full training plan** to cycling computer (GPX/FIT)
17. **Shared notes** on meals and workouts
18. **Calorie estimate ranges** (optional, conservative)
19. **Dark mode** theme

---

## 3. Information Architecture and Data Model

### Core Entities

#### Users
```
User {
  id: uuid (PK)
  name: string
  email: string
  age: integer
  height_cm: decimal
  weight_kg: decimal
  goals: text[]
  health_constraints: text[]
  activity_preferences: text[]
  created_at: timestamp
  updated_at: timestamp
}
```

#### Household
```
Household {
  id: uuid (PK)
  name: string
  created_at: timestamp
}

HouseholdMember {
  household_id: uuid (FK)
  user_id: uuid (FK)
  role: enum('admin', 'member')
}
```

#### Recipes and Ingredients
```
Ingredient {
  id: uuid (PK)
  name: string
  category: enum('produce', 'protein', 'dairy', 'grain', 'pantry', 'spice', 'other')
  default_unit: enum('g', 'ml', 'units', 'tbsp', 'tsp', 'cup')
}

Recipe {
  id: uuid (PK)
  name: string
  meal_type: enum('breakfast', 'lunch', 'dinner', 'snack')
  cuisine_tags: text[] (e.g. ['brazilian', 'kid-friendly'])
  servings: integer
  prep_time_min: integer
  cook_time_min: integer
  instructions: text
  image_url: string (nullable)
  created_at: timestamp
}

RecipeIngredient {
  recipe_id: uuid (FK)
  ingredient_id: uuid (FK)
  quantity: decimal
  unit: string
}
```

#### Meal Plans
```
MealPlan {
  id: uuid (PK)
  household_id: uuid (FK)
  week_start_date: date
  status: enum('draft', 'active', 'archived')
  created_at: timestamp
  updated_at: timestamp
}

MealPlanSlot {
  id: uuid (PK)
  meal_plan_id: uuid (FK)
  day_of_week: integer (0-6, Monday=0)
  meal_type: enum('breakfast', 'lunch', 'dinner')
  recipe_id: uuid (FK)
}
```

#### Shopping Lists
```
ShoppingList {
  id: uuid (PK)
  household_id: uuid (FK)
  meal_plan_id: uuid (FK, nullable)
  week_date: date
  status: enum('pending', 'completed')
  created_at: timestamp
}

ShoppingListItem {
  id: uuid (PK)
  shopping_list_id: uuid (FK)
  ingredient_id: uuid (FK)
  quantity: decimal
  unit: string
  category: string
  checked: boolean
}
```

#### Exercises and Workouts
```
Exercise {
  id: uuid (PK)
  name: string
  category: enum('cardio', 'strength', 'flexibility', 'sport')
  subcategory: string (e.g. 'cycling', 'yoga', 'upper-body')
  duration_min: integer
  intensity: enum('low', 'moderate', 'high')
  equipment: text[]
  contraindications: text[] (e.g. ['knee-stress', 'diastasis-risk'])
  modifications: text
  youtube_url: string (nullable)
  safety_notes: text
}

WorkoutTemplate {
  id: uuid (PK)
  name: string
  target_user_profile: json (constraints and goals)
  exercises: json[] (exercise_id, order, duration_override)
  total_duration_min: integer
}

WorkoutSchedule {
  id: uuid (PK)
  household_id: uuid (FK)
  user_id: uuid (FK)
  week_start_date: date
  created_at: timestamp
}

ScheduledWorkout {
  id: uuid (PK)
  schedule_id: uuid (FK)
  date: date
  workout_template_id: uuid (FK, nullable)
  custom_exercises: json (if not template-based)
  status: enum('pending', 'completed', 'skipped')
  completion_note: text (nullable)
  completed_at: timestamp (nullable)
}
```

#### Progress Logs
```
WeightLog {
  id: uuid (PK)
  user_id: uuid (FK)
  date: date
  weight_kg: decimal
}

WorkoutLog {
  id: uuid (PK)
  scheduled_workout_id: uuid (FK)
  user_id: uuid (FK)
  completed_exercises: json
  notes: text
  perceived_difficulty: integer (1-10)
  pain_reported: boolean
  logged_at: timestamp
}

CyclingLog {
  id: uuid (PK)
  user_id: uuid (FK)
  date: date
  distance_km: decimal
  duration_min: integer
  avg_speed_kph: decimal
  elevation_m: integer
  notes: text
}
```

### Unit Handling and Deduplication Strategy

**Unit normalisation**
- Store all weights in grams, volumes in millilitres internally
- Display layer converts to user-friendly units (cups, tablespoons, etc.)
- Conversion table: `1 cup = 240ml`, `1 tbsp = 15ml`, `1 tsp = 5ml`

**Shopping list aggregation**
1. Gather all `RecipeIngredient` entries for the week's selected recipes
2. Normalise all quantities to base units (g/ml)
3. Group by `ingredient_id` and sum quantities
4. Convert back to most appropriate display unit (prefer whole numbers)
5. Round up to practical shopping quantities (e.g. 230g → 250g)

**Deduplication rules**
- Exact ingredient ID match: aggregate quantities
- Pantry staples (oils, spices <5g): flag as "check pantry first"
- Manual additions: append to appropriate category without deduplication

---

## 4. Training Engine

### Design Principles

1. **30-minute daily cap** (strict): no single session exceeds 30 minutes
2. **Variety mandate**: no exercise category on consecutive days (e.g. no upper-body strength Mon+Tue)
3. **Injury-aware constraints**: automatic filtering and modifications
4. **Cycling progression**: structured build toward 68-mile goal (17 May)
5. **Adaptation**: logic to adjust for missed sessions or pain flags

### Wife-Safe Constraints (Diastasis + Knee)

**Prohibited exercises**
- Sit-ups, crunches, planks (diastasis risk)
- High-impact jumping (knee stress)
- Deep squats, lunges with heavy load (knee stress)

**Preferred modifications**
- Core: pelvic floor activation, bird dogs, dead bugs, side planks (modified)
- Lower body: wall sits, glute bridges, clamshells, step-ups (low height)
- Cardio: dancing (low-impact), yoga (modified poses), swimming, walking

**Safety rules**
- Tag all exercises with `contraindications: ['diastasis-risk', 'knee-stress']`
- Auto-filter Wife's workout suggestions
- Display prominent safety notes: "Modified for diastasis safety"

### Cycling Progression (17 May Goal)

**Current status** (2 Feb): 14 weeks to event
**Target**: Complete 68 miles (109 km) comfortably

**Phase 1: Base building (Weeks 1–6)**
- 2 rides/week: 1× endurance (60–90 min), 1× tempo (30–45 min)
- Gradual distance increase: 20km → 40km on long ride
- Midweek ride: 15–25km at moderate intensity
- Non-cycling days: light yoga or rest

**Phase 2: Build + specificity (Weeks 7–11)**
- 2–3 rides/week: 1× long (90–120 min), 1× intervals, 1× recovery (optional)
- Long ride distance: 40km → 70km
- Hill work: introduce climbs to prepare for "Hilly Hundred"
- Back-to-back rides (Sat/Sun) in weeks 9–10

**Phase 3: Taper (Weeks 12–14)**
- Reduce volume by 30–50%
- Maintain intensity but shorten durations
- Final long ride (80km) on week 12, then taper
- Week 14: easy spins only, rest 2 days before event

**Non-cycling training**
- Core stability (diastasis-safe): 2×/week
- Upper body/general strength: 1×/week
- Flexibility/yoga: 1×/week

### Sample Two-Week Schedule

#### Week 1 (2–8 Feb)

**Me (41M, 85kg, cycling-focused)**

| Day       | Workout                                                                 | Duration | Notes                              |
|-----------|-------------------------------------------------------------------------|----------|------------------------------------|
| Monday    | Core + upper body strength (gym)                                        | 30 min   | YouTube: proper form links         |
| Tuesday   | Cycling: endurance ride (flat route)                                    | 60 min   | 20–25 km, conversational pace      |
| Wednesday | Rest / active recovery walk                                             | 20 min   | Optional                           |
| Thursday  | Cycling: tempo intervals                                                | 30 min   | 3×5 min efforts, 2 min recovery    |
| Friday    | Yoga flow (flexibility)                                                 | 25 min   | YouTube: cycling-specific stretch  |
| Saturday  | Cycling: long endurance ride                                            | 90 min   | 30–35 km, include small hills      |
| Sunday    | Rest or light walk                                                      | —        | Recovery day                       |

**Wife (34F, 70kg, diastasis + knee constraints)**

| Day       | Workout                                                                 | Duration | Notes                              |
|-----------|-------------------------------------------------------------------------|----------|------------------------------------|
| Monday    | Low-impact dance cardio                                                 | 25 min   | YouTube: knee-friendly routines    |
| Tuesday   | Core stability (diastasis-safe)                                         | 20 min   | Bird dogs, dead bugs, pelvic floor |
| Wednesday | Yoga (modified poses)                                                   | 30 min   | Avoid deep lunges and planks       |
| Thursday  | Walking intervals                                                       | 30 min   | 5 min easy, 2 min brisk × 4        |
| Friday    | Upper body + glutes (gym)                                               | 25 min   | Glute bridges, clamshells, rows    |
| Saturday  | Dancing (style of choice)                                               | 30 min   | Fun, expressive movement           |
| Sunday    | Rest or gentle stretch                                                  | —        | Recovery day                       |

#### Week 2 (9–15 Feb)

**Me**

| Day       | Workout                                                                 | Duration | Notes                              |
|-----------|-------------------------------------------------------------------------|----------|------------------------------------|
| Monday    | Lower body strength (gym)                                               | 30 min   | Squats, deadlifts (moderate load)  |
| Tuesday   | Cycling: endurance ride                                                 | 60 min   | 22–28 km, include 2–3 small climbs |
| Wednesday | Rest / active recovery walk                                             | 20 min   | Optional                           |
| Thursday  | Cycling: hill repeats                                                   | 30 min   | Find local hill, 4×3 min climbs    |
| Friday    | Core + flexibility                                                      | 25 min   | Planks, side planks, stretching    |
| Saturday  | Cycling: long endurance ride                                            | 100 min  | 35–40 km, varied terrain           |
| Sunday    | Rest                                                                    | —        | Recovery day                       |

**Wife**

| Day       | Workout                                                                 | Duration | Notes                              |
|-----------|-------------------------------------------------------------------------|----------|------------------------------------|
| Monday    | Yoga flow (balance focus)                                               | 30 min   | Tree pose, warrior variations      |
| Tuesday   | Low-impact cardio (dance or walking)                                    | 25 min   | Knee-friendly, moderate intensity  |
| Wednesday | Core stability (diastasis-safe)                                         | 20 min   | Side planks (knees down), dead bugs|
| Thursday  | Upper body strength (gym)                                               | 25 min   | Shoulder press, bicep curls, rows  |
| Friday    | Rest or gentle walk                                                     | 20 min   | Active recovery                    |
| Saturday  | Dancing + light yoga cool-down                                          | 30 min   | Enjoyable movement                 |
| Sunday    | Rest                                                                    | —        | Recovery day                       |

### Variety Rules (Implemented)

- **Category tracking**: assign each exercise to category (cardio-cycling, cardio-other, strength-upper, strength-lower, strength-core, flexibility, sport)
- **Consecutive check**: before assigning day N, check day N-1 for category conflicts
- **Fallback**: if all options violate variety, choose lowest-intensity conflict and flag for manual review

### Adaptation Logic

**Missed session**
- Cardio: reschedule within same week if ≤2 days behind
- Strength: allow 48-hour delayed session, then skip
- Cycling: priority reschedule; compress if needed

**Pain flag**
- Pause affected body part for 3 days
- Substitute with non-affected exercises
- Display "Recovery mode: [body part]" banner

**Cycling-specific**
- If long ride is missed: extend current phase by 1 week, adjust taper
- If multiple rides missed: notify and suggest reduced goal (e.g. 50-mile route instead)

---

## 5. Nutrition Engine

### Design Principles

1. **Conservative calorie deficit**: no extreme restriction, sustainable eating
2. **Brazilian-inspired**: familiar flavours and ingredients
3. **Kid-friendly dinners**: shared household meal, practical for two daughters
4. **Variety**: different meals each day, repeats allowed week-to-week
5. **Swap flexibility**: 3–5 alternatives per meal slot, similar nutrition profile

### Meal Structure

**Breakfast** (7 options, rotated)
- Tapioca with cheese and tomato
- Scrambled eggs with wholemeal toast and avocado
- Fruit smoothie bowl with granola
- Oats porridge with banana and cinnamon
- Pão francês with requeijão and papaya
- Greek yoghurt with berries and honey
- Omelette with mushrooms and spinach

**Lunch** (10 options, higher variety)
- Grilled chicken breast with quinoa and salad
- Black bean and sweet potato stew
- Tuna salad with mixed greens and olive oil
- Brown rice with grilled fish and vegetables
- Lentil soup with wholemeal bread
- Turkey wrap with hummus and salad
- Pasta with tomato sauce and lean mince
- Chicken parmigiana (lighter version) with salad
- Grilled salmon with roasted vegetables
- Chickpea and vegetable curry (mild)

**Dinner** (10 options, kid-friendly focus)
- **Feijoada** (simplified, less fatty): black beans, lean pork, rice, collard greens, orange slices
- **Strogonoff de frango**: chicken stroganoff with rice and potato sticks
- **Picanha with farofa**: grilled steak (moderate portion), farofa, vinaigrette salad
- **Moqueca de peixe**: Brazilian fish stew with coconut milk, rice, pirão
- **Frango assado with batata**: roast chicken, roast potatoes, steamed broccoli
- **Spaghetti bolognese**: classic with lean mince, side salad
- **Tacos**: soft tortillas, seasoned mince, toppings bar (kids build their own)
- **Grilled chicken with rice and beans**: simple, classic Brazilian plate
- **Shepherd's pie**: mince with vegetables, mashed potato topping
- **Peixe grelhado**: grilled white fish, rice, farofa, tomato salad

### Swap Logic

**Criteria for swap alternatives**
- Same meal type (breakfast/lunch/dinner)
- Similar preparation complexity (±10 min cook time)
- Kid-friendly flag must match for dinners
- Allergen compatibility (future: user allergen profiles)

**UI flow**
1. User clicks meal card in weekly planner
2. Modal opens with 3–5 swap options
3. Each option shows: name, photo, prep time, "kid-friendly" badge
4. Click to swap → instant update, shopping list auto-recalculates
5. "Undo" option available for 5 seconds

### Sample One-Week Menu (with Swap Options)

| Day       | Breakfast                                    | Lunch                                       | Dinner                                      |
|-----------|----------------------------------------------|---------------------------------------------|---------------------------------------------|
| Monday    | Tapioca with cheese                          | Grilled chicken with quinoa                 | Feijoada (simplified)                       |
|           | *Swaps: Omelette, Smoothie bowl, Oats*       | *Swaps: Tuna salad, Lentil soup, Salmon*    | *Swaps: Strogonoff, Grilled chicken+rice*   |
| Tuesday   | Oats with banana                             | Black bean and sweet potato stew            | Strogonoff de frango                        |
|           | *Swaps: Greek yoghurt, Pão com requeijão*    | *Swaps: Chickpea curry, Pasta, Turkey wrap* | *Swaps: Spaghetti bolognese, Tacos*         |
| Wednesday | Scrambled eggs with toast                    | Turkey wrap with hummus                     | Moqueca de peixe                            |
|           | *Swaps: Tapioca, Omelette*                   | *Swaps: Grilled fish+rice, Chicken parm*    | *Swaps: Grilled fish, Shepherd's pie*       |
| Thursday  | Smoothie bowl with granola                   | Brown rice with grilled fish                | Tacos (build-your-own)                      |
|           | *Swaps: Greek yoghurt, Oats*                 | *Swaps: Salmon, Lentil soup*                | *Swaps: Spaghetti, Strogonoff*              |
| Friday    | Greek yoghurt with berries                   | Lentil soup with bread                      | Picanha with farofa                         |
|           | *Swaps: Smoothie, Oats*                      | *Swaps: Black bean stew, Chickpea curry*    | *Swaps: Roast chicken, Feijoada*            |
| Saturday  | Pão francês with requeijão                   | Chicken parmigiana with salad               | Frango assado (roast chicken)               |
|           | *Swaps: Tapioca, Scrambled eggs*             | *Swaps: Pasta, Turkey wrap*                 | *Swaps: Shepherd's pie, Grilled chicken*    |
| Sunday    | Omelette with mushrooms                      | Pasta with tomato and mince                 | Peixe grelhado (grilled fish)               |
|           | *Swaps: Scrambled eggs, Greek yoghurt*       | *Swaps: Strogonoff, Chicken+quinoa*         | *Swaps: Moqueca, Salmon*                    |

### Shopping List Aggregation Rules

**Process**
1. Extract all `RecipeIngredient` records for 21 meals (7 days × 3 meals)
2. Normalise units (convert to grams/millilitres)
3. Group by `ingredient_id`, sum quantities
4. Apply rounding rules:
   - Produce: round to nearest 50g (e.g. 230g tomatoes → 250g)
   - Proteins: round to nearest 100g (e.g. 680g chicken → 700g)
   - Liquids: round to nearest 100ml
   - Pantry staples <50g: mark "check pantry"
5. Convert to shopping-friendly units:
   - Produce: pieces/kg (e.g. "3 tomatoes" or "0.5 kg tomatoes")
   - Proteins: grams or pieces (e.g. "4 chicken breasts ~600g")
   - Dairy: litres/units (e.g. "1L milk", "200g cheese")
6. Sort by supermarket aisle order: produce → protein → dairy → grain → pantry → spices

**Category groupings**
- **Produce**: vegetables, fruits, herbs
- **Protein**: meat, fish, eggs
- **Dairy**: milk, cheese, yoghurt, requeijão
- **Grains**: rice, pasta, bread, oats, tapioca flour
- **Pantry**: oils, sauces, canned goods
- **Spices & seasoning**: salt, pepper, dried herbs

### Calorie Deficit Approach

**Conservative guidance** (non-prescriptive)
- System does **not** calculate or display calories by default
- Optional setting: "Show estimated calorie ranges" (off by default)
- If enabled: display rough ranges per meal (breakfast 300–400, lunch 400–600, dinner 500–700)
- Emphasis: portion awareness, whole foods, reduced processed foods
- No macro targets or strict counting

**Messaging**
- "These meals are designed to support a gentle, sustainable calorie deficit when paired with regular exercise."
- "Focus on consistency and enjoyment rather than perfection."

---

## 6. Safety, Disclaimers, and Guardrails

### Non-Medical Disclaimer

**Placement**
- First-run modal (cannot be dismissed accidentally)
- Footer link: "Health and Safety Information"
- Exercise library: banner at top

**Text**
> **Important Health Information**
>
> This tool provides general fitness and nutrition suggestions for informational purposes only. It is **not medical advice** and does not replace consultation with qualified healthcare professionals.
>
> **Before starting any new exercise or nutrition programme:**
> - Consult your GP, especially if you have existing health conditions
> - Inform your physiotherapist of any exercises if you're receiving treatment
> - Stop any activity that causes pain or discomfort
>
> This system includes injury-aware modifications, but individual responses vary. Always listen to your body.

### Pain and Injury Guardrails

**Pain flag workflow**
1. After marking workout complete, prompt: "Did you experience any pain or discomfort?"
2. If yes: "Which body part?" (dropdown: knee, lower back, shoulder, etc.)
3. System response:
   - Pause exercises targeting that area for 3 days
   - Display warning: "Recovery mode: [body part]. Consult a professional if pain persists."
   - Substitute alternative exercises

**Automatic constraint checks**
- Before generating workout: filter exercises by `contraindications` vs. user `health_constraints`
- Display badge on every affected exercise: "Modified for knee safety" / "Diastasis-safe version"
- YouTube links prioritise technique and injury prevention

### Default Low-Impact Substitutions

**If user flags multiple pain areas**
- Fall back to gentle options:
  - Cardio: walking, swimming
  - Strength: resistance bands, bodyweight (modified)
  - Flexibility: gentle yoga, stretching

**Emergency stop**
- If user flags pain >3 times in one week: display alert
- "We've noticed multiple pain reports. Please consult a healthcare professional before continuing. You can pause workout suggestions in Settings."

---

## 7. Hosting, Backend, and Sync Investigation

### Architectural Challenge

**Constraint**: Frontend must be hostable on GitHub Pages (static files, no server-side rendering).

**Requirement**: Two users must access and modify the same shared data (meal plans, shopping lists, workout schedules) with near-real-time synchronisation.

**Implication**: A backend service is required for data persistence and sync, but it must be compatible with a static frontend making client-side API calls.

---

### Option 1: Backend-as-a-Service (BaaS) — **Supabase**

#### Architecture

```
┌─────────────────────────────────────┐
│   GitHub Pages (Static Frontend)    │
│   - HTML, CSS, JS (React/Vue/etc)   │
│   - Supabase JS Client Library      │
└────────────┬────────────────────────┘
             │ HTTPS + WebSocket
             ▼
┌─────────────────────────────────────┐
│         Supabase Cloud              │
│  ┌──────────────────────────────┐   │
│  │  PostgreSQL Database         │   │
│  │  - All tables (users, meals, │   │
│  │    workouts, shopping lists) │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Authentication (Magic Links │   │
│  │  or Email/Password)          │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Row Level Security (RLS)    │   │
│  │  - household_id scoping      │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Real-time Subscriptions     │   │
│  │  - Broadcast changes to all  │   │
│  │    connected clients         │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Authentication Approach

- **Supabase Auth**: built-in email/password or magic link authentication
- Frontend calls `supabase.auth.signInWithPassword(email, password)`
- JWT tokens stored in browser `localStorage`
- Row-level security policies enforce `household_id` access control

**Sample RLS policy**:
```sql
CREATE POLICY "Users can access their household's meal plans"
ON meal_plans FOR ALL
USING (
  household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  )
);
```

#### Data Consistency Model

- **Strong consistency**: PostgreSQL with ACID guarantees
- **Optimistic UI updates**: frontend updates local state immediately, syncs in background
- **Conflict resolution**: last-write-wins (acceptable for low-contention household use)
- **Real-time subscriptions**: WebSocket broadcasts changes to all connected clients
  ```javascript
  supabase
    .channel('meal-plans')
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'meal_plan_slots' },
        (payload) => updateLocalState(payload.new)
    )
    .subscribe()
  ```

#### Cost Analysis (2 users, small household)

**Supabase Free Tier** (sufficient for MVP and beyond)
- 500 MB database space
- 5 GB bandwidth/month
- 2 GB file storage
- 50 MB file uploads
- 200,000 monthly active users
- Unlimited API requests

**Estimated usage** (2 users, active daily for 1 year):
- Database: <10 MB (meal plans, workouts, logs for 12 months)
- Bandwidth: ~500 MB/month (generous estimate for JSON API calls)
- File storage: ~100 MB (recipe images, user profiles)

**Verdict**: Free tier covers indefinitely. Paid tier ($25/month) only if scaling to friends/family.

#### Complexity and Maintenance

**Pros**
- Minimal backend code (Supabase handles infrastructure)
- Built-in auth, RLS, real-time out-of-the-box
- Excellent documentation and community
- Postgres = familiar SQL, powerful queries
- Automatic backups (daily on paid tier, manual exports on free)

**Cons**
- Vendor lock-in (migration requires data export + rewrite)
- RLS policies require careful design (testing via SQL)
- Real-time subscriptions add complexity to frontend state management
- Limited customisation of auth flows

**Maintenance burden**: Very low (no servers to manage, automatic updates)

---

### Option 2: Serverless API — **Cloudflare Workers + D1**

#### Architecture

```
┌─────────────────────────────────────┐
│   GitHub Pages (Static Frontend)    │
│   - Fetch API calls to Workers      │
└────────────┬────────────────────────┘
             │ HTTPS
             ▼
┌─────────────────────────────────────┐
│     Cloudflare Workers (Edge)       │
│  ┌──────────────────────────────┐   │
│  │  API Routes (JavaScript)     │   │
│  │  - GET/POST/PUT/DELETE       │   │
│  │  - Auth middleware           │   │
│  └────────────┬─────────────────┘   │
│               │                     │
│               ▼                     │
│  ┌──────────────────────────────┐   │
│  │  Cloudflare D1 (SQLite)      │   │
│  │  - Distributed edge database │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  KV Store (Session Tokens)   │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Authentication Approach

- **Custom JWT implementation**: Workers generate and verify tokens
- Login endpoint: `POST /api/auth/login` → returns JWT
- Frontend stores JWT in `localStorage`, includes in `Authorization` header
- Workers middleware validates JWT on every request

**Sample middleware**:
```javascript
async function authenticate(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { error: 'Unauthorized', status: 401 };

  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return { error: 'Invalid token', status: 401 };

  return { userId: payload.sub, householdId: payload.household_id };
}
```

#### Data Consistency Model

- **Eventual consistency**: D1 replicates across Cloudflare edge (typically <1 second)
- **Single-writer region**: writes go to primary region, reads from nearest edge
- **Conflict resolution**: application-level last-write-wins (timestamp-based)
- **No native real-time**: must implement polling or Server-Sent Events (SSE)

**Polling approach** (simpler):
- Frontend polls `GET /api/meal-plans/:week` every 5 seconds when planner is open
- If `updated_at` timestamp changes, fetch new data

#### Cost Analysis

**Cloudflare Workers Free Tier**
- 100,000 requests/day
- 10 ms CPU time per request
- D1: 5 GB storage, 5 million reads/day, 100,000 writes/day
- KV: 100,000 reads/day, 1,000 writes/day

**Estimated usage** (2 users):
- Requests: ~1,000/day (generous, assumes active polling)
- D1 reads: ~500/day (meal plans, workouts)
- D1 writes: ~50/day (updates, logs)

**Verdict**: Free tier sufficient indefinitely. Paid tier ($5/month for Workers Paid) only if adding many users.

#### Complexity and Maintenance

**Pros**
- Full control over API design and logic
- Cloudflare edge = global low-latency
- Familiar SQLite syntax (D1 is SQLite-compatible)
- No vendor lock-in for logic (portable JavaScript)

**Cons**
- **Must implement auth from scratch** (JWT generation, refresh tokens, password hashing)
- **No built-in real-time**: requires polling or SSE (added complexity)
- D1 is relatively new (less mature than Postgres)
- **More code to write and maintain** (API routes, middleware, database migrations)
- Manual backup strategy (D1 exports via CLI)

**Maintenance burden**: Medium (need to maintain Workers code, auth logic, and migrations)

---

### Option 3: Lightweight Hosted Backend — **Fly.io / Render (Node.js + PostgreSQL)**

#### Architecture

```
┌─────────────────────────────────────┐
│   GitHub Pages (Static Frontend)    │
│   - Fetch API calls to backend      │
└────────────┬────────────────────────┘
             │ HTTPS
             ▼
┌─────────────────────────────────────┐
│   Fly.io / Render (Single Instance) │
│  ┌──────────────────────────────┐   │
│  │  Node.js Express API         │   │
│  │  - REST endpoints            │   │
│  │  - Passport.js auth          │   │
│  │  - WebSocket (Socket.io)     │   │
│  └────────────┬─────────────────┘   │
│               │                     │
│               ▼                     │
│  ┌──────────────────────────────┐   │
│  │  PostgreSQL Database         │   │
│  │  - Fly Postgres or Render DB │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Authentication Approach

- **Passport.js + JWT**: standard Node.js auth pattern
- `POST /api/auth/login` → returns JWT
- Express middleware validates JWT on protected routes
- PostgreSQL stores user credentials (bcrypt-hashed passwords)

#### Data Consistency Model

- **Strong consistency**: single PostgreSQL instance, ACID guarantees
- **Real-time via WebSocket**: Socket.io broadcasts changes to connected clients
- **Conflict resolution**: last-write-wins (application-enforced)

#### Cost Analysis

**Fly.io Free Tier**
- 3 shared-cpu-1x VMs (256 MB RAM each)
- 3 GB persistent volume storage
- 160 GB outbound data transfer

**Render Free Tier**
- 750 hours/month (enough for 1 always-on service)
- 512 MB RAM
- Free PostgreSQL (90-day data retention, then deleted)

**Estimated usage** (2 users):
- RAM: <200 MB (Node.js + small dataset)
- Disk: <1 GB (Postgres data)
- Bandwidth: ~5 GB/month

**Verdict**: Free tier sufficient for Fly.io. Render free tier has **90-day DB retention risk** (need paid DB $7/month for persistence).

**Fly.io preferred**: Free Postgres is persistent, better free tier.

#### Complexity and Maintenance

**Pros**
- Full control over backend (any Node.js framework)
- Familiar deployment (Dockerfiles, standard Node.js)
- Easy to add custom logic or integrations
- Strong PostgreSQL consistency

**Cons**
- **Must maintain server code** (API, auth, WebSocket, migrations)
- **Deployment complexity** (Docker, environment variables, secrets)
- **Uptime responsibility** (need to monitor, restart if crashes)
- **Security hardening** (CORS, rate limiting, SQL injection prevention)
- Manual backups (Postgres dumps via CLI)

**Maintenance burden**: High (full backend codebase to maintain and deploy)

---

### Comparison Summary

| Criterion                  | Supabase (BaaS)          | Cloudflare Workers + D1   | Fly.io (Node.js + Postgres) |
|----------------------------|--------------------------|---------------------------|-----------------------------|
| **Setup complexity**       | Very low                 | Medium                    | High                        |
| **Auth implementation**    | Built-in                 | Custom (manual)           | Custom (Passport.js)        |
| **Real-time sync**         | Native (subscriptions)   | Manual (polling/SSE)      | Manual (Socket.io)          |
| **Data consistency**       | Strong (Postgres)        | Eventual (edge replicas)  | Strong (Postgres)           |
| **Free tier viability**    | Excellent (unlimited)    | Excellent (high limits)   | Good (Fly.io persistent)    |
| **Vendor lock-in**         | High (Supabase-specific) | Medium (portable JS)      | Low (standard Node.js)      |
| **Maintenance burden**     | Very low                 | Medium                    | High                        |
| **Backup strategy**        | Automatic (paid) / export| Manual (D1 CLI)           | Manual (pg_dump)            |
| **Scalability (future)**   | Excellent                | Excellent                 | Medium (single instance)    |
| **Development speed**      | Fastest (days)           | Medium (weeks)            | Slowest (weeks)             |

---

### Recommended Approach: **Supabase (Option 1)**

#### Justification

1. **Speed to MVP**: Built-in auth, RLS, and real-time reduce development time by ~70% vs. custom backend
2. **Small household fit**: Low write contention makes Supabase's real-time and strong consistency ideal
3. **Free tier sufficiency**: 500 MB database and 5 GB bandwidth are generous for 2 users indefinitely
4. **Reduced maintenance**: No servers to manage, no auth logic to write, automatic security patches
5. **GitHub Pages compatibility**: Supabase client library works perfectly with static frontends
6. **Real-time UX**: Native subscriptions enable instant updates when one user changes meal plan
7. **Future-proof**: If scaling to friends/family, Supabase handles growth seamlessly

#### Trade-offs Accepted

- **Vendor lock-in**: Acceptable for a private household tool (migration unlikely)
- **RLS learning curve**: Initial setup requires SQL knowledge, but well-documented
- **Limited auth customisation**: Supabase auth is sufficient for email/password needs

#### Implementation Notes

- Use Supabase JavaScript client (`@supabase/supabase-js`)
- Enable email/password auth (or magic links for passwordless)
- Define RLS policies per table to enforce `household_id` access
- Subscribe to real-time changes on `meal_plan_slots`, `shopping_list_items`, `scheduled_workouts`
- Implement optimistic UI updates (update local state immediately, sync in background)
- Use Supabase storage for recipe images (if needed in future)

---

## 8. Testing and Validation Plan

### Logic Tests

**Meal swap system**
- ✓ Swapping a meal updates `meal_plan_slots` record
- ✓ Swap alternatives match meal type and kid-friendly constraint
- ✓ Shopping list regenerates correctly after swap

**Shopping list aggregation**
- ✓ Duplicate ingredients are summed correctly (unit normalisation)
- ✓ Quantities round to practical shopping amounts
- ✓ Items grouped by category in correct order
- ✓ Pantry staples <50g are flagged "check pantry"

**Workout constraints**
- ✓ No consecutive-day exercise category repeats
- ✓ Wife's workouts exclude diastasis-risk and knee-stress exercises
- ✓ All workouts ≤30 minutes
- ✓ Cycling progression hits distance targets per phase

### Sync and Conflict Tests

**Real-time updates** (Supabase subscriptions)
- ✓ User A swaps a meal → User B's UI updates within 1 second
- ✓ User A checks shopping list item → User B sees check mark
- ✓ User A completes workout → User B sees calendar update

**Conflict scenarios**
- ✓ Both users swap same meal simultaneously → last write wins, both UIs sync
- ✓ Offline edits: changes queue and apply when connection restores
- ✓ Stale data: refetch if `updated_at` is >5 seconds old on page load

### Backup and Restore Strategy

**Supabase backups**
- Free tier: manual exports via dashboard (SQL dump or CSV per table)
- Paid tier: automatic daily backups (point-in-time recovery)

**Recovery procedure**
1. Export all tables via Supabase dashboard → SQL file
2. Store in private Git repo or encrypted cloud storage
3. To restore: create new Supabase project, run SQL import

**Recommendation**: Weekly manual exports for peace of mind on free tier.

---

## 9. Milestones and Sequencing

### Phase 0: Foundation (Week 1)
- ✓ Set up GitHub repository and GitHub Pages hosting
- ✓ Create Supabase project and database schema
- ✓ Implement authentication (email/password)
- ✓ Define RLS policies for all tables
- ✓ Scaffold frontend framework (React/Vue recommended)
- ✓ Create household and seed two user profiles

### Phase 1: Meal Planning MVP (Week 2–3)
- ✓ Build recipe and ingredient database (30 recipes to start)
- ✓ Implement weekly meal planner UI (7×3 grid)
- ✓ Build meal swap modal with alternatives
- ✓ Create shopping list generator
- ✓ Test aggregation logic and unit conversion
- ✓ Enable real-time sync for meal plan updates

### Phase 2: Workout Scheduling MVP (Week 3–4)
- ✓ Build exercise library (50 exercises with YouTube links)
- ✓ Implement workout template system
- ✓ Create workout schedule generator (applies constraints)
- ✓ Build daily workout card UI with safety notes
- ✓ Add "mark complete/skip" functionality
- ✓ Test Wife-safe filtering and cycling progression

### Phase 3: Dashboard and Navigation (Week 4)
- ✓ Build main dashboard with current week overview
- ✓ Create navigation structure (planner, workouts, shopping, library)
- ✓ Add quick-access buttons (view shopping list, next workout)
- ✓ Implement responsive design (mobile-friendly)

### Phase 4: Testing and Refinement (Week 5)
- ✓ End-to-end test: plan a week, swap meals, generate shopping list
- ✓ Test workout completion flow and pain flag system
- ✓ Validate constraint adherence (variety, durations, safety)
- ✓ User acceptance testing with both household members
- ✓ Fix bugs and improve UX based on feedback

### Phase 5: V1 Enhancements (Week 6–8)
- ✓ Add progress tracking (weight logs, workout history)
- ✓ Implement meal favourites and history
- ✓ Build adaptation logic (missed sessions, pain flags)
- ✓ Add multi-week planning view
- ✓ Shopping list check-off and manual additions
- ✓ Export functionality (PDF shopping list, print workout calendar)

### Phase 6: Polish and Nice-to-Haves (Ongoing)
- ✓ Recipe detail pages with instructions and photos
- ✓ Cycling-specific logs (distance, elevation)
- ✓ Dark mode theme
- ✓ Weather-aware cycling suggestions (API integration)

---

## 10. Parallel Agent Utilisation

To maximise development velocity, split work across four specialised agents:

### Agent A: Product UX Flows + Screens
**Responsibilities**
- Design and implement all user-facing UI components
- Weekly meal planner grid and swap modal
- Shopping list display and interactions
- Workout calendar and daily cards
- Dashboard layout and navigation
- Responsive design and mobile optimisation

**Deliverables**
- React/Vue components (or equivalent)
- CSS/styling (Tailwind/styled-components)
- User flow documentation (Figma wireframes → code)
- Accessibility compliance (WCAG 2.1 AA)

**Dependencies**
- Requires data model schema from Agent B (API contracts)
- Requires exercise constraints from Agent C (for safety badge display)
- Requires recipe list from Agent D (for meal swap options)

**Timeline**: Weeks 1–5 (parallel with Agents B, C, D)

---

### Agent B: Data Model + Sync + Backend Architecture
**Responsibilities**
- Design and implement database schema (Supabase)
- Create RLS policies for household access control
- Set up authentication flow (signup, login, JWT handling)
- Implement real-time subscriptions for meal plans, workouts, shopping lists
- Build API client wrapper for frontend (typed interfaces)

**Deliverables**
- SQL migration scripts (Supabase schema)
- RLS policy definitions
- Authentication module (login, logout, session management)
- Real-time sync hooks (WebSocket subscription handlers)
- API documentation (endpoints, request/response schemas)

**Dependencies**
- Independent (foundational work)
- Provides API contracts to Agents A, C, D

**Timeline**: Weeks 1–3 (critical path), ongoing refinements

---

### Agent C: Training Logic (Variety, Constraints, Cycling Plan)
**Responsibilities**
- Build exercise library database (50 exercises with metadata)
- Implement workout template system
- Create variety enforcement logic (no consecutive-day repeats)
- Define Wife-safe constraint filters (diastasis + knee)
- Design cycling progression algorithm (14-week plan to 68 miles)
- Build adaptation logic (missed sessions, pain flags)

**Deliverables**
- Exercise library JSON/database seed
- Workout generation algorithm (TypeScript/Python)
- Constraint validation tests
- Sample 14-week cycling plan
- Pain flag response system

**Dependencies**
- Requires data model from Agent B (exercise and workout tables)
- Provides workout data to Agent A (for calendar display)

**Timeline**: Weeks 2–4 (parallel with A and D)

---

### Agent D: Nutrition Logic (Meals, Swaps, Shopping Lists)
**Responsibilities**
- Create recipe database (30 Brazilian-inspired recipes with ingredients)
- Define meal swap logic (matching alternatives per slot)
- Implement shopping list aggregation algorithm
- Build unit conversion and deduplication system
- Ensure kid-friendly dinner tagging

**Deliverables**
- Recipe database JSON/SQL seed (recipes + ingredients)
- Swap recommendation algorithm
- Shopping list aggregation module (tested)
- Unit conversion library
- Sample one-week menu with swap options

**Dependencies**
- Requires data model from Agent B (recipe and ingredient tables)
- Provides recipe data to Agent A (for planner and swap UI)

**Timeline**: Weeks 2–4 (parallel with A and C)

---

### Coordination Strategy

**Weekly sync** (Monday)
- Agents share API contracts and interface definitions
- Resolve blocking dependencies (e.g. Agent A needs Agent B's auth flow)
- Demo progress and identify integration issues

**Integration points** (Week 4)
- Agent A integrates real-time sync from Agent B
- Agent A displays workouts from Agent C
- Agent A shows meal swaps and shopping lists from Agent D
- Full end-to-end testing

**Handoff** (Week 5)
- All agents collaborate on bug fixes and UX refinements
- Merge feature branches and resolve conflicts
- Final user acceptance testing

---

## 11. Open Questions and Constraint Challenges

### Open Questions (Require User Decision)

1. **Recipe photo sourcing**: Should we include recipe photos in MVP? If yes, where should images be sourced (stock photos, user uploads, or skip for MVP)?
   - **Recommendation**: Skip for MVP; add as V1 enhancement with Supabase storage.

2. **Calorie visibility default**: Should estimated calorie ranges be visible by default or opt-in?
   - **Recommendation**: Opt-in (settings toggle), emphasise portion awareness over counting.

3. **Workout rest days**: Should system enforce at least one rest day per week, or allow users to override?
   - **Recommendation**: Suggest 1–2 rest days but allow override with warning message.

4. **Cycling outdoor weather**: Should system integrate weather API to suggest indoor trainer on rainy days?
   - **Recommendation**: Nice-to-have for V1; defer to reduce MVP complexity.

5. **Shopping list printer format**: Preferred layout (compact list, checkboxes, categorised sections)?
   - **Recommendation**: User testing during Phase 4; default to categorised checklist.

6. **Multi-household expansion**: Should data model support multiple households from start (over-engineering) or add later?
   - **Recommendation**: Build for single household initially; migration path is straightforward (add `household_id` foreign keys).

---

### Constraint Challenges

#### Challenge 1: GitHub Pages + Shared Data

**Quoted constraint**: "The frontend may be hosted on GitHub Pages" + "All clients must access and see the same shared data."

**Why it limits the solution**: GitHub Pages serves only static files; no server-side rendering or API endpoints. Shared data requires a backend, which GitHub Pages cannot provide. This forces a decoupled architecture (static frontend + separate backend).

**Alternatives considered**:
1. **Vercel/Netlify** (allow serverless functions): Easier to colocate API and frontend, but shifts away from GitHub Pages constraint.
2. **LocalStorage-only** (no backend): No sync between devices; unacceptable for shared household use.
3. **Git-based sync** (store data in GitHub repo, commit changes): Clunky UX, merge conflicts, requires Git knowledge.

**Impact analysis**:
- **Chosen approach** (Supabase): Adds external dependency but solves sync cleanly.
- **Maintenance cost**: Very low (BaaS handles infra).
- **User experience**: Seamless real-time sync (positive).

**Recommended path**: Accept external backend dependency (Supabase) as necessary trade-off for shared data requirement. GitHub Pages hosts frontend only; Supabase provides backend.

---

#### Challenge 2: 30-Minute Daily Cap + Cycling Event Prep

**Quoted constraint**: "Daily exercise suggestions (max 30 minutes/day)" + "Hampshire Hilly Hundred 68-mile ride on 17 May."

**Why it limits the solution**: 68-mile cycling events typically require long training rides (90–120 minutes) in peak weeks. Strict 30-minute cap prevents adequate event preparation.

**Alternatives considered**:
1. **Weekend exception**: Allow longer rides on Sat/Sun (up to 120 min), maintain 30-min cap on weekdays.
2. **Flexible cap**: Set 30-min target but allow user override with warning.
3. **Reduce event goal**: Suggest 50-mile route instead if training time is limited.

**Impact analysis**:
- **Weekend exception** (recommended): Weekends often have more free time; household can plan around longer rides.
- **Training effectiveness**: 90–120 min rides are essential for endurance adaptation; without them, event completion is risky.
- **User safety**: Undertrained riders risk injury and poor experience at hilly events.

**Recommended path**: Implement **weekend exception** allowing 90–120 minute rides on Saturdays/Sundays only. Display clear messaging: "Weekend long rides are essential for event prep; weekday sessions remain ≤30 minutes." Seek user approval for this relaxation.

---

#### Challenge 3: Abdominal Diastasis Safety + Core Training

**Quoted constraint**: "Abdominal diastasis" + "Improve overall health and lose weight."

**Why it limits the solution**: Diastasis recti requires avoiding traditional core exercises (crunches, planks), but core strength is important for overall health and injury prevention. Limited exercise options may slow progress.

**Alternatives considered**:
1. **Strict avoidance**: Eliminate all core-focused sessions (safest but limits strength gains).
2. **Modified-only**: Prescribe only diastasis-safe exercises (dead bugs, bird dogs, pelvic floor activation).
3. **Physio consultation**: Recommend professional assessment before any core work.

**Impact analysis**:
- **Modified-only** (recommended): Balances safety with functional core strength; extensive research supports these exercises for diastasis.
- **Progress rate**: Slower than unrestricted training but sustainable and safe.
- **Disclaimer reinforcement**: System must emphasise non-medical nature; encourage professional consultation.

**Recommended path**: Implement **modified-only** approach with prominent safety disclaimers. Pre-filter all exercises tagged `contraindications: ['diastasis-risk']` for Wife's profile. Include note: "These exercises are considered diastasis-safe, but individual responses vary. Consult your physiotherapist if unsure."

---

#### Challenge 4: Kid-Friendly Dinners + Calorie Deficit

**Quoted constraint**: "Dinner is shared with two daughters" + "Dinner recipes should be kid-friendly and practical" + "Calorie deficit + sustainable training."

**Why it limits the solution**: Kid-friendly meals often include higher-calorie comfort foods (pasta, rice, proteins with sauces). Balancing family meal preferences with adult calorie goals is challenging.

**Alternatives considered**:
1. **Separate adult portions**: Cook one meal but serve smaller portions to adults (practical but requires discipline).
2. **Compromise recipes**: Choose naturally moderate-calorie kid-friendly meals (grilled proteins, roasted vegetables, simple starches).
3. **Adults modify plate**: Let adults add extra vegetables or reduce starches while kids eat normally.

**Impact analysis**:
- **Compromise recipes** (recommended): Brazilian cuisine naturally includes balanced options (grilled meats, rice+beans, salads). Portion awareness more important than restrictive recipes.
- **Family dynamics**: Cooking one meal is practical; separate meals add stress.
- **Calorie deficit**: Achieved through portion control + exercise rather than restrictive recipes.

**Recommended path**: Design all dinners to be naturally moderate-calorie and kid-friendly (avoiding heavy sauces, fried foods). Emphasise **portion guidance** rather than strict calorie counts. Example messaging: "Serve yourself 1 cup rice instead of 2; fill half your plate with salad."

---

## 12. Final Required Step: Updating Governance Documents

Once the system is implemented per this plan, create and maintain the following governance documents to guide future development:

### Create `CLAUDE.md` (Repository Root)

```markdown
# Claude Code Governance: Exercise + Nutrition Tracker

## Project Overview
Web-based health tracking system for a two-person household. Meal planning, exercise scheduling, and progress tracking with shared data access.

## Architecture Decisions
- **Frontend**: Static site hosted on GitHub Pages (React/Vue)
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
  /components       # React/Vue UI components
  /services         # API client, Supabase wrappers
  /logic            # Workout generation, meal swaps, shopping list aggregation
  /types            # TypeScript interfaces
/docs
  /plans            # Implementation plans (this file originated here)
  /adr              # Architecture decision records
/supabase
  /migrations       # SQL schema versions
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
```

---

### Create `AGENTS.md` (Repository Root)

```markdown
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
```

---

### Create `docs/recipes/brazilian-meal-ideas.md` (Reference Document)

```markdown
# Brazilian-Inspired Meal Ideas

Reference list for expanding recipe database. Prioritise simple, practical recipes.

## Breakfast
- Tapioca (crepioca) with cheese and tomato
- Pão de queijo (cheese bread) with fruit
- Açaí bowl with granola
- Cuscuz paulista (savoury corn cake)

## Lunch/Dinner
- Feijoada (simplified)
- Moqueca (fish stew)
- Strogonoff de frango
- Picanha with farofa
- Arroz com feijão (rice and beans base)
- Bobó de camarão (shrimp in cassava purée)

## Sides
- Farofa (toasted cassava flour)
- Vinagrete (tomato and onion salsa)
- Couve refogada (sautéed collard greens)
- Batata frita (fried potatoes/chips)

## Kid-Friendly Notes
- Avoid heavy spices (keep mild)
- Serve protein, starch, and vegetables separately so kids can choose
- Familiar shapes (nuggets, pasta, rice) increase acceptance
```

---

## Document Complete

This plan is now implementation-ready. All architectural decisions are justified, constraints are documented, and sequencing is clear. Proceed to Phase 0 (Foundation) upon approval.
