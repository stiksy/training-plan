-- Additional exercise library seed data
-- Expands to 50+ exercises covering all categories with proper safety constraints

INSERT INTO exercises (name, category, subcategory, duration_min, intensity, equipment, contraindications, modifications, youtube_url, safety_notes) VALUES

-- ============ CYCLING / SPORT (Category: 'sport' with subcategory 'cycling') ============
-- Note: Using 'cardio' with subcategory 'cycling' for now since schema uses 'cardio', 'strength', 'flexibility', 'sport'

  -- Recovery rides
  (
    'Recovery Spin',
    'sport',
    'Cycling',
    45,
    'low',
    ARRAY['bicycle'],
    ARRAY[]::TEXT[],
    'Keep heart rate very low, focus on spinning',
    'https://youtube.com/watch?v=recovery-spin',
    'Active recovery. No intensity. Keep it easy and conversational.'
  ),

  -- Hill training
  (
    'Hill Repeats',
    'sport',
    'Cycling',
    40,
    'high',
    ARRAY['bicycle'],
    ARRAY[]::TEXT[],
    'Reduce number of repeats if needed',
    'https://youtube.com/watch?v=hill-repeats',
    'Find a moderate hill (3-5% grade). Warm up 10min. 6 x 3min hill efforts. Cool down.'
  ),

  -- Long endurance rides
  (
    'Long Endurance Ride (90min)',
    'sport',
    'Cycling',
    90,
    'moderate',
    ARRAY['bicycle'],
    ARRAY[]::TEXT[],
    'Break into two 45-minute sessions if needed',
    'https://youtube.com/watch?v=long-endurance',
    'Steady pace. Bring water and snacks. Stay conversational.'
  ),

  (
    'Long Endurance Ride (120min)',
    'sport',
    'Cycling',
    120,
    'moderate',
    ARRAY['bicycle'],
    ARRAY[]::TEXT[],
    'Break into two 60-minute sessions if needed',
    'https://youtube.com/watch?v=long-endurance-120',
    'Steady pace. Essential to bring water and nutrition. Eat every 45min.'
  ),

  -- Sweet spot training
  (
    'Sweet Spot Intervals',
    'sport',
    'Cycling',
    50,
    'high',
    ARRAY['bicycle'],
    ARRAY[]::TEXT[],
    'Reduce interval duration to 8-10min if needed',
    'https://youtube.com/watch?v=sweet-spot',
    '10min warm-up. 3 x 12min at sweet spot (just below threshold). 5min recovery. Cool down.'
  ),

-- ============ STRENGTH - UPPER BODY (Fernando and Wife safe) ============

  (
    'Chest and Triceps Workout',
    'strength',
    'upper-body',
    30,
    'moderate',
    ARRAY['dumbbells', 'bench'],
    ARRAY[]::TEXT[],
    'Use resistance bands instead of dumbbells',
    'https://youtube.com/watch?v=chest-triceps',
    'Dumbbell press, chest fly, tricep dips, overhead extensions. 3 sets of 10-12 reps.'
  ),

  (
    'Back and Biceps Workout',
    'strength',
    'upper-body',
    30,
    'moderate',
    ARRAY['dumbbells', 'pull-up bar'],
    ARRAY[]::TEXT[],
    'Use resistance bands for rows',
    'https://youtube.com/watch?v=back-biceps',
    'Rows, lat pulldowns, bicep curls, hammer curls. 3 sets of 10-12 reps.'
  ),

  (
    'Shoulders and Arms',
    'strength',
    'upper-body',
    25,
    'moderate',
    ARRAY['dumbbells'],
    ARRAY[]::TEXT[],
    'Use lighter weights and increase reps',
    'https://youtube.com/watch?v=shoulders-arms',
    'Shoulder press, lateral raises, front raises, Arnold press. 3 sets of 12 reps.'
  ),

  (
    'Upper Body Circuit',
    'strength',
    'upper-body',
    30,
    'high',
    ARRAY['dumbbells', 'resistance bands'],
    ARRAY[]::TEXT[],
    'Add rest between circuits',
    'https://youtube.com/watch?v=upper-circuit',
    'Push-ups, rows, shoulder press, bicep curls, tricep dips. 4 rounds, 45sec each.'
  ),

  (
    'Pull Day (Back Focus)',
    'strength',
    'upper-body',
    30,
    'moderate',
    ARRAY['dumbbells', 'pull-up bar'],
    ARRAY[]::TEXT[],
    'Assisted pull-ups or resistance band rows',
    'https://youtube.com/watch?v=pull-day',
    'Pull-ups, bent-over rows, face pulls, rear delt fly. 3-4 sets of 8-12 reps.'
  ),

  (
    'Push Day (Chest Focus)',
    'strength',
    'upper-body',
    30,
    'moderate',
    ARRAY['dumbbells', 'bench'],
    ARRAY[]::TEXT[],
    'Floor press instead of bench press',
    'https://youtube.com/watch?v=push-day',
    'Bench press, incline press, chest fly, tricep extensions. 3-4 sets of 8-12 reps.'
  ),

-- ============ STRENGTH - CORE (Diastasis-safe options) ============

  (
    'Dead Bugs and Bird Dogs',
    'strength',
    'core',
    15,
    'low',
    ARRAY['mat'],
    ARRAY[]::TEXT[],
    'Slow down movement, focus on breath',
    'https://youtube.com/watch?v=dead-bugs',
    'DIASTASIS-SAFE: Focus on pelvic floor engagement. 3 sets of 10 each side.'
  ),

  (
    'Side Plank Variations',
    'strength',
    'core',
    15,
    'moderate',
    ARRAY['mat'],
    ARRAY[]::TEXT[],
    'Knee down for modified version',
    'https://youtube.com/watch?v=side-plank',
    'DIASTASIS-SAFE: Side planks, clamshells, side-lying leg lifts. Avoid twisting.'
  ),

  (
    'Pelvic Floor and Transverse Abdominis',
    'strength',
    'core',
    20,
    'low',
    ARRAY['mat'],
    ARRAY[]::TEXT[],
    'Focus on connection, not repetition',
    'https://youtube.com/watch?v=pelvic-floor',
    'DIASTASIS-SAFE: Gentle pelvic tilts, heel slides, toe taps. Breathing exercises.'
  ),

  (
    'Stability Ball Core Work',
    'strength',
    'core',
    20,
    'moderate',
    ARRAY['stability ball'],
    ARRAY[]::TEXT[],
    'Use smaller movements',
    'https://youtube.com/watch?v=stability-ball',
    'DIASTASIS-SAFE: Ball passes, wall squats with ball, gentle roll-outs.'
  ),

  -- UNSAFE core exercises (contraindicated for diastasis)
  (
    'Ab Workout - Crunches and Planks',
    'strength',
    'core',
    20,
    'moderate',
    ARRAY['mat'],
    ARRAY['diastasis-risk'],
    'Substitute with dead bugs and bird dogs',
    'https://youtube.com/watch?v=ab-workout',
    'WARNING: Contains crunches, sit-ups, full planks. Not suitable for diastasis recti.'
  ),

  (
    'Advanced Core Circuit',
    'strength',
    'core',
    25,
    'high',
    ARRAY['mat'],
    ARRAY['diastasis-risk'],
    'Modify with safe alternatives',
    'https://youtube.com/watch?v=advanced-core',
    'WARNING: High-intensity movements including V-ups and Russian twists. Not for diastasis.'
  ),

-- ============ STRENGTH - LOWER BODY ============

  -- Wife-safe lower body (no deep squats/high impact)
  (
    'Glute Bridges and Clamshells',
    'strength',
    'lower-body',
    20,
    'moderate',
    ARRAY['mat', 'resistance band'],
    ARRAY[]::TEXT[],
    'Add band for extra resistance',
    'https://youtube.com/watch?v=glute-bridges',
    'KNEE-SAFE: Glute bridges, single-leg bridges, clamshells, fire hydrants.'
  ),

  (
    'Step-Ups and Hip Thrusts',
    'strength',
    'lower-body',
    25,
    'moderate',
    ARRAY['step', 'dumbbells'],
    ARRAY[]::TEXT[],
    'Use lower step height',
    'https://youtube.com/watch?v=step-ups',
    'KNEE-SAFE: Low step-ups, hip thrusts, banded walks. Keep step height low (6-8 inches).'
  ),

  (
    'Leg Press and Leg Curls',
    'strength',
    'lower-body',
    30,
    'moderate',
    ARRAY['leg press machine', 'leg curl machine'],
    ARRAY[]::TEXT[],
    'Adjust machine range of motion',
    'https://youtube.com/watch?v=leg-press',
    'KNEE-SAFE: Control descent, don''t lock knees. Avoid deep knee flexion past 90 degrees.'
  ),

  -- Fernando-focused lower body (can include deeper movements)
  (
    'Squats and Deadlifts',
    'strength',
    'lower-body',
    30,
    'high',
    ARRAY['barbell', 'dumbbells'],
    ARRAY['knee-stress'],
    'Use lighter weight and partial range',
    'https://youtube.com/watch?v=squats-deadlifts',
    'Deep squats, Romanian deadlifts, goblet squats. Not suitable for knee issues.'
  ),

  (
    'Leg Day Circuit',
    'strength',
    'lower-body',
    30,
    'high',
    ARRAY['dumbbells', 'barbell'],
    ARRAY['knee-stress'],
    'Reduce depth of movements',
    'https://youtube.com/watch?v=leg-circuit',
    'Squats, lunges, jump squats, leg press. High intensity. Not for knee problems.'
  ),

  (
    'Bulgarian Split Squats',
    'strength',
    'lower-body',
    25,
    'high',
    ARRAY['bench', 'dumbbells'],
    ARRAY['knee-stress'],
    'Use lower elevation and no weight',
    'https://youtube.com/watch?v=bulgarian-squats',
    'Single-leg focused. Deep knee bend required. Not suitable for knee issues.'
  ),

-- ============ CARDIO - LOW IMPACT (Wife-safe) ============

  (
    'Walking - Brisk Pace',
    'cardio',
    'walking',
    30,
    'low',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'Slow pace if needed',
    NULL,
    'Safe for all. Maintain brisk but comfortable pace. Can be done outdoors or treadmill.'
  ),

  (
    'Walking - Incline Intervals',
    'cardio',
    'walking',
    30,
    'moderate',
    ARRAY['treadmill'],
    ARRAY[]::TEXT[],
    'Reduce incline percentage',
    NULL,
    'Alternate between flat and incline. Low impact. Great for building leg strength.'
  ),

  (
    'Swimming - Steady Pace',
    'cardio',
    'swimming',
    30,
    'moderate',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'Use floatation aids if needed',
    'https://youtube.com/watch?v=swimming-technique',
    'Low impact. Excellent full-body workout. Safe for joints.'
  ),

  (
    'Water Aerobics',
    'cardio',
    'aqua',
    30,
    'moderate',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'Adjust depth of water',
    'https://youtube.com/watch?v=water-aerobics',
    'Zero impact. Great for those with joint issues. Fun group activity.'
  ),

  (
    'Dance Cardio - Low Impact',
    'cardio',
    'dance',
    30,
    'moderate',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'Step instead of jump',
    'https://youtube.com/watch?v=dance-cardio-low',
    'KNEE-SAFE: No jumping. Keep one foot on ground. Fun and engaging.'
  ),

  (
    'Rowing Machine',
    'cardio',
    'rowing',
    25,
    'moderate',
    ARRAY['rowing machine'],
    ARRAY[]::TEXT[],
    'Adjust resistance and stroke rate',
    'https://youtube.com/watch?v=rowing-technique',
    'Low impact. Full-body workout. Focus on technique to avoid back strain.'
  ),

  (
    'Elliptical Trainer',
    'cardio',
    'elliptical',
    30,
    'moderate',
    ARRAY['elliptical'],
    ARRAY[]::TEXT[],
    'Adjust resistance and incline',
    NULL,
    'KNEE-SAFE: Zero impact. Good alternative to running. Adjust stride length for comfort.'
  ),

-- ============ CARDIO - HIGH IMPACT (Contraindicated for knee issues) ============

  (
    'Running - 5K Steady',
    'cardio',
    'running',
    30,
    'moderate',
    ARRAY[]::TEXT[],
    ARRAY['knee-stress'],
    'Switch to power walking',
    NULL,
    'High impact. Not suitable for knee issues. Proper running shoes essential.'
  ),

  (
    'HIIT - Burpees and Jump Squats',
    'cardio',
    'HIIT',
    20,
    'high',
    ARRAY[]::TEXT[],
    ARRAY['knee-stress', 'diastasis-risk'],
    'Low-impact HIIT alternatives available',
    'https://youtube.com/watch?v=hiit-workout',
    'HIGH IMPACT: Not suitable for knee issues or diastasis. Intense jumping movements.'
  ),

  (
    'Jump Rope Intervals',
    'cardio',
    'jump rope',
    15,
    'high',
    ARRAY['jump rope'],
    ARRAY['knee-stress'],
    'Step in place instead of jumping',
    'https://youtube.com/watch?v=jump-rope',
    'High impact. Not for knee problems. Excellent cardio efficiency.'
  ),

  (
    'Plyometric Training',
    'cardio',
    'plyometrics',
    25,
    'high',
    ARRAY[]::TEXT[],
    ARRAY['knee-stress', 'diastasis-risk'],
    'Use low-impact alternatives',
    'https://youtube.com/watch?v=plyometrics',
    'VERY HIGH IMPACT: Box jumps, bounds, depth jumps. Not for knee issues or diastasis.'
  ),

-- ============ FLEXIBILITY - YOGA & STRETCHING ============

  (
    'Gentle Yoga Flow',
    'flexibility',
    'yoga',
    30,
    'low',
    ARRAY['mat'],
    ARRAY[]::TEXT[],
    'Use blocks and straps for support',
    'https://youtube.com/watch?v=gentle-yoga',
    'SAFE FOR ALL: Slow-paced. Focus on breathing and gentle stretching.'
  ),

  (
    'Restorative Yoga',
    'flexibility',
    'yoga',
    30,
    'low',
    ARRAY['mat', 'bolster', 'blanket'],
    ARRAY[]::TEXT[],
    'Use extra props for comfort',
    'https://youtube.com/watch?v=restorative-yoga',
    'Deep relaxation. Hold poses for 5-10 minutes. Excellent for recovery.'
  ),

  (
    'Yin Yoga',
    'flexibility',
    'yoga',
    45,
    'low',
    ARRAY['mat', 'blocks'],
    ARRAY[]::TEXT[],
    'Reduce hold time if uncomfortable',
    'https://youtube.com/watch?v=yin-yoga',
    'Long holds (3-5 minutes). Targets connective tissue. Meditative practice.'
  ),

  (
    'Vinyasa Flow (Modified)',
    'flexibility',
    'yoga',
    30,
    'moderate',
    ARRAY['mat'],
    ARRAY['knee-stress'],
    'Skip chaturangas and deep lunges',
    'https://youtube.com/watch?v=vinyasa-modified',
    'Moving meditation. Avoid deep lunges and intense knee bends. Focus on breath.'
  ),

  (
    'Full Body Stretch Routine',
    'flexibility',
    'stretching',
    20,
    'low',
    ARRAY['mat'],
    ARRAY[]::TEXT[],
    'Hold stretches longer or shorter as needed',
    'https://youtube.com/watch?v=full-body-stretch',
    'SAFE FOR ALL: Static stretching for all major muscle groups. Hold each 30-60 seconds.'
  ),

  (
    'Hip Mobility and Flexibility',
    'flexibility',
    'stretching',
    20,
    'low',
    ARRAY['mat'],
    ARRAY[]::TEXT[],
    'Use props for support',
    'https://youtube.com/watch?v=hip-mobility',
    'Great for cyclists and desk workers. Focus on hip flexors, IT band, piriformis.'
  ),

  (
    'Upper Body and Shoulder Stretching',
    'flexibility',
    'stretching',
    15,
    'low',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'Can be done seated or standing',
    'https://youtube.com/watch?v=shoulder-stretch',
    'Perfect post-workout. Focus on chest, shoulders, and upper back.'
  ),

  (
    'Active Recovery Yoga',
    'flexibility',
    'yoga',
    25,
    'low',
    ARRAY['mat'],
    ARRAY[]::TEXT[],
    'Reduce intensity of poses',
    'https://youtube.com/watch?v=active-recovery-yoga',
    'Light movement for rest days. Gentle sun salutations, cat-cow, child\'s pose.'
  ),

  (
    'Power Yoga',
    'flexibility',
    'yoga',
    45,
    'high',
    ARRAY['mat'],
    ARRAY['knee-stress'],
    'Modify to gentler yoga style',
    'https://youtube.com/watch?v=power-yoga',
    'Intense flow with strength elements. Deep lunges and challenging poses. Not for knee issues.'
  ),

-- ============ ADDITIONAL MIXED WORKOUTS ============

  (
    'Total Body Conditioning',
    'strength',
    'full-body',
    30,
    'moderate',
    ARRAY['dumbbells', 'mat'],
    ARRAY[]::TEXT[],
    'Adjust weights and reps',
    'https://youtube.com/watch?v=total-body',
    'Combination of strength and cardio. Squats, push-ups, rows, planks.'
  ),

  (
    'Pilates - Mat Work',
    'flexibility',
    'pilates',
    30,
    'moderate',
    ARRAY['mat'],
    ARRAY['diastasis-risk'],
    'Skip movements that stress core',
    'https://youtube.com/watch?v=pilates-mat',
    'Core-focused. May not be suitable for diastasis. Check with physio first.'
  ),

  (
    'Barre Workout',
    'strength',
    'barre',
    30,
    'moderate',
    ARRAY['chair'],
    ARRAY[]::TEXT[],
    'Use wall instead of barre',
    'https://youtube.com/watch?v=barre-workout',
    'SAFE FOR ALL: Small, controlled movements. Focus on glutes, thighs, and arms.'
  ),

  (
    'Tai Chi',
    'flexibility',
    'tai-chi',
    30,
    'low',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'Adjust stance width',
    'https://youtube.com/watch?v=tai-chi',
    'Gentle martial art. Excellent for balance, flexibility, and mindfulness.'
  ),

  (
    'Boxing Workout (No Impact)',
    'cardio',
    'boxing',
    25,
    'moderate',
    ARRAY['boxing gloves', 'bag'],
    ARRAY[]::TEXT[],
    'Shadow boxing only (no bag)',
    'https://youtube.com/watch?v=boxing-cardio',
    'Upper body cardio. Combinations and footwork. Excellent stress relief.'
  ),

  (
    'Kettlebell Circuit',
    'strength',
    'full-body',
    25,
    'high',
    ARRAY['kettlebell'],
    ARRAY['knee-stress'],
    'Use lighter weight and modify movements',
    'https://youtube.com/watch?v=kettlebell-circuit',
    'Swings, goblet squats, Turkish get-ups. Dynamic movements require good form.'
  ),

  (
    'Battle Ropes',
    'cardio',
    'conditioning',
    15,
    'high',
    ARRAY['battle ropes'],
    ARRAY[]::TEXT[],
    'Reduce interval intensity',
    'https://youtube.com/watch?v=battle-ropes',
    'SAFE FOR ALL: Upper body cardio. Intense but low impact. Great for conditioning.'
  ),

  (
    'Foam Rolling and Mobility',
    'flexibility',
    'recovery',
    20,
    'low',
    ARRAY['foam roller'],
    ARRAY[]::TEXT[],
    'Use softer roller or tennis ball',
    'https://youtube.com/watch?v=foam-rolling',
    'Active recovery. Helps with muscle soreness. Roll slowly over muscle groups.'
  ),

  (
    'Chair Yoga',
    'flexibility',
    'yoga',
    25,
    'low',
    ARRAY['chair'],
    ARRAY[]::TEXT[],
    'Already modified for accessibility',
    'https://youtube.com/watch?v=chair-yoga',
    'SAFE FOR ALL: Perfect for those with mobility limitations. All poses done seated.'
  );

-- Summary:
-- Total exercises after this insert: 60+ exercises
-- Cycling/Sport: 5 exercises (various intensities and durations)
-- Strength Upper: 6 exercises (safe for all users)
-- Strength Core: 6 exercises (4 diastasis-safe, 2 contraindicated)
-- Strength Lower: 6 exercises (3 knee-safe, 3 contraindicated)
-- Cardio Low-Impact: 7 exercises (all knee-safe)
-- Cardio High-Impact: 4 exercises (all contraindicated for knee issues)
-- Flexibility/Yoga: 10 exercises (mostly safe, some with modifications)
-- Mixed/Other: 8 exercises (varied)
