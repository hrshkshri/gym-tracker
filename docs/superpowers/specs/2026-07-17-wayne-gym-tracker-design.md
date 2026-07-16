# Wayne — Gym Tracker · Design Spec

**Date:** 2026-07-17
**Owner:** Harsh
**Status:** Approved, pre-implementation

## Purpose

A mobile-first, installable PWA (also works on desktop web) to run Harsh's July 2026
body-recomposition program. Open it in the gym, log sets in real time, and always see
last session's numbers before the next set so weight progression is never guessed. It
also tracks fasted bodyweight over time and shows the diet plan as reference.

Source of truth for the program content is `Harsh_Fitness_Plan_July2026.pdf`
(6-day split + cardio + distributed-cut diet).

## Goals

- Log workout sets (weight + reps) fast, with big thumb-friendly inputs.
- Show **"last time" numbers inline** for each exercise while logging.
- Auto-select today's session by weekday; still allow picking any day.
- Keep the plan **non-brittle**: skip / swap / add exercises freely on any given day
  without corrupting the underlying plan.
- Track fasted bodyweight with a trend + 7-day rolling average against the plan's
  0.4kg/week target.
- View the diet plan (training vs rest day) as reference.
- **Offline-first**: logging works in gym signal dead spots; syncs when back online.
- Dark, tactical, aesthetic UI.

## Non-Goals (YAGNI)

- No authentication (single-user app).
- No meal check-off / diet adherence tracking — diet is read-only reference.
- No multi-device conflict resolution beyond last-write-wins (single user).
- No editing the master day-templates from the UI (deviations are today-only).
- No social / sharing / coaching features.

## Decisions (from brainstorming)

1. **Scope:** workout logging + bodyweight trend + diet *view*. Diet is read-only.
2. **Flexibility:** day-templates are defaults only. Each session is an independent
   editable copy — skip/swap/add affects that day's log only; next week loads fresh
   from the template.
3. **Offline:** offline-first. Local writes are instant; sync to MongoDB when online.

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — dark, high-contrast theme
- **Dexie.js** (IndexedDB) — local-first store + mutation queue
- **Mongoose → MongoDB Atlas** — accessed only via server route handlers
- **Serwist** (maintained successor to next-pwa) — installable/offline service worker
- **Recharts** — progress + bodyweight charts
- **Vitest** — unit tests
- Deployed on **Vercel**

MongoDB connection string is provided by the user and will live in an env var
(`MONGODB_URI`), never committed.

## Architecture: Offline-First

Chosen approach: **Dexie (IndexedDB) + mutation queue**, over a heavier sync engine
(RxDB/Replicache) which would add multi-device conflict machinery this single-user app
does not need, and over localStorage which is too fragile for structured set data.

Flow:
- All reads and writes go to **Dexie first** (instant, works with no signal).
- Each mutation is appended to a **sync queue** in IndexedDB.
- A sync worker **flushes the queue** to server route handlers → MongoDB when online.
- On app load (when online), **pull latest** from Mongo and reconcile by `updatedAt`
  (last-write-wins).

## Data Model

### DayTemplate (seeded defaults, read-only)
```
{
  dayKey: 'legs' | 'pullA' | 'pushA' | 'run' | 'pullB' | 'pushB' | 'rest',
  title: string,            // e.g. "Push A (Chest + Shoulders + Triceps)"
  weekday: number,          // 0=Sun ... 6=Sat, per the plan's schedule
  exercises: [
    { name: string, targetSets: number, repRange: string, note?: string }
  ],
  cardio?: string           // e.g. "1km jog — Incline 6, Speed 8–9 km/h"
}
```

### Session (a logged workout — independent copy)
```
{
  _id: string,
  date: string,             // ISO date
  dayKey: DayKey,
  title: string,
  exercises: [
    {
      name: string,
      targetSets: number,
      repRange: string,
      skipped: boolean,
      note?: string,
      sets: [ { weight: number, reps: number, done: boolean } ]
    }
  ],
  cardioDone: boolean,
  updatedAt: number         // for last-write-wins reconciliation
}
```

### BodyweightEntry
```
{ _id: string, date: string, weightKg: number, updatedAt: number }
```

### Diet (static, in-repo — not in DB)
Training-day and rest-day meal tables, calorie/protein targets, and the 11 key rules,
transcribed from the PDF into a typed constant.

## Screens

Bottom tab bar navigation: **Today · History · Progress · Diet**.

1. **Today (Home)**
   - Auto-detects weekday → today's session card (e.g. "Wednesday · Push A"), with a
     manual override to pick any day.
   - Diet summary card (training vs rest day) → taps into Diet screen.
   - One-tap fasted-bodyweight entry.

2. **Session**
   - Exercises pre-loaded from the day-template.
   - Per exercise: target sets/reps shown; per-set weight + reps inputs (numeric
     keypad); **"last time" numbers inline** from the most recent prior session of that
     exercise.
   - Mark each set done. Cardio checkbox.
   - Skip / swap / add exercise — all today-only, never mutates the template.

3. **History**
   - Reverse-chronological list of sessions; tap to expand full detail.

4. **Progress**
   - Per-exercise weight-over-time chart.
   - Bodyweight trend with **7-day rolling average** and a 0.4kg/week target reference
     line.

5. **Diet**
   - Training vs rest day meal tables, calorie/protein targets, and the 11 key rules.

## Core Logic (pure, testable)

- **Last-time resolver:** given an exercise name and the current date, find the most
  recent earlier session containing that exercise and return its sets.
- **7-day rolling average:** over bodyweight entries.
- **Sync queue:** enqueue mutation, flush on connectivity, reconcile by `updatedAt`.

## Seeding

On first run, seed the six day-templates + rest day from the PDF into the app. Diet
content ships as an in-repo constant.

## Testing

Pragmatic vitest coverage of the logic most likely to break:
- last-time resolver
- 7-day rolling average
- sync queue enqueue/flush/reconcile
Plus a couple of component smoke tests for Session and Today.

## Aesthetic

Dark, high-contrast, tactical "Wayne" vibe: near-black background, a single bold accent
color, oversized weight numbers, large thumb-friendly tap targets, numeric keypads on
weight/rep inputs. Exact palette finalized during the frontend-design pass.
