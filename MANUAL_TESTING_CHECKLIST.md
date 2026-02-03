# Phase 2: Workout Scheduling MVP - Manual Testing Checklist

## Pre-Deployment Testing Checklist

Complete this checklist before deploying Phase 2 to production. Each item must be checked ✅ before deployment.

---

## 🔴 CRITICAL SAFETY TESTS (MUST PASS - DO NOT DEPLOY IF ANY FAIL)

### 1. Wife Profile - Diastasis-Risk Exercise Blocking

**Test:** Wife's workout schedule never displays diastasis-risk exercises

**Steps:**
1. Log in or switch to Wife profile
2. Navigate to `/workouts`
3. Generate a workout schedule if none exists
4. Open Chrome DevTools (F12)
5. Press Ctrl+F (Cmd+F on Mac)
6. Search for each contraindicated exercise name (see list below)

**Contraindicated Exercises to Search For:**
- [ ] "Sit-ups" - MUST NOT appear in page
- [ ] "Crunches" - MUST NOT appear in page
- [ ] "Ab Workout" - MUST NOT appear in page
- [ ] "Advanced Core Circuit" - MUST NOT appear in page
- [ ] "Burpees" - MUST NOT appear in page
- [ ] "Jump Squats" - MUST NOT appear in page
- [ ] "Plyometric" - MUST NOT appear in page
- [ ] "Pilates - Mat Work" - MUST NOT appear in page

**Pass Criteria:**
- ✅ ZERO matches found for each exercise name in DOM
- ✅ If any found, Safety Error message is displayed instead
- ✅ Wife's constraint badges visible: "diastasis-risk" "knee-stress"

**Status:** ☐ PASS / ☐ FAIL

---

### 2. Wife Profile - Knee-Stress Exercise Blocking

**Test:** Wife's workout schedule never displays knee-stress exercises

**Contraindicated Exercises to Search For:**
- [ ] "Deep Squats" - MUST NOT appear
- [ ] "Leg Day Circuit" - MUST NOT appear
- [ ] "Bulgarian Split Squats" - MUST NOT appear
- [ ] "Running" - MUST NOT appear
- [ ] "Jump Rope" - MUST NOT appear
- [ ] "Power Yoga" - MUST NOT appear
- [ ] "Kettlebell Circuit" - MUST NOT appear

**Pass Criteria:**
- ✅ ZERO matches found for each exercise name
- ✅ Safety Error shown if any slip through

**Status:** ☐ PASS / ☐ FAIL

---

### 3. Profile Switch State Clearing

**Test:** Switching profiles clears cached workout data

**Steps:**
1. Log in as Wife, navigate to `/workouts`
2. Note exercises displayed
3. Open browser Console (F12)
4. Click "Switch" button in header
5. Select Fernando profile
6. Check console for log message
7. Switch back to Wife
8. Check console again

**Pass Criteria:**
- ✅ Console shows: `[SAFETY] Profile changed, clearing workout state` on each switch
- ✅ Wife's view never shows Fernando's exercises
- ✅ No stale data persists

**Status:** ☐ PASS / ☐ FAIL

---

### 4. Layer 3 Safety Error Display

**Test:** If contraindicated exercise somehow reaches UI, safety error is shown

**Steps:**
1. This is a defensive test - if exercises are properly filtered, you won't see this
2. If you DO see a "Safety Error" card in the workout schedule:
   - Note which day and exercise
   - Verify the error message is clear
   - Report as a bug (layers 1 & 2 failed)

**Pass Criteria:**
- ✅ If safety violation occurs, error is displayed prominently
- ✅ Unsafe exercise name is NOT rendered
- ✅ Error message guides user to contact support

**Status:** ☐ PASS / ☐ FAIL / ☐ N/A (no violations occurred)

---

### 5. Audit Logging Verification

**Test:** Exercise assignments for Wife are logged

**Steps:**
1. Open browser Console
2. Generate workout schedule for Wife
3. Check console output for audit logs

**Pass Criteria:**
- ✅ Console contains `[EXERCISE_AUDIT]` entries
- ✅ Each entry shows user, exercise, and decision (APPROVED/REJECTED)
- ✅ All Wife's exercises logged

**Status:** ☐ PASS / ☐ FAIL

---

## 🟡 FUNCTIONAL TESTS (Should Pass)

### 6. Fernando's Schedule - Cycling Rides

**Test:** Fernando's weekend schedule includes long cycling rides

**Steps:**
1. Switch to Fernando profile
2. Navigate to `/workouts`
3. Generate workout schedule
4. Check Saturday and Sunday workouts

**Pass Criteria:**
- ✅ Weekend includes cycling rides (60-120 minutes)
- ✅ Duration shown correctly
- ✅ Category shows "sport" or "Cycling"

**Status:** ☐ PASS / ☐ FAIL

---

### 7. Weekday Duration Constraint

**Test:** All weekday workouts ≤30 minutes

**Steps:**
1. Generate workout schedule for any user
2. Check Monday through Friday workouts
3. Verify duration of each

**Pass Criteria:**
- ✅ Monday workout ≤30 min
- ✅ Tuesday workout ≤30 min
- ✅ Wednesday workout ≤30 min
- ✅ Thursday workout ≤30 min
- ✅ Friday workout ≤30 min

**Status:** ☐ PASS / ☐ FAIL

---

### 8. Variety Rule

**Test:** No consecutive-day category repeats

**Steps:**
1. Generate workout schedule
2. Note category of each day:
   - Monday: _______
   - Tuesday: _______
   - Wednesday: _______
   - Thursday: _______
   - Friday: _______
   - Saturday: _______
   - Sunday: _______

**Pass Criteria:**
- ✅ No two consecutive days have same category
- ✅ OR if repeated, check console for variety fallback warning

**Status:** ☐ PASS / ☐ FAIL

---

### 9. Mark Workout Complete

**Test:** Marking a workout complete works correctly

**Steps:**
1. Navigate to `/workouts`
2. Click on any pending workout card
3. Modal opens with workout details
4. Click "Mark Complete" button
5. Optionally add a note
6. Modal closes

**Pass Criteria:**
- ✅ Workout card updates to show "Completed" badge
- ✅ Workout card background changes to green gradient
- ✅ Dashboard stats update (X/Y Workouts Done)
- ✅ No console errors

**Status:** ☐ PASS / ☐ FAIL

---

### 10. Mark Workout Skipped

**Test:** Marking a workout skipped works correctly

**Steps:**
1. Click on any pending workout
2. Click "Skip Workout" button
3. Enter optional reason
4. Click OK

**Pass Criteria:**
- ✅ Workout card shows "Skipped" badge
- ✅ Card background changes to orange gradient
- ✅ Reason stored (if provided)

**Status:** ☐ PASS / ☐ FAIL

---

### 11. Real-Time Sync

**Test:** Workout updates sync across browser windows

**Steps:**
1. Open two browser windows side-by-side
2. Log in as same user in both
3. Navigate to `/workouts` in both
4. In Window 1: Mark Monday workout as complete
5. Observe Window 2 (wait up to 2 seconds)

**Pass Criteria:**
- ✅ Window 2 updates automatically within 1-2 seconds
- ✅ No page refresh needed
- ✅ Status syncs correctly

**Status:** ☐ PASS / ☐ FAIL

---

### 12. Concurrent Edit Handling

**Test:** Concurrent edits are handled gracefully

**Steps:**
1. Open two browser windows
2. Both click same workout to open modal
3. In Window 1: Mark as complete
4. Observe Window 2

**Pass Criteria:**
- ✅ Window 2's modal auto-closes
- ✅ Toast or message: "Workout completed by another user"
- ✅ Window 2 can't mark already-completed workout

**Status:** ☐ PASS / ☐ FAIL

---

### 13. Exercise Library - Safe Filtering

**Test:** Exercise library only shows safe exercises for Wife

**Steps:**
1. Log in as Wife
2. Navigate to `/exercises`
3. Count total exercises shown
4. Search for "Squats"

**Pass Criteria:**
- ✅ Shows approximately 40-45 exercises (not all 60+)
- ✅ "Deep Squats" NOT in search results
- ✅ Safe variations (if any) ARE shown

**Status:** ☐ PASS / ☐ FAIL

---

### 14. Exercise Library - Search and Filter

**Test:** Search and filter functionality works

**Steps:**
1. Navigate to `/exercises`
2. Search for "yoga"
3. Filter by category: "flexibility"
4. Filter by intensity: "low"

**Pass Criteria:**
- ✅ Search narrows results correctly
- ✅ Category filter works
- ✅ Intensity filter works
- ✅ Filters combine correctly

**Status:** ☐ PASS / ☐ FAIL

---

### 15. Exercise Detail Modal

**Test:** Exercise details display correctly

**Steps:**
1. Navigate to `/exercises`
2. Click any exercise card
3. Modal opens with full details

**Pass Criteria:**
- ✅ Exercise name, category, duration shown
- ✅ Equipment listed
- ✅ Modifications shown (if any)
- ✅ Safety notes displayed
- ✅ YouTube link works (opens in new tab)

**Status:** ☐ PASS / ☐ FAIL

---

### 16. Dashboard - Workout Stats

**Test:** Dashboard displays workout completion stats

**Steps:**
1. Generate workout schedule
2. Complete 2 out of 5 workouts
3. Navigate to `/` (Dashboard)

**Pass Criteria:**
- ✅ Shows "2/5 Workouts Done"
- ✅ Shows "40% Workout Progress"
- ✅ Quick action card reflects status

**Status:** ☐ PASS / ☐ FAIL

---

### 17. Dashboard - Quick Actions

**Test:** Dashboard quick actions adapt based on status

**Steps:**
1. Navigate to `/` (Dashboard)
2. Check quick action cards
3. Complete all workouts
4. Refresh dashboard

**Pass Criteria:**
- ✅ If no schedule: "Plan Your Workouts" shown
- ✅ If incomplete: Shows "X workouts remaining"
- ✅ If all done: Shows "All Workouts Done!"

**Status:** ☐ PASS / ☐ FAIL

---

### 18. Week Navigation

**Test:** Previous/Next week navigation works

**Steps:**
1. Navigate to `/workouts`
2. Note current week (e.g., "Jan 1 - Jan 7, 2024")
3. Click "Next Week" button
4. Verify new week is shown
5. Click "Previous Week" twice

**Pass Criteria:**
- ✅ Week updates correctly
- ✅ Schedule loads for new week
- ✅ Can navigate backward and forward

**Status:** ☐ PASS / ☐ FAIL

---

### 19. Generate Workout Schedule

**Test:** Schedule generation creates valid 7-day plan

**Steps:**
1. Navigate to `/workouts` for a week with no schedule
2. Click "Generate Workout Schedule"
3. Wait for generation (may take a few seconds)

**Pass Criteria:**
- ✅ 7-day schedule appears
- ✅ Each day has either a workout or rest day
- ✅ All exercises are safe for user
- ✅ No console errors

**Status:** ☐ PASS / ☐ FAIL

---

### 20. Rest Day Display

**Test:** Rest days display correctly

**Steps:**
1. Find a rest day in schedule (or wait for one to be generated)
2. Check rest day card

**Pass Criteria:**
- ✅ Shows "Rest & Recovery" label
- ✅ Sleep emoji (😴) displayed
- ✅ Reason shown (e.g., "Scheduled recovery day")
- ✅ No safety errors

**Status:** ☐ PASS / ☐ FAIL

---

## 🟢 QUALITY TESTS (Nice to Have)

### 21. No Console Errors

**Test:** Application runs without JavaScript errors

**Steps:**
1. Open browser Console (F12)
2. Navigate through all pages
3. Perform various actions

**Pass Criteria:**
- ✅ No red error messages in console
- ✅ Warnings are acceptable (note them)

**Status:** ☐ PASS / ☐ FAIL

---

### 22. Loading States

**Test:** Loading indicators work correctly

**Steps:**
1. Refresh page while on `/workouts`
2. Click "Generate Workout Schedule"
3. Mark workout complete

**Pass Criteria:**
- ✅ "Loading workout schedule..." shows initially
- ✅ "Generating Schedule..." shows during generation
- ✅ Loading states don't persist indefinitely

**Status:** ☐ PASS / ☐ FAIL

---

### 23. Mobile Responsiveness

**Test:** UI works on mobile screen sizes

**Steps:**
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Navigate through workout pages

**Pass Criteria:**
- ✅ Workout cards stack vertically
- ✅ Navigation buttons are usable
- ✅ Modals fit on screen
- ✅ Text is readable

**Status:** ☐ PASS / ☐ FAIL

---

### 24. YouTube Links

**Test:** YouTube links open correctly

**Steps:**
1. Navigate to `/exercises`
2. Click an exercise with a YouTube link
3. Click "Watch Video Tutorial" button

**Pass Criteria:**
- ✅ Opens in new tab
- ✅ Link goes to YouTube
- ✅ Video loads (or shows YouTube URL)

**Status:** ☐ PASS / ☐ FAIL

---

### 25. Profile Switching

**Test:** Profile switcher works smoothly

**Steps:**
1. Click "Switch" button in header
2. Select different profile
3. Navigate to workouts
4. Switch back

**Pass Criteria:**
- ✅ Profile changes immediately
- ✅ Avatar and name update in header
- ✅ Workout data loads for new profile
- ✅ No errors

**Status:** ☐ PASS / ☐ FAIL

---

## Testing Summary

### Critical Safety Tests
- [ ] 1. Wife - Diastasis blocking
- [ ] 2. Wife - Knee-stress blocking
- [ ] 3. Profile switch state clearing
- [ ] 4. Layer 3 safety error display
- [ ] 5. Audit logging

**Critical Tests Passed:** ___/5

### Functional Tests
- [ ] 6. Fernando cycling rides
- [ ] 7. Weekday duration constraint
- [ ] 8. Variety rule
- [ ] 9. Mark complete
- [ ] 10. Mark skipped
- [ ] 11. Real-time sync
- [ ] 12. Concurrent edit handling
- [ ] 13. Exercise library filtering
- [ ] 14. Search and filter
- [ ] 15. Exercise detail modal
- [ ] 16. Dashboard stats
- [ ] 17. Dashboard quick actions
- [ ] 18. Week navigation
- [ ] 19. Generate schedule
- [ ] 20. Rest day display

**Functional Tests Passed:** ___/15

### Quality Tests
- [ ] 21. No console errors
- [ ] 22. Loading states
- [ ] 23. Mobile responsiveness
- [ ] 24. YouTube links
- [ ] 25. Profile switching

**Quality Tests Passed:** ___/5

---

## Deployment Decision

**CRITICAL SAFETY TESTS:** ___/5 MUST BE 5/5 TO DEPLOY

**FUNCTIONAL TESTS:** ___/15 (Recommended: 13+ to deploy)

**QUALITY TESTS:** ___/5 (Recommended: 3+ to deploy)

### Overall Status

☐ **APPROVED FOR DEPLOYMENT** - All critical tests passed, most functional tests passed

☐ **BLOCKED** - Critical safety tests failed, DO NOT DEPLOY

☐ **NEEDS WORK** - Some functional tests failed, fix before deployment

---

**Tested By:** ___________________

**Date:** ___________________

**Notes/Issues Found:**

