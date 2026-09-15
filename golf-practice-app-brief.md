# Golf Practice App — Project Brief

## What this is
A mobile-web app (works in browser, add-to-home-screen — not a native app) for logging golf shots and putts at the range/course, detecting personal miss patterns, and generating targeted practice sessions from a drill library.

## Core features (v1)
1. **Shot logger** — fast tap-based entry for full-swing shots (club, shot type, miss direction, contact quality)
2. **Putting logger** — fast tap-based entry for putts (distance, break, result)
3. **Pattern detection** — surface dominant miss patterns per club (e.g. "7i: 73% push-right over last 20 shots") and putting tendencies (e.g. make% by distance bucket, miss bias by break direction)
4. **Practice plan generator** — matches detected patterns to a drill library and builds an ordered practice session
5. **Progress tracking** — re-check pattern frequency after practice sessions to show whether it's improving

## UX priorities
- Logging speed is the #1 priority — this gets used standing at a range or on a tee box. Target 3-5 taps per shot, no typing required for the common path.
- **Miss direction input**: use a compass/target-style tappable graphic (dot in center = straight; tap around it for direction) rather than a dropdown or buttons. This is the most important UI component to get right — build/prototype this first.
- Club and shot-type selection: large tap targets (grid or horizontal scroll), not menus.
- Contact quality (flush/thin/fat/toe/heel) is optional per entry — don't force it.
- Everything else (drill browsing, plan review, progress charts) can be a normal responsive web UI — speed only matters for in-the-moment logging.

## Platform
- Mobile-web app, responsive, installable via "Add to Home Screen." No app store distribution.
- Backend required (not local-only) — data should persist and sync across devices.
- Suggested stack: lightweight Node/Express (or similar) API + SQLite (fine even with a backend — no need for Postgres unless multi-user scale is a real goal). Simple auth (single user or basic passcode) unless multi-user is needed later.

## Data model

### `clubs`
- id, name (e.g. "7i", "Driver", "PW"), type (wood/iron/wedge/putter), avg_carry_yds (nullable)

### `shots`
- id, session_id (fk, nullable), club_id (fk)
- shot_type: tee | approach | chip | punch
- target_line: straight | draw | fade
- miss_direction: straight | left | right | pull | push | hook | slice
- miss_distance_yds (nullable)
- contact: flush | thin | fat | toe | heel | null
- lie: tee | fairway | rough | sand | range_mat
- distance_to_target_yds (nullable)
- confidence_pre_shot (1-5, nullable)
- notes (nullable)
- created_at

### `putts`
- id, session_id (fk, nullable)
- distance_ft
- break: straight | left_to_right | right_to_left
- slope: uphill | downhill | flat
- result: made | missed_left | missed_right | missed_short | missed_long
- created_at

### `sessions`
- id, date, type (range | course | putting_green), duration_min (nullable), notes, created_at

### `drills`
- id, name, category (full_swing | short_game | putting)
- targets_miss_pattern (text key for matching, e.g. "push_right", "chunk", "left_to_right_putts")
- club_focus (fk to clubs, nullable)
- description, est_duration_min, difficulty (1-3)

### `practice_plans`
- id, generated_at, based_on_pattern (text, e.g. "7i push-right, 65% of last 20 shots"), total_duration_min

### `practice_plan_drills` (join table, ordered)
- id, practice_plan_id (fk), drill_id (fk), order_index, completed (bool)

## Logic notes
- **Pattern detection**: query `shots` grouped by club_id + miss_direction over a rolling window (last 20-30 shots or last N sessions) to find dominant miss. Same approach for `putts` (make% by distance bucket, miss bias by break direction). Simple frequency counts are sufficient for v1 — no ML needed.
- **Drill matching**: match detected pattern string against `drills.targets_miss_pattern`. Simple string/tag match, not fuzzy logic.
- **Randomizer**: practice plans should mix pattern-targeted drills with some random drills from the full library for variety (mixed/random practice aids retention better than pure block practice).
- **Progress loop**: after a practice_plan's drills are marked completed, next pattern-detection run on new shots should be comparable to the pre-plan baseline so improvement is visible.

## Suggested build order
1. Backend scaffold: DB schema/migrations + REST endpoints for shots, putts, sessions, drills
2. Compass-tap miss-direction component (trickiest UI piece — prototype in isolation first)
3. Full shot + putt logging flow end-to-end (club picker → shot type → compass → contact → save)
4. Session view / history
5. Pattern detection queries
6. Drill library (seed initial drill set) + plan generator
7. Practice plan UI + completion tracking + progress view

## Open questions to resolve during build
- Single-user auth approach (passcode vs. none vs. simple login)
- Initial seed list of drills per miss pattern (needs a starter drill bank — can expand over time)
- Whether course-played misses should be visually distinguished from range misses in pattern detection (real misses under pressure vs. range misses may differ)
