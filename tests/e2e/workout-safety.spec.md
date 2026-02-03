# E2E Safety Test Specification - Workout Schedule

## CRITICAL SAFETY REQUIREMENTS

These tests MUST be executed manually or with an E2E framework (Playwright/Cypress) before deployment.

### Test Setup

**Test User Profile - Wife:**
- ID: `wife-id`
- Health Constraints: `['diastasis-risk', 'knee-stress']`
- Should NEVER see exercises with these contraindications

**Test User Profile - Fernando:**
- ID: `fernando-id`
- Health Constraints: `[]` (no constraints)
- Should see all exercises

---

## Test Suite 1: Layer 3 Defensive Rendering (CRITICAL)

### Test 1.1: Wife Profile - Diastasis-Risk Blocking
**Objective:** Verify contraindicated exercises never appear in Wife's workout schedule

**Steps:**
1. Navigate to `/workouts` while logged in as Wife
2. Generate a workout schedule if none exists
3. Inspect all 7 days of the workout calendar
4. Check browser DOM inspector for exercise names

**Expected Result:**
- ✅ NO exercises with `contraindications: ['diastasis-risk']` appear in DOM
- ✅ If such an exercise somehow appears, it displays "Safety Error" message
- ✅ Wife's constraint badges are visible at top of page

**Contraindicated Exercises to Never See:**
- Sit-ups
- Crunches
- Ab Workout - Crunches and Planks
- Advanced Core Circuit
- HIIT - Burpees and Jump Squats
- Jump Squats
- Plyometric Training
- Pilates - Mat Work

**How to Verify:**
```
1. Open Chrome DevTools (F12)
2. Press Ctrl+F (or Cmd+F on Mac)
3. Search for each contraindicated exercise name
4. Result MUST be: "0 matches" in page content
5. If found: CRITICAL BUG - Do not deploy
```

### Test 1.2: Wife Profile - Knee-Stress Blocking
**Objective:** Verify knee-stress exercises never appear in Wife's workout schedule

**Steps:**
1. Navigate to `/workouts` while logged in as Wife
2. View 7-day workout calendar
3. Inspect all workout cards

**Expected Result:**
- ✅ NO exercises with `contraindications: ['knee-stress']` appear
- ✅ Safety error shown if any slip through

**Contraindicated Exercises to Never See:**
- Deep Squats
- Squats and Deadlifts
- Leg Day Circuit
- Bulgarian Split Squats
- Yoga Flow (Modified) - marked with knee-stress
- Running - 5K Steady
- HIIT - Burpees and Jump Squats
- Jump Rope Intervals
- Plyometric Training
- Power Yoga
- Kettlebell Circuit

### Test 1.3: Wife Profile - Multiple Contraindications
**Objective:** Exercises with ANY matching contraindication are blocked

**Steps:**
1. Check for exercises with both diastasis-risk AND knee-stress
2. Verify none appear in Wife's schedule

**Expected Result:**
- ✅ Jump Squats (has both) never appears
- ✅ HIIT - Burpees (has both) never appears
- ✅ Plyometric Training (has both) never appears

### Test 1.4: Wife Profile - Alias Matching
**Objective:** Contraindication aliases are detected (e.g., 'diastasis' = 'diastasis-risk')

**Steps:**
1. If test database has exercises with alias contraindications (e.g., 'diastasis' instead of 'diastasis-risk')
2. Verify Wife still doesn't see them

**Expected Result:**
- ✅ Alias normalization works correctly
- ✅ No exercises slip through due to naming variations

---

## Test Suite 2: Safe Exercise Display

### Test 2.1: Wife Profile - Safe Exercises ARE Shown
**Objective:** Verify safe exercises appear correctly

**Steps:**
1. Navigate to `/workouts` as Wife
2. View workout calendar

**Expected Result:**
- ✅ Safe exercises ARE displayed (e.g., Walking, Cycling, Low-Impact Dance)
- ✅ Duration and category information shown
- ✅ No safety errors for safe exercises

**Safe Exercises Wife SHOULD See:**
- Walking - Brisk Pace
- Walking - Incline Intervals
- Endurance Cycling Ride
- Cycling Tempo Intervals
- Recovery Spin
- Hill Repeats
- Long Endurance Ride (90min/120min)
- Sweet Spot Intervals
- Upper Body Gym Workout
- Chest and Triceps Workout
- Back and Biceps Workout
- Shoulders and Arms
- Upper Body Circuit
- Pull Day
- Push Day
- Dead Bugs and Bird Dogs
- Side Plank Variations
- Pelvic Floor and Transverse Abdominis
- Stability Ball Core Work
- Glute Bridges and Clamshells
- Step-Ups and Hip Thrusts
- Leg Press and Leg Curls
- Swimming - Steady Pace
- Water Aerobics
- Dance Cardio - Low Impact
- Rowing Machine
- Elliptical Trainer
- Gentle Yoga Flow
- Restorative Yoga
- Yin Yoga
- Full Body Stretch Routine
- Hip Mobility and Flexibility
- Upper Body and Shoulder Stretching
- Active Recovery Yoga
- Total Body Conditioning
- Barre Workout
- Tai Chi
- Boxing Workout (No Impact)
- Battle Ropes
- Foam Rolling and Mobility
- Chair Yoga

### Test 2.2: Fernando Profile - All Exercises Available
**Objective:** User without constraints sees full exercise library

**Steps:**
1. Switch to Fernando profile
2. Navigate to `/exercises`
3. Browse exercise library

**Expected Result:**
- ✅ All 60+ exercises are visible
- ✅ No filtering applied
- ✅ Includes exercises contraindicated for Wife

---

## Test Suite 3: Profile Switching Safety

### Test 3.1: State Clearing on Profile Switch
**Objective:** Prevent stale data when switching profiles

**Steps:**
1. Log in as Wife, view workout schedule
2. Note which exercises are shown
3. Switch to Fernando profile (click "Switch" button)
4. View Fernando's workout schedule
5. Switch back to Wife profile

**Expected Result:**
- ✅ Wife's schedule is re-fetched (not cached)
- ✅ No Fernando exercises appear in Wife's view
- ✅ useEffect with activeProfile dependency fires correctly

**How to Verify:**
```
1. Open browser DevTools Console
2. Look for log: "[SAFETY] Profile changed, clearing workout state"
3. Should appear on every profile switch
```

### Test 3.2: No Cross-Profile Data Leakage
**Objective:** Each profile sees only their own schedule

**Steps:**
1. Generate workout for Fernando (includes cycling)
2. Generate workout for Wife (no cycling if contraindicated)
3. Switch between profiles multiple times rapidly

**Expected Result:**
- ✅ Each profile always sees their own schedule
- ✅ No mixing of workout data
- ✅ Real-time updates don't cross profiles

---

## Test Suite 4: Real-Time Sync and Concurrent Edits

### Test 4.1: Real-Time Workout Completion
**Objective:** Changes sync across household members

**Steps:**
1. Open two browser windows side-by-side
2. Log in as Wife in both
3. In Window 1: Mark Monday workout as complete
4. Observe Window 2

**Expected Result:**
- ✅ Window 2 updates within 1 second
- ✅ Workout shows "Completed" status
- ✅ No page refresh needed

### Test 4.2: Concurrent Edit Conflict
**Objective:** Optimistic locking prevents data loss

**Steps:**
1. Open two browser windows
2. Both view same workout detail modal
3. Window 1: Mark as complete
4. Window 2: Try to mark as skipped

**Expected Result:**
- ✅ Window 2's modal auto-closes when Window 1 completes
- ✅ Toast notification: "Workout completed by another user"
- ✅ No conflicting status updates

---

## Test Suite 5: Duration Constraints

### Test 5.1: Weekday 30-Minute Cap
**Objective:** All weekday workouts ≤30 minutes

**Steps:**
1. Generate workout schedule for Wife
2. Check Monday-Friday workouts

**Expected Result:**
- ✅ All weekday (Mon-Fri) workouts ≤30 minutes
- ✅ No exceptions

### Test 5.2: Weekend Cycling Exception
**Objective:** Weekend cycling rides can be 60-120 minutes

**Steps:**
1. Generate workout schedule for Fernando
2. Check Saturday/Sunday

**Expected Result:**
- ✅ Weekend cycling rides can be up to 120 minutes
- ✅ Weekend non-cycling workouts ≤60 minutes

---

## Test Suite 6: Workout Variety Rules

### Test 6.1: No Consecutive Category Repeats
**Objective:** Exercise categories don't repeat on consecutive days

**Steps:**
1. Generate workout schedule
2. Check all 7 days
3. Note category of each day's workout

**Expected Result:**
- ✅ No two consecutive days have same category
- ✅ If violation, it's a logged fallback (variety rule relaxed due to limited pool)

---

## Test Suite 7: Exercise Library

### Test 7.1: Library Filtering for Wife
**Objective:** Exercise library only shows safe exercises

**Steps:**
1. Log in as Wife
2. Navigate to `/exercises`
3. Search and filter through all exercises

**Expected Result:**
- ✅ Library shows approximately 40-45 safe exercises for Wife
- ✅ NO exercises with contraindications appear
- ✅ Filter counts are accurate

### Test 7.2: Search and Filter Functionality
**Objective:** Search doesn't bypass safety filtering

**Steps:**
1. As Wife, navigate to `/exercises`
2. Search for "Squats"

**Expected Result:**
- ✅ "Deep Squats" (contraindicated) NOT shown
- ✅ Safe squat variations (if any) ARE shown
- ✅ "No results" if all squats are contraindicated

---

## Test Suite 8: Dashboard Integration

### Test 8.1: Workout Stats Display
**Objective:** Dashboard shows accurate workout completion stats

**Steps:**
1. Navigate to `/` (Dashboard)
2. Complete 3 out of 5 workouts this week

**Expected Result:**
- ✅ Shows "3/5 Workouts Done"
- ✅ Shows "60% Workout Progress"
- ✅ Quick action card updates based on status

### Test 8.2: Next Workout Preview
**Objective:** Dashboard shows next pending workout

**Steps:**
1. Complete Monday workout
2. View Dashboard

**Expected Result:**
- ✅ Shows Tuesday's workout as next
- ✅ Links to `/workouts`

---

## Manual Testing Checklist Summary

Before deploying to production, manually verify:

### Critical Safety Checks (MUST PASS)
- [ ] **Wife's schedule NEVER shows diastasis-risk exercises** (DOM inspection)
- [ ] **Wife's schedule NEVER shows knee-stress exercises** (DOM inspection)
- [ ] **Profile switch clears cached data** (console log verification)
- [ ] **Safety error displays if contraindicated exercise reaches UI**
- [ ] **Alias matching works** (diastasis = diastasis-risk)

### Functional Checks (Should Pass)
- [ ] Week navigation works (Previous/Next buttons)
- [ ] Generate schedule creates 7-day plan
- [ ] Mark complete updates status and syncs
- [ ] Mark skip updates status and syncs
- [ ] Real-time sync works (<1 second latency)
- [ ] All weekday workouts ≤30 minutes
- [ ] Weekend cycling rides can be 60-120 minutes
- [ ] Variety rule: no consecutive category repeats
- [ ] Exercise library filters correctly
- [ ] Dashboard stats update correctly

### Quality Checks (Nice to Have)
- [ ] No console errors
- [ ] Loading states work correctly
- [ ] Responsive on mobile devices
- [ ] Accessible (keyboard navigation, screen reader friendly)
- [ ] YouTube links open correctly

---

## Setting Up E2E Testing Framework (Future)

To automate these tests, install Playwright:

```bash
npm install -D @playwright/test
npx playwright install
```

Then create tests in `/tests/e2e/` that programmatically verify these scenarios.

Example Playwright test:
```typescript
test('Wife never sees diastasis exercises', async ({ page }) => {
  await page.goto('/workouts')
  await page.waitForSelector('.workout-week-grid')

  // Assert contraindicated exercises are not in DOM
  const situps = page.getByText('Sit-ups')
  await expect(situps).not.toBeVisible()

  const crunches = page.getByText('Crunches')
  await expect(crunches).not.toBeVisible()
})
```

---

## Reporting Issues

If any safety test fails:
1. **DO NOT DEPLOY** - this is a critical safety issue
2. Take screenshots of failing state
3. Check browser console for error logs
4. Verify which layer failed (Database/Logic/UI)
5. File urgent bug report with reproduction steps
