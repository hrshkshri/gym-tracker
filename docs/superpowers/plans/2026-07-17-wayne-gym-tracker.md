# Wayne Gym Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline-first, installable PWA to run Harsh's body-recomposition program — log workout sets with "last time" numbers inline, track fasted bodyweight, and view the diet plan.

**Architecture:** Next.js 14 App Router. All reads/writes go to a local Dexie (IndexedDB) store first for instant, offline-capable logging; a mutation queue flushes to MongoDB Atlas via server route handlers when online, reconciling by `updatedAt` (last-write-wins, single user). Day-templates are read-only defaults; each logged session is an independent, freely-editable copy. Diet content is a static in-repo constant. Pure logic (last-time resolver, 7-day average, sync reconciliation) is isolated and unit-tested.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Dexie 4, Mongoose 8, Serwist (PWA), Recharts 2, Vitest + @testing-library/react + fake-indexeddb.

## Global Constraints

- Single user, **no authentication**.
- MongoDB connection string lives only in `MONGODB_URI` env var — never committed. `.env*` is gitignored; provide `.env.example`.
- Diet is **read-only** reference — no meal check-off.
- Deviations (skip/swap/add exercise) are **today-only** and must never mutate a `DayTemplate`.
- Reconciliation is **last-write-wins** by numeric `updatedAt` (ms epoch).
- `dayKey` is one of exactly: `legs | pullA | pushA | run | pullB | pushB | rest`.
- Weekday mapping (0=Sun..6=Sat): Sun=rest, Mon=legs, Tue=pullA, Wed=pushA, Thu=run, Fri=pullB, Sat=pushB.
- Dark theme only. Mobile-first. Numeric inputs use `inputMode="decimal"`.
- Frequent commits: one per task minimum. TDD: test first for all logic tasks.

---

## File Structure

```
package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.mjs
vitest.config.ts, vitest.setup.ts, .env.example, .gitignore
public/manifest.webmanifest, public/icons/*
src/
  app/
    layout.tsx                 # root shell, dark theme, bottom nav, PWA meta
    globals.css                # tailwind + theme tokens
    page.tsx                   # Today
    session/[id]/page.tsx      # Session view (client)
    history/page.tsx           # History
    progress/page.tsx          # Progress
    diet/page.tsx              # Diet
    api/sessions/route.ts      # GET all / POST upsert
    api/bodyweight/route.ts    # GET all / POST upsert
  lib/
    types.ts                   # shared TS types
    data/templates.ts          # 7 day-templates from the PDF
    data/diet.ts               # diet constant from the PDF
    logic/lastTime.ts          # last-time resolver (pure)
    logic/rollingAverage.ts    # 7-day rolling average (pure)
    logic/reconcile.ts         # last-write-wins merge (pure)
    logic/schedule.ts          # weekday -> dayKey (pure)
    db/dexie.ts                # local store + typed tables
    db/repo.ts                 # local-first repository (CRUD + enqueue)
    db/sync.ts                 # flush queue to API, pull + reconcile
    db/mongoose.ts             # cached Atlas connection (server)
    models/session.model.ts    # Mongoose Session
    models/bodyweight.model.ts # Mongoose BodyweightEntry
  components/
    BottomNav.tsx
    SessionCard.tsx
    ExerciseCard.tsx
    SetRow.tsx
    WeightChart.tsx
    BodyweightChart.tsx
  test/
    ... colocated *.test.ts(x)
```

---

## Task 1: Project scaffold (Next.js + TS + Tailwind + Vitest)

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`, `.env.example`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/lib/logic/schedule.ts`
- Test: `src/lib/logic/schedule.test.ts`

**Interfaces:**
- Produces: `getDayKeyForWeekday(weekday: number): DayKey` and type `DayKey`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "wayne-gym-tracker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "mongoose": "8.5.1",
    "dexie": "4.0.8",
    "recharts": "2.12.7",
    "@serwist/next": "9.0.5",
    "serwist": "9.0.5"
  },
  "devDependencies": {
    "typescript": "5.5.4",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "@types/node": "20.14.12",
    "tailwindcss": "3.4.7",
    "postcss": "8.4.40",
    "autoprefixer": "10.4.19",
    "vitest": "2.0.5",
    "jsdom": "24.1.1",
    "@testing-library/react": "16.0.0",
    "@testing-library/jest-dom": "6.4.8",
    "@vitejs/plugin-react": "4.3.1",
    "fake-indexeddb": "6.0.0"
  }
}
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: dependencies install, `node_modules/` created, no peer-dep errors that block.

- [ ] **Step 3: Create configs**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.mjs`:
```js
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSerwist(nextConfig);
```

`postcss.config.mjs`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0b",
        surface: "#141416",
        surface2: "#1d1d20",
        line: "#2a2a2e",
        accent: "#c6ff3f",
        muted: "#8a8a92",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 4: Create Vitest config + setup**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
```

`.env.example`:
```
MONGODB_URI=your-mongodb-atlas-connection-string
```

- [ ] **Step 5: Write the failing test**

`src/lib/logic/schedule.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getDayKeyForWeekday } from "./schedule";

describe("getDayKeyForWeekday", () => {
  it("maps weekdays to the plan's day keys", () => {
    expect(getDayKeyForWeekday(0)).toBe("rest");   // Sun
    expect(getDayKeyForWeekday(1)).toBe("legs");   // Mon
    expect(getDayKeyForWeekday(2)).toBe("pullA");  // Tue
    expect(getDayKeyForWeekday(3)).toBe("pushA");  // Wed
    expect(getDayKeyForWeekday(4)).toBe("run");    // Thu
    expect(getDayKeyForWeekday(5)).toBe("pullB");  // Fri
    expect(getDayKeyForWeekday(6)).toBe("pushB");  // Sat
  });

  it("throws on an out-of-range weekday", () => {
    expect(() => getDayKeyForWeekday(7)).toThrow();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- schedule`
Expected: FAIL — cannot resolve `./schedule`.

- [ ] **Step 7: Implement `src/lib/logic/schedule.ts`**

```ts
export type DayKey =
  | "legs" | "pullA" | "pushA" | "run" | "pullB" | "pushB" | "rest";

const WEEKDAY_TO_DAYKEY: Record<number, DayKey> = {
  0: "rest",
  1: "legs",
  2: "pullA",
  3: "pushA",
  4: "run",
  5: "pullB",
  6: "pushB",
};

export function getDayKeyForWeekday(weekday: number): DayKey {
  const key = WEEKDAY_TO_DAYKEY[weekday];
  if (!key) throw new Error(`Invalid weekday: ${weekday}`);
  return key;
}
```

- [ ] **Step 8: Create minimal app shell so `next build` works**

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { background: #0a0a0b; color: #f5f5f7; }
```

`src/app/layout.tsx`:
```tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wayne",
  description: "Gym tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:
```tsx
export default function Home() {
  return <main className="p-6">Wayne</main>;
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm test -- schedule`
Expected: PASS (2 tests).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + Vitest, add schedule mapping"
```

---

## Task 2: Shared types + day-templates + diet data

**Files:**
- Create: `src/lib/types.ts`, `src/lib/data/templates.ts`, `src/lib/data/diet.ts`
- Test: `src/lib/data/templates.test.ts`

**Interfaces:**
- Consumes: `DayKey` from `@/lib/logic/schedule`.
- Produces:
  - Types `ExerciseTemplate`, `DayTemplate`, `SetEntry`, `SessionExercise`, `Session`, `BodyweightEntry`.
  - `DAY_TEMPLATES: Record<DayKey, DayTemplate>`.
  - `getTemplate(dayKey: DayKey): DayTemplate`.
  - `DIET: DietPlan` and type `DietPlan`.

- [ ] **Step 1: Write the failing test**

`src/lib/data/templates.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { DAY_TEMPLATES, getTemplate } from "./templates";

describe("DAY_TEMPLATES", () => {
  it("has all seven day keys", () => {
    expect(Object.keys(DAY_TEMPLATES).sort()).toEqual(
      ["legs", "pullA", "pullB", "pushA", "pushB", "rest", "run"].sort()
    );
  });

  it("legs template matches the plan (7 exercises, squat first)", () => {
    const legs = getTemplate("legs");
    expect(legs.title).toContain("Legs");
    expect(legs.exercises).toHaveLength(7);
    expect(legs.exercises[0].name).toContain("Squat");
    expect(legs.exercises[0].targetSets).toBe(4);
    expect(legs.exercises[0].repRange).toBe("6–8");
  });

  it("rest day has no exercises", () => {
    expect(getTemplate("rest").exercises).toHaveLength(0);
  });

  it("pullA carries the jog cardio note", () => {
    expect(getTemplate("pullA").cardio).toContain("1km");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- templates`
Expected: FAIL — cannot resolve `./templates`.

- [ ] **Step 3: Implement `src/lib/types.ts`**

```ts
import type { DayKey } from "@/lib/logic/schedule";

export type { DayKey };

export interface ExerciseTemplate {
  name: string;
  targetSets: number;
  repRange: string; // e.g. "6–8", "Max", "10 each leg"
  note?: string;
}

export interface DayTemplate {
  dayKey: DayKey;
  title: string;
  weekday: number; // 0=Sun..6=Sat
  exercises: ExerciseTemplate[];
  cardio?: string;
}

export interface SetEntry {
  weight: number;
  reps: number;
  done: boolean;
}

export interface SessionExercise {
  name: string;
  targetSets: number;
  repRange: string;
  skipped: boolean;
  note?: string;
  sets: SetEntry[];
}

export interface Session {
  id: string;          // uuid, shared local + Atlas
  date: string;        // ISO yyyy-mm-dd
  dayKey: DayKey;
  title: string;
  exercises: SessionExercise[];
  cardioDone: boolean;
  updatedAt: number;   // ms epoch, for last-write-wins
}

export interface BodyweightEntry {
  id: string;
  date: string;        // ISO yyyy-mm-dd
  weightKg: number;
  updatedAt: number;
}
```

- [ ] **Step 4: Implement `src/lib/data/templates.ts`** (transcribed verbatim from the PDF)

```ts
import type { DayKey, DayTemplate } from "@/lib/types";

const ex = (name: string, targetSets: number, repRange: string, note?: string) =>
  ({ name, targetSets, repRange, note });

const JOG = "1km jog — Incline 6, Speed 8–9 km/h";

export const DAY_TEMPLATES: Record<DayKey, DayTemplate> = {
  legs: {
    dayKey: "legs",
    title: "Legs",
    weekday: 1,
    exercises: [
      ex("Barbell Squat (deep, safety pins set)", 4, "6–8"),
      ex("RDL", 4, "8–10"),
      ex("Bulgarian Split Squat", 3, "10 each leg"),
      ex("Leg Extension", 3, "12–15"),
      ex("Leg Curl", 3, "12–15"),
      ex("Calf Raises", 5, "15–20"),
      ex("Decline Sit-ups — Upper Abs", 3, "15"),
    ],
  },
  pullA: {
    dayKey: "pullA",
    title: "Pull A (Back + Biceps)",
    weekday: 2,
    cardio: JOG,
    exercises: [
      ex("Assisted Pull Ups", 4, "Max"),
      ex("Barbell Row", 4, "6–8"),
      ex("Chest-Supported Machine Row (neutral grip)", 3, "10–12"),
      ex("Lat Pulldown", 3, "10–12"),
      ex("Face Pulls", 3, "15"),
      ex("DB Curl", 3, "12"),
      ex("Hammer Curl", 3, "12"),
    ],
  },
  pushA: {
    dayKey: "pushA",
    title: "Push A (Chest + Shoulders + Triceps)",
    weekday: 3,
    cardio: JOG,
    exercises: [
      ex("Barbell Bench Press", 4, "6–8"),
      ex("Barbell Incline Press", 4, "8–10"),
      ex("Assisted Dips", 3, "8–10"),
      ex("Standing Barbell OHP", 4, "6–8"),
      ex("Lateral Raise", 3, "15"),
      ex("Triceps Pushdown", 3, "12–15"),
      ex("Reverse Crunches — Lower Abs", 3, "15"),
    ],
  },
  run: {
    dayKey: "run",
    title: "Run",
    weekday: 4,
    cardio:
      "3–4km · Speed 9 km/h · Incline 0 (flat) · Run/walk intervals — run at 9 km/h, walk at 4–5 km/h to recover, repeat. Shin tightness → drop to walk immediately.",
    exercises: [],
  },
  pullB: {
    dayKey: "pullB",
    title: "Pull B (Back + Biceps)",
    weekday: 5,
    exercises: [
      ex("Assisted Chin Ups", 4, "Max"),
      ex("Deadlift", 4, "4–5"),
      ex("Single Arm DB Row", 4, "8–10 each"),
      ex("Cable Straight-Arm Pulldown", 3, "12–15"),
      ex("Reverse Fly", 3, "15"),
      ex("Incline DB Curl", 3, "12"),
    ],
  },
  pushB: {
    dayKey: "pushB",
    title: "Push B (Chest + Shoulders + Triceps)",
    weekday: 6,
    cardio: JOG,
    exercises: [
      ex("DB Flat Press", 4, "8–10"),
      ex("DB Shoulder Press", 4, "8–10"),
      ex("Cable Flye", 3, "12–15"),
      ex("Seated Lateral Raise", 3, "15"),
      ex("Triceps Overhead Extension", 3, "12"),
      ex("Bicycle Crunches — Obliques", 3, "20"),
    ],
  },
  rest: {
    dayKey: "rest",
    title: "Rest",
    weekday: 0,
    exercises: [],
  },
};

export function getTemplate(dayKey: DayKey): DayTemplate {
  return DAY_TEMPLATES[dayKey];
}
```

- [ ] **Step 5: Implement `src/lib/data/diet.ts`** (transcribed verbatim from the PDF)

```ts
export interface Meal { meal: string; food: string; }
export interface DietDay { label: string; calories: string; protein: string; meals: Meal[]; }
export interface DietPlan {
  context: string;
  training: DietDay;
  rest: DietDay;
  rules: string[];
}

export const DIET: DietPlan = {
  context:
    "Distributed cut, introduced after a 3–4 week plateau at ~79kg. ~280 kcal below prior intake. Supplement: Avvatar 100% Performance Whey, Cold Coffee — 1 scoop daily (27.5g protein, ~135 kcal).",
  training: {
    label: "Training / Run Days",
    calories: "~2,280–2,350 kcal",
    protein: "~180g",
    meals: [
      { meal: "Pre-workout", food: "1 bread + 1 tbsp PB" },
      { meal: "Breakfast (post-workout)", food: "Milk chai (low sugar) + 2 bread + 1 cheese slice + 4-egg omelette" },
      { meal: "Mid-morning shake", food: "1 banana + 30g oats + 20g PB + 300ml whole milk + 1 scoop whey" },
      { meal: "Lunch", food: "2 bread + 1 tbsp PB" },
      { meal: "Dinner", food: "100g cooked rice + 300g cooked chicken" },
      { meal: "Daily", food: "1 apple + fiber source at dinner" },
    ],
  },
  rest: {
    label: "Rest Days (Sunday)",
    calories: "~2,080–2,150 kcal",
    protein: "~165g",
    meals: [
      { meal: "Breakfast", food: "Milk chai + 2 bread + 1 cheese slice + 2-egg omelette" },
      { meal: "Mid-morning shake", food: "20g oats + 20g PB + 300ml whole milk + 1 scoop whey (no banana)" },
      { meal: "Lunch", food: "2 bread + 1 tbsp PB" },
      { meal: "Snack", food: "1 bread + 1 tbsp PB + chai" },
      { meal: "Dinner", food: "100g cooked rice + 250g cooked chicken" },
      { meal: "Daily", food: "1 apple + fiber source at dinner" },
    ],
  },
  rules: [
    "Run this diet unchanged for 2 weeks; judge the 7-day scale average, then reassess. No mid-window edits.",
    "Lift heavy — do NOT lighten weights to 'tone'. Compound lifts protect muscle on the cut.",
    "Progressive overload every week on squat, bench, OHP, deadlift, rows, pull-ups.",
    "Pull-up assist: drop by 2.5–5kg every 2–3 weeks as reps allow.",
    "Shin splints rule: any shin tightness during jog → drop to walk immediately, no exceptions.",
    "Scale target: ~0.4kg/week average. If dropping >0.5kg/week, add 100–150 kcal back. If stalled 2+ weeks, trim again (oats next).",
    "Weekly checks: fasted weight daily (7-day average), waist at navel once/week, main lift numbers.",
    "Next dietary recalculation at 76kg, then every 2kg.",
    "Post-binge or off-plan days: return to this plan immediately — no extra restriction, no added cardio.",
    "All food weights are cooked weights. 100g cooked rice ≈ 33g raw; 300g cooked chicken ≈ 380–400g raw.",
    "Carbs near training are fuel, carbs far from training are the budget — cuts come from dinner first, never the morning shake.",
  ],
};
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- templates`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add shared types, day-templates, and diet data from the plan"
```

---

## Task 3: Last-time resolver (pure logic)

**Files:**
- Create: `src/lib/logic/lastTime.ts`
- Test: `src/lib/logic/lastTime.test.ts`

**Interfaces:**
- Consumes: `Session`, `SetEntry` from `@/lib/types`.
- Produces: `findLastTime(sessions: Session[], exerciseName: string, beforeDate: string): SetEntry[] | null`.

- [ ] **Step 1: Write the failing test**

`src/lib/logic/lastTime.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { findLastTime } from "./lastTime";
import type { Session } from "@/lib/types";

const mk = (date: string, name: string, sets: [number, number][]): Session => ({
  id: date + name,
  date,
  dayKey: "pushA",
  title: "Push A",
  cardioDone: false,
  updatedAt: 0,
  exercises: [
    { name, targetSets: sets.length, repRange: "6–8", skipped: false,
      sets: sets.map(([weight, reps]) => ({ weight, reps, done: true })) },
  ],
});

describe("findLastTime", () => {
  it("returns the sets from the most recent earlier session with that exercise", () => {
    const sessions = [
      mk("2026-07-01", "Barbell Bench Press", [[60, 8]]),
      mk("2026-07-08", "Barbell Bench Press", [[62.5, 8], [62.5, 7]]),
    ];
    const result = findLastTime(sessions, "Barbell Bench Press", "2026-07-15");
    expect(result).toEqual([
      { weight: 62.5, reps: 8, done: true },
      { weight: 62.5, reps: 7, done: true },
    ]);
  });

  it("ignores sessions on or after beforeDate", () => {
    const sessions = [mk("2026-07-15", "Barbell Bench Press", [[65, 5]])];
    expect(findLastTime(sessions, "Barbell Bench Press", "2026-07-15")).toBeNull();
  });

  it("ignores exercises that were skipped", () => {
    const s = mk("2026-07-08", "Barbell Bench Press", [[62.5, 8]]);
    s.exercises[0].skipped = true;
    expect(findLastTime([s], "Barbell Bench Press", "2026-07-15")).toBeNull();
  });

  it("returns null when the exercise was never done before", () => {
    const sessions = [mk("2026-07-01", "Deadlift", [[100, 5]])];
    expect(findLastTime(sessions, "Barbell Bench Press", "2026-07-15")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lastTime`
Expected: FAIL — cannot resolve `./lastTime`.

- [ ] **Step 3: Implement `src/lib/logic/lastTime.ts`**

```ts
import type { Session, SetEntry } from "@/lib/types";

export function findLastTime(
  sessions: Session[],
  exerciseName: string,
  beforeDate: string
): SetEntry[] | null {
  const candidates = sessions
    .filter((s) => s.date < beforeDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

  for (const session of candidates) {
    const match = session.exercises.find(
      (e) => e.name === exerciseName && !e.skipped && e.sets.length > 0
    );
    if (match) return match.sets;
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lastTime`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add last-time resolver"
```

---

## Task 4: 7-day rolling average (pure logic)

**Files:**
- Create: `src/lib/logic/rollingAverage.ts`
- Test: `src/lib/logic/rollingAverage.test.ts`

**Interfaces:**
- Consumes: `BodyweightEntry` from `@/lib/types`.
- Produces: `rollingAverage7(entries: BodyweightEntry[]): { date: string; weight: number; avg: number }[]`.

- [ ] **Step 1: Write the failing test**

`src/lib/logic/rollingAverage.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { rollingAverage7 } from "./rollingAverage";
import type { BodyweightEntry } from "@/lib/types";

const bw = (date: string, weightKg: number): BodyweightEntry =>
  ({ id: date, date, weightKg, updatedAt: 0 });

describe("rollingAverage7", () => {
  it("sorts by date and averages the trailing window (<=7 days)", () => {
    const out = rollingAverage7([bw("2026-07-02", 79), bw("2026-07-01", 79.4)]);
    expect(out[0]).toEqual({ date: "2026-07-01", weight: 79.4, avg: 79.4 });
    expect(out[1].date).toBe("2026-07-02");
    expect(out[1].avg).toBeCloseTo(79.2, 5);
  });

  it("windows to the last 7 points once enough exist", () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      bw(`2026-07-0${i + 1}`, 80 - i) // 80,79,...,73
    );
    const out = rollingAverage7(entries);
    // 8th point averages days 2..8 => weights 79..73 => mean 76
    expect(out[7].avg).toBeCloseTo(76, 5);
  });

  it("returns [] for no entries", () => {
    expect(rollingAverage7([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- rollingAverage`
Expected: FAIL — cannot resolve `./rollingAverage`.

- [ ] **Step 3: Implement `src/lib/logic/rollingAverage.ts`**

```ts
import type { BodyweightEntry } from "@/lib/types";

export function rollingAverage7(
  entries: BodyweightEntry[]
): { date: string; weight: number; avg: number }[] {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  return sorted.map((entry, i) => {
    const window = sorted.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((sum, e) => sum + e.weightKg, 0) / window.length;
    return { date: entry.date, weight: entry.weightKg, avg };
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- rollingAverage`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add 7-day rolling average"
```

---

## Task 5: Reconcile (last-write-wins merge, pure logic)

**Files:**
- Create: `src/lib/logic/reconcile.ts`
- Test: `src/lib/logic/reconcile.test.ts`

**Interfaces:**
- Produces: `reconcileById<T extends { id: string; updatedAt: number }>(local: T[], remote: T[]): T[]`.

- [ ] **Step 1: Write the failing test**

`src/lib/logic/reconcile.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { reconcileById } from "./reconcile";

type Row = { id: string; updatedAt: number; v: string };

describe("reconcileById", () => {
  it("keeps the higher updatedAt for each id and unions ids", () => {
    const local: Row[] = [
      { id: "a", updatedAt: 5, v: "local-a" },
      { id: "b", updatedAt: 1, v: "local-b" },
    ];
    const remote: Row[] = [
      { id: "a", updatedAt: 3, v: "remote-a" },
      { id: "c", updatedAt: 9, v: "remote-c" },
    ];
    const out = reconcileById(local, remote).sort((x, y) => x.id.localeCompare(y.id));
    expect(out).toEqual([
      { id: "a", updatedAt: 5, v: "local-a" },
      { id: "b", updatedAt: 1, v: "local-b" },
      { id: "c", updatedAt: 9, v: "remote-c" },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- reconcile`
Expected: FAIL — cannot resolve `./reconcile`.

- [ ] **Step 3: Implement `src/lib/logic/reconcile.ts`**

```ts
export function reconcileById<T extends { id: string; updatedAt: number }>(
  local: T[],
  remote: T[]
): T[] {
  const byId = new Map<string, T>();
  for (const row of [...local, ...remote]) {
    const existing = byId.get(row.id);
    if (!existing || row.updatedAt > existing.updatedAt) byId.set(row.id, row);
  }
  return [...byId.values()];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- reconcile`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add last-write-wins reconcile"
```

---

## Task 6: Dexie local store + repository

**Files:**
- Create: `src/lib/db/dexie.ts`, `src/lib/db/repo.ts`
- Test: `src/lib/db/repo.test.ts`

**Interfaces:**
- Consumes: `Session`, `BodyweightEntry` from `@/lib/types`; `reconcileById`.
- Produces (from `repo.ts`):
  - `saveSession(s: Session): Promise<void>` — writes local + enqueues.
  - `getSessions(): Promise<Session[]>`.
  - `saveBodyweight(b: BodyweightEntry): Promise<void>`.
  - `getBodyweights(): Promise<BodyweightEntry[]>`.
  - `getPendingMutations(): Promise<Mutation[]>` and `clearMutation(id: number): Promise<void>`.
  - `mergeRemote(sessions: Session[], bodyweights: BodyweightEntry[]): Promise<void>`.
  - Type `Mutation = { id?: number; entity: "session" | "bodyweight"; payload: Session | BodyweightEntry }`.

- [ ] **Step 1: Write the failing test**

`src/lib/db/repo.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./dexie";
import {
  saveSession, getSessions, getPendingMutations,
  saveBodyweight, getBodyweights, mergeRemote,
} from "./repo";
import type { Session, BodyweightEntry } from "@/lib/types";

const session = (id: string, updatedAt: number): Session => ({
  id, date: "2026-07-15", dayKey: "pushA", title: "Push A",
  cardioDone: false, updatedAt, exercises: [],
});
const bodyweight = (id: string, updatedAt: number): BodyweightEntry =>
  ({ id, date: "2026-07-15", weightKg: 79, updatedAt });

describe("repo", () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.bodyweights.clear();
    await db.mutations.clear();
  });

  it("saveSession stores locally and enqueues a mutation", async () => {
    await saveSession(session("s1", 1));
    expect(await getSessions()).toHaveLength(1);
    const pending = await getPendingMutations();
    expect(pending).toHaveLength(1);
    expect(pending[0].entity).toBe("session");
  });

  it("saveBodyweight stores and enqueues", async () => {
    await saveBodyweight(bodyweight("b1", 1));
    expect(await getBodyweights()).toHaveLength(1);
    expect(await getPendingMutations()).toHaveLength(1);
  });

  it("mergeRemote reconciles by updatedAt without enqueuing", async () => {
    await saveSession(session("s1", 1));
    await db.mutations.clear();
    await mergeRemote([session("s1", 5), session("s2", 2)], []);
    const stored = (await getSessions()).sort((a, b) => a.id.localeCompare(b.id));
    expect(stored.map((s) => [s.id, s.updatedAt])).toEqual([["s1", 5], ["s2", 2]]);
    expect(await getPendingMutations()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- repo`
Expected: FAIL — cannot resolve `./dexie`.

- [ ] **Step 3: Implement `src/lib/db/dexie.ts`**

```ts
import Dexie, { type Table } from "dexie";
import type { Session, BodyweightEntry } from "@/lib/types";

export interface Mutation {
  id?: number;
  entity: "session" | "bodyweight";
  payload: Session | BodyweightEntry;
}

export class WayneDB extends Dexie {
  sessions!: Table<Session, string>;
  bodyweights!: Table<BodyweightEntry, string>;
  mutations!: Table<Mutation, number>;

  constructor() {
    super("wayne");
    this.version(1).stores({
      sessions: "id, date, dayKey",
      bodyweights: "id, date",
      mutations: "++id, entity",
    });
  }
}

export const db = new WayneDB();
```

- [ ] **Step 4: Implement `src/lib/db/repo.ts`**

```ts
import { db, type Mutation } from "./dexie";
import { reconcileById } from "@/lib/logic/reconcile";
import type { Session, BodyweightEntry } from "@/lib/types";

export type { Mutation };

export async function saveSession(s: Session): Promise<void> {
  await db.sessions.put(s);
  await db.mutations.add({ entity: "session", payload: s });
}

export async function getSessions(): Promise<Session[]> {
  return db.sessions.toArray();
}

export async function saveBodyweight(b: BodyweightEntry): Promise<void> {
  await db.bodyweights.put(b);
  await db.mutations.add({ entity: "bodyweight", payload: b });
}

export async function getBodyweights(): Promise<BodyweightEntry[]> {
  return db.bodyweights.toArray();
}

export async function getPendingMutations(): Promise<Mutation[]> {
  return db.mutations.toArray();
}

export async function clearMutation(id: number): Promise<void> {
  await db.mutations.delete(id);
}

export async function mergeRemote(
  sessions: Session[],
  bodyweights: BodyweightEntry[]
): Promise<void> {
  const localSessions = await db.sessions.toArray();
  const localBw = await db.bodyweights.toArray();
  await db.sessions.bulkPut(reconcileById(localSessions, sessions));
  await db.bodyweights.bulkPut(reconcileById(localBw, bodyweights));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- repo`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Dexie local store and local-first repository"
```

---

## Task 7: Mongoose models + cached Atlas connection

**Files:**
- Create: `src/lib/db/mongoose.ts`, `src/lib/models/session.model.ts`, `src/lib/models/bodyweight.model.ts`
- Test: `src/lib/models/session.model.test.ts`

**Interfaces:**
- Produces: `connectMongo(): Promise<typeof mongoose>`, `SessionModel`, `BodyweightModel`.
- Note: models must be defined idempotently (`mongoose.models.X ?? mongoose.model(...)`) to survive Next hot-reload.

- [ ] **Step 1: Write the failing test** (schema shape only — no live DB)

`src/lib/models/session.model.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { SessionModel } from "./session.model";

describe("SessionModel", () => {
  it("defines the expected top-level paths", () => {
    const paths = Object.keys(SessionModel.schema.paths);
    expect(paths).toContain("id");
    expect(paths).toContain("date");
    expect(paths).toContain("dayKey");
    expect(paths).toContain("updatedAt");
    expect(paths).toContain("exercises");
  });

  it("uses id as the document _id shadow (unique)", () => {
    expect(SessionModel.schema.path("id").options.unique).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- session.model`
Expected: FAIL — cannot resolve `./session.model`.

- [ ] **Step 3: Implement `src/lib/db/mongoose.ts`**

```ts
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

let cached = (global as any)._mongoose as
  | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
  | undefined;

if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null };

export async function connectMongo(): Promise<typeof mongoose> {
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, { dbName: "gym" });
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
```

- [ ] **Step 4: Implement models**

`src/lib/models/session.model.ts`:
```ts
import mongoose, { Schema } from "mongoose";

const SetSchema = new Schema(
  { weight: Number, reps: Number, done: Boolean },
  { _id: false }
);
const ExerciseSchema = new Schema(
  {
    name: String,
    targetSets: Number,
    repRange: String,
    skipped: Boolean,
    note: String,
    sets: [SetSchema],
  },
  { _id: false }
);
const SessionSchema = new Schema({
  id: { type: String, unique: true, required: true },
  date: String,
  dayKey: String,
  title: String,
  exercises: [ExerciseSchema],
  cardioDone: Boolean,
  updatedAt: Number,
});

export const SessionModel =
  mongoose.models.Session ?? mongoose.model("Session", SessionSchema);
```

`src/lib/models/bodyweight.model.ts`:
```ts
import mongoose, { Schema } from "mongoose";

const BodyweightSchema = new Schema({
  id: { type: String, unique: true, required: true },
  date: String,
  weightKg: Number,
  updatedAt: Number,
});

export const BodyweightModel =
  mongoose.models.Bodyweight ?? mongoose.model("Bodyweight", BodyweightSchema);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- session.model`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Mongoose models and cached Atlas connection"
```

---

## Task 8: API route handlers (sessions + bodyweight)

**Files:**
- Create: `src/app/api/sessions/route.ts`, `src/app/api/bodyweight/route.ts`
- Test: `src/app/api/sessions/route.test.ts`

**Interfaces:**
- Consumes: `connectMongo`, `SessionModel`, `BodyweightModel`.
- Produces HTTP: `GET /api/sessions` → `Session[]`; `POST /api/sessions` (body: `Session`) → upsert by `id`, returns `{ ok: true }`. Same shape for `/api/bodyweight`.
- Handlers must `export const dynamic = "force-dynamic"` (DB-backed).

- [ ] **Step 1: Write the failing test** (mock the model + connection)

`src/app/api/sessions/route.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/mongoose", () => ({ connectMongo: vi.fn().mockResolvedValue({}) }));

const find = vi.fn();
const updateOne = vi.fn();
vi.mock("@/lib/models/session.model", () => ({
  SessionModel: {
    find: (...a: unknown[]) => find(...a),
    updateOne: (...a: unknown[]) => updateOne(...a),
  },
}));

import { GET, POST } from "./route";

describe("/api/sessions", () => {
  beforeEach(() => { find.mockReset(); updateOne.mockReset(); });

  it("GET returns all sessions as JSON", async () => {
    find.mockReturnValue({ lean: () => ({ exec: () => Promise.resolve([{ id: "s1" }]) }) });
    const res = await GET();
    expect(await res.json()).toEqual([{ id: "s1" }]);
  });

  it("POST upserts by id", async () => {
    updateOne.mockResolvedValue({});
    const req = new Request("http://x/api/sessions", {
      method: "POST",
      body: JSON.stringify({ id: "s1", updatedAt: 5 }),
    });
    const res = await POST(req);
    expect(await res.json()).toEqual({ ok: true });
    expect(updateOne).toHaveBeenCalledWith(
      { id: "s1" },
      expect.objectContaining({ id: "s1" }),
      { upsert: true }
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/sessions`
Expected: FAIL — cannot resolve `./route`.

- [ ] **Step 3: Implement `src/app/api/sessions/route.ts`**

```ts
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";
import { SessionModel } from "@/lib/models/session.model";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectMongo();
  const sessions = await SessionModel.find({}, { _id: 0, __v: 0 }).lean().exec();
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  await connectMongo();
  const body = await req.json();
  await SessionModel.updateOne({ id: body.id }, body, { upsert: true });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Implement `src/app/api/bodyweight/route.ts`**

```ts
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";
import { BodyweightModel } from "@/lib/models/bodyweight.model";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectMongo();
  const rows = await BodyweightModel.find({}, { _id: 0, __v: 0 }).lean().exec();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await connectMongo();
  const body = await req.json();
  await BodyweightModel.updateOne({ id: body.id }, body, { upsert: true });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- api/sessions`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add sessions and bodyweight API route handlers"
```

---

## Task 9: Sync engine (flush queue + pull/reconcile)

**Files:**
- Create: `src/lib/db/sync.ts`
- Test: `src/lib/db/sync.test.ts`

**Interfaces:**
- Consumes: repo (`getPendingMutations`, `clearMutation`, `mergeRemote`).
- Produces:
  - `flushMutations(fetchFn?: typeof fetch): Promise<number>` — POSTs each pending mutation to its endpoint, clears on success, returns count flushed.
  - `pullRemote(fetchFn?: typeof fetch): Promise<void>` — GETs both endpoints, calls `mergeRemote`.
  - `sync(fetchFn?: typeof fetch): Promise<void>` — `flushMutations` then `pullRemote`.

- [ ] **Step 1: Write the failing test**

`src/lib/db/sync.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "./dexie";
import { saveSession } from "./repo";
import { flushMutations, pullRemote } from "./sync";
import type { Session } from "@/lib/types";

const session = (id: string): Session => ({
  id, date: "2026-07-15", dayKey: "pushA", title: "Push A",
  cardioDone: false, updatedAt: 1, exercises: [],
});

describe("sync", () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.bodyweights.clear();
    await db.mutations.clear();
  });

  it("flushMutations POSTs each pending mutation and clears the queue", async () => {
    await saveSession(session("s1"));
    const fetchFn = vi.fn().mockResolvedValue({ ok: true });
    const count = await flushMutations(fetchFn as unknown as typeof fetch);
    expect(count).toBe(1);
    expect(fetchFn).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({ method: "POST" })
    );
    expect(await db.mutations.count()).toBe(0);
  });

  it("keeps the mutation queued when the POST fails", async () => {
    await saveSession(session("s1"));
    const fetchFn = vi.fn().mockResolvedValue({ ok: false });
    await flushMutations(fetchFn as unknown as typeof fetch);
    expect(await db.mutations.count()).toBe(1);
  });

  it("pullRemote merges fetched rows into local", async () => {
    const fetchFn = vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(url === "/api/sessions" ? [session("r1")] : []),
      })
    );
    await pullRemote(fetchFn as unknown as typeof fetch);
    expect(await db.sessions.count()).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- db/sync`
Expected: FAIL — cannot resolve `./sync`.

- [ ] **Step 3: Implement `src/lib/db/sync.ts`**

```ts
import { getPendingMutations, clearMutation, mergeRemote } from "./repo";
import type { Session, BodyweightEntry } from "@/lib/types";

const ENDPOINT = { session: "/api/sessions", bodyweight: "/api/bodyweight" } as const;

export async function flushMutations(fetchFn: typeof fetch = fetch): Promise<number> {
  const pending = await getPendingMutations();
  let flushed = 0;
  for (const m of pending) {
    const res = await fetchFn(ENDPOINT[m.entity], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(m.payload),
    });
    if (res.ok && m.id != null) {
      await clearMutation(m.id);
      flushed++;
    }
  }
  return flushed;
}

export async function pullRemote(fetchFn: typeof fetch = fetch): Promise<void> {
  const [sRes, bRes] = await Promise.all([
    fetchFn(ENDPOINT.session),
    fetchFn(ENDPOINT.bodyweight),
  ]);
  const sessions = (sRes.ok ? await sRes.json() : []) as Session[];
  const bodyweights = (bRes.ok ? await bRes.json() : []) as BodyweightEntry[];
  await mergeRemote(sessions, bodyweights);
}

export async function sync(fetchFn: typeof fetch = fetch): Promise<void> {
  await flushMutations(fetchFn);
  await pullRemote(fetchFn);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- db/sync`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add sync engine (flush queue + pull/reconcile)"
```

---

## Task 10: App shell — dark theme, bottom nav, PWA manifest + service worker

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `src/components/BottomNav.tsx`, `src/app/sw.ts`, `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`
- Test: `src/components/BottomNav.test.tsx`

**Interfaces:**
- Produces: `<BottomNav />` client component with links Today `/`, History `/history`, Progress `/progress`, Diet `/diet`, highlighting the active route via `usePathname()`.

- [ ] **Step 1: Write the failing test**

`src/components/BottomNav.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "./BottomNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("BottomNav", () => {
  it("renders all four destinations", () => {
    render(<BottomNav />);
    for (const label of ["Today", "History", "Progress", "Diet"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("marks the active route with aria-current", () => {
    render(<BottomNav />);
    expect(screen.getByText("Today").closest("a"))
      .toHaveAttribute("aria-current", "page");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- BottomNav`
Expected: FAIL — cannot resolve `./BottomNav`.

- [ ] **Step 3: Implement `src/components/BottomNav.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Today" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Progress" },
  { href: "/diet", label: "Diet" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-line bg-surface/95 backdrop-blur grid grid-cols-4">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`py-3 text-center text-xs font-medium ${
              active ? "text-accent" : "text-muted"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Update `src/app/layout.tsx`** to mount nav + PWA meta

```tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Wayne",
  description: "Gym tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Wayne" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-white">
        <div className="mx-auto max-w-md pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Create `public/manifest.webmanifest`**

```json
{
  "name": "Wayne — Gym Tracker",
  "short_name": "Wayne",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0b",
  "theme_color": "#0a0a0b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 6: Create `src/app/sw.ts`** (Serwist service worker)

```ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: any };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

- [ ] **Step 7: Generate placeholder icons**

Run:
```bash
mkdir -p public/icons
# 1x1 lime PNGs as placeholders; replace with real icons later.
node -e "const fs=require('fs');const b=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');fs.writeFileSync('public/icons/icon-192.png',b);fs.writeFileSync('public/icons/icon-512.png',b);"
```
Expected: two PNG files exist under `public/icons/`.

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- BottomNav`
Expected: PASS (2 tests).

- [ ] **Step 9: Verify build compiles**

Run: `npm run build`
Expected: build succeeds (service worker generated to `public/sw.js`).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: app shell with dark theme, bottom nav, and PWA setup"
```

---

## Task 11: Today screen

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/SessionCard.tsx`, `src/lib/useToday.ts`
- Test: `src/components/SessionCard.test.tsx`

**Interfaces:**
- Consumes: `getDayKeyForWeekday`, `getTemplate`, `DIET`, repo (`saveSession`, `getSessions`, `saveBodyweight`), `sync`.
- Produces: `<SessionCard template={DayTemplate} onOpen={() => void} />`; `useToday()` hook returning `{ dayKey, template, todayIso }`.

- [ ] **Step 1: Write the failing test**

`src/components/SessionCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionCard } from "./SessionCard";
import { getTemplate } from "@/lib/data/templates";

describe("SessionCard", () => {
  it("shows the session title and exercise count", () => {
    render(<SessionCard template={getTemplate("pushA")} onOpen={() => {}} />);
    expect(screen.getByText(/Push A/)).toBeInTheDocument();
    expect(screen.getByText(/7 exercises/)).toBeInTheDocument();
  });

  it("calls onOpen when tapped", () => {
    const onOpen = vi.fn();
    render(<SessionCard template={getTemplate("legs")} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- SessionCard`
Expected: FAIL — cannot resolve `./SessionCard`.

- [ ] **Step 3: Implement `src/components/SessionCard.tsx`**

```tsx
import type { DayTemplate } from "@/lib/types";

export function SessionCard({
  template,
  onOpen,
}: {
  template: DayTemplate;
  onOpen: () => void;
}) {
  const count = template.exercises.length;
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl bg-surface border border-line p-5 active:scale-[0.99] transition"
    >
      <div className="text-xs uppercase tracking-widest text-muted">Today</div>
      <div className="mt-1 text-2xl font-semibold">{template.title}</div>
      <div className="mt-2 text-sm text-muted">
        {count > 0 ? `${count} exercises` : "No lifting today"}
        {template.cardio ? " · cardio" : ""}
      </div>
    </button>
  );
}
```

- [ ] **Step 4: Implement `src/lib/useToday.ts`**

```ts
"use client";
import { getDayKeyForWeekday } from "@/lib/logic/schedule";
import { getTemplate } from "@/lib/data/templates";

export function useToday() {
  const now = new Date();
  const dayKey = getDayKeyForWeekday(now.getDay());
  const todayIso = now.toISOString().slice(0, 10);
  return { dayKey, template: getTemplate(dayKey), todayIso };
}
```

- [ ] **Step 5: Implement `src/app/page.tsx`** (client home)

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToday } from "@/lib/useToday";
import { SessionCard } from "@/components/SessionCard";
import { DIET } from "@/lib/data/diet";
import { getSessions, saveSession, saveBodyweight } from "@/lib/db/repo";
import { sync } from "@/lib/db/sync";
import { getTemplate } from "@/lib/data/templates";
import type { Session } from "@/lib/types";

function uuid() {
  return crypto.randomUUID();
}

export default function Home() {
  const router = useRouter();
  const { dayKey, template, todayIso } = useToday();
  const [weight, setWeight] = useState("");

  useEffect(() => {
    sync().catch(() => {});
  }, []);

  async function openSession() {
    const existing = (await getSessions()).find(
      (s) => s.date === todayIso && s.dayKey === dayKey
    );
    if (existing) return router.push(`/session/${existing.id}`);

    const t = getTemplate(dayKey);
    const session: Session = {
      id: uuid(),
      date: todayIso,
      dayKey,
      title: t.title,
      cardioDone: false,
      updatedAt: Date.now(),
      exercises: t.exercises.map((e) => ({
        name: e.name,
        targetSets: e.targetSets,
        repRange: e.repRange,
        note: e.note,
        skipped: false,
        sets: [],
      })),
    };
    await saveSession(session);
    router.push(`/session/${session.id}`);
  }

  async function logWeight() {
    const kg = parseFloat(weight);
    if (!Number.isFinite(kg)) return;
    await saveBodyweight({ id: uuid(), date: todayIso, weightKg: kg, updatedAt: Date.now() });
    setWeight("");
    sync().catch(() => {});
  }

  const isTrainingDay = dayKey !== "rest";
  const diet = isTrainingDay ? DIET.training : DIET.rest;

  return (
    <main className="p-5 space-y-4">
      <header className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight">Wayne</h1>
        <p className="text-muted text-sm">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </p>
      </header>

      <SessionCard template={template} onOpen={openSession} />

      <section className="rounded-2xl bg-surface border border-line p-5">
        <div className="text-xs uppercase tracking-widest text-muted">Fasted weight</div>
        <div className="mt-2 flex gap-2">
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
            className="flex-1 rounded-xl bg-surface2 border border-line px-4 py-3 text-lg"
          />
          <button onClick={logWeight} className="rounded-xl bg-accent text-ink font-semibold px-5">
            Log
          </button>
        </div>
      </section>

      <button
        onClick={() => router.push("/diet")}
        className="w-full text-left rounded-2xl bg-surface border border-line p-5"
      >
        <div className="text-xs uppercase tracking-widest text-muted">{diet.label}</div>
        <div className="mt-1 text-lg font-semibold">{diet.calories} · {diet.protein}</div>
        <div className="mt-1 text-sm text-muted">Tap for full diet plan</div>
      </button>
    </main>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- SessionCard`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Today screen with session card, weight logging, diet summary"
```

---

## Task 12: Session screen — set logging, last-time inline, skip/add

**Files:**
- Create: `src/app/session/[id]/page.tsx`, `src/components/ExerciseCard.tsx`, `src/components/SetRow.tsx`
- Test: `src/components/ExerciseCard.test.tsx`

**Interfaces:**
- Consumes: repo (`getSessions`, `saveSession`), `findLastTime`.
- Produces:
  - `<SetRow set={SetEntry} lastTime={SetEntry | undefined} onChange={(s: SetEntry) => void} />`.
  - `<ExerciseCard exercise={SessionExercise} lastTimeSets={SetEntry[] | null} onChange={(e: SessionExercise) => void} />`.

- [ ] **Step 1: Write the failing test**

`src/components/ExerciseCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExerciseCard } from "./ExerciseCard";
import type { SessionExercise } from "@/lib/types";

const exercise: SessionExercise = {
  name: "Barbell Bench Press",
  targetSets: 4,
  repRange: "6–8",
  skipped: false,
  sets: [{ weight: 60, reps: 8, done: false }],
};

describe("ExerciseCard", () => {
  it("shows the last-time summary when provided", () => {
    render(
      <ExerciseCard
        exercise={exercise}
        lastTimeSets={[{ weight: 62.5, reps: 8, done: true }]}
        onChange={() => {}}
      />
    );
    expect(screen.getByText(/Last time/)).toBeInTheDocument();
    expect(screen.getByText(/62.5/)).toBeInTheDocument();
  });

  it("adds a set when 'Add set' is tapped", () => {
    const onChange = vi.fn();
    render(<ExerciseCard exercise={exercise} lastTimeSets={null} onChange={onChange} />);
    fireEvent.click(screen.getByText(/Add set/));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sets: expect.arrayContaining([expect.any(Object)]) })
    );
    const updated = onChange.mock.calls[0][0] as SessionExercise;
    expect(updated.sets).toHaveLength(2);
  });

  it("toggles skipped", () => {
    const onChange = vi.fn();
    render(<ExerciseCard exercise={exercise} lastTimeSets={null} onChange={onChange} />);
    fireEvent.click(screen.getByText(/Skip/));
    expect((onChange.mock.calls[0][0] as SessionExercise).skipped).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ExerciseCard`
Expected: FAIL — cannot resolve `./ExerciseCard`.

- [ ] **Step 3: Implement `src/components/SetRow.tsx`**

```tsx
import type { SetEntry } from "@/lib/types";

export function SetRow({
  index,
  set,
  lastTime,
  onChange,
}: {
  index: number;
  set: SetEntry;
  lastTime?: SetEntry;
  onChange: (s: SetEntry) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-6 text-sm text-muted">{index + 1}</span>
      <input
        inputMode="decimal"
        value={set.weight || ""}
        onChange={(e) => onChange({ ...set, weight: parseFloat(e.target.value) || 0 })}
        placeholder={lastTime ? String(lastTime.weight) : "kg"}
        className="w-20 rounded-lg bg-surface2 border border-line px-3 py-2 text-center"
      />
      <span className="text-muted">×</span>
      <input
        inputMode="numeric"
        value={set.reps || ""}
        onChange={(e) => onChange({ ...set, reps: parseInt(e.target.value) || 0 })}
        placeholder={lastTime ? String(lastTime.reps) : "reps"}
        className="w-20 rounded-lg bg-surface2 border border-line px-3 py-2 text-center"
      />
      <button
        onClick={() => onChange({ ...set, done: !set.done })}
        className={`ml-auto rounded-lg px-3 py-2 text-sm font-semibold ${
          set.done ? "bg-accent text-ink" : "bg-surface2 text-muted border border-line"
        }`}
      >
        ✓
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/components/ExerciseCard.tsx`**

```tsx
import type { SessionExercise, SetEntry } from "@/lib/types";
import { SetRow } from "./SetRow";

export function ExerciseCard({
  exercise,
  lastTimeSets,
  onChange,
}: {
  exercise: SessionExercise;
  lastTimeSets: SetEntry[] | null;
  onChange: (e: SessionExercise) => void;
}) {
  function updateSet(i: number, set: SetEntry) {
    const sets = exercise.sets.map((s, idx) => (idx === i ? set : s));
    onChange({ ...exercise, sets });
  }
  function addSet() {
    const last = lastTimeSets?.[exercise.sets.length];
    onChange({
      ...exercise,
      sets: [...exercise.sets, { weight: last?.weight ?? 0, reps: 0, done: false }],
    });
  }

  return (
    <div className={`rounded-2xl bg-surface border border-line p-4 ${exercise.skipped ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{exercise.name}</div>
          <div className="text-xs text-muted">
            {exercise.targetSets} × {exercise.repRange}
          </div>
        </div>
        <button
          onClick={() => onChange({ ...exercise, skipped: !exercise.skipped })}
          className="text-xs text-muted border border-line rounded-lg px-2 py-1"
        >
          {exercise.skipped ? "Undo" : "Skip"}
        </button>
      </div>

      {lastTimeSets && lastTimeSets.length > 0 && (
        <div className="mt-2 text-xs text-accent/90">
          Last time: {lastTimeSets.map((s) => `${s.weight}×${s.reps}`).join("  ")}
        </div>
      )}

      {!exercise.skipped && (
        <div className="mt-3">
          {exercise.sets.map((s, i) => (
            <SetRow
              key={i}
              index={i}
              set={s}
              lastTime={lastTimeSets?.[i]}
              onChange={(ns) => updateSet(i, ns)}
            />
          ))}
          <button onClick={addSet} className="mt-2 text-sm text-accent font-medium">
            + Add set
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/app/session/[id]/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessions, saveSession } from "@/lib/db/repo";
import { sync } from "@/lib/db/sync";
import { findLastTime } from "@/lib/logic/lastTime";
import { ExerciseCard } from "@/components/ExerciseCard";
import type { Session, SessionExercise } from "@/lib/types";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [all, setAll] = useState<Session[]>([]);

  useEffect(() => {
    getSessions().then((sessions) => {
      setAll(sessions);
      setSession(sessions.find((s) => s.id === id) ?? null);
    });
  }, [id]);

  async function persist(next: Session) {
    const stamped = { ...next, updatedAt: Date.now() };
    setSession(stamped);
    await saveSession(stamped);
    sync().catch(() => {});
  }

  function updateExercise(i: number, ex: SessionExercise) {
    if (!session) return;
    const exercises = session.exercises.map((e, idx) => (idx === i ? ex : e));
    persist({ ...session, exercises });
  }

  function addExercise() {
    if (!session) return;
    const name = prompt("Exercise name");
    if (!name) return;
    persist({
      ...session,
      exercises: [
        ...session.exercises,
        { name, targetSets: 3, repRange: "—", skipped: false, sets: [] },
      ],
    });
  }

  if (!session) return <main className="p-5">Loading…</main>;

  return (
    <main className="p-5 space-y-3">
      <button onClick={() => router.push("/")} className="text-muted text-sm">← Today</button>
      <h1 className="text-2xl font-bold">{session.title}</h1>

      {session.exercises.map((ex, i) => (
        <ExerciseCard
          key={i}
          exercise={ex}
          lastTimeSets={findLastTime(all, ex.name, session.date)}
          onChange={(e) => updateExercise(i, e)}
        />
      ))}

      <button onClick={addExercise} className="w-full rounded-2xl border border-dashed border-line py-3 text-muted">
        + Add exercise
      </button>

      <label className="flex items-center gap-3 rounded-2xl bg-surface border border-line p-4">
        <input
          type="checkbox"
          checked={session.cardioDone}
          onChange={(e) => persist({ ...session, cardioDone: e.target.checked })}
          className="h-5 w-5 accent-accent"
        />
        <span>Cardio done</span>
      </label>
    </main>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- ExerciseCard`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Session screen with set logging, last-time inline, skip/add"
```

---

## Task 13: History screen

**Files:**
- Create: `src/app/history/page.tsx`
- Test: `src/app/history/history.test.tsx`

**Interfaces:**
- Consumes: repo (`getSessions`).
- Produces: a `<HistoryList sessions={Session[]} />` component (exported from the page module) that renders sessions newest-first with a per-session set count.

- [ ] **Step 1: Write the failing test**

`src/app/history/history.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HistoryList } from "./page";
import type { Session } from "@/lib/types";

const s = (id: string, date: string): Session => ({
  id, date, dayKey: "pushA", title: "Push A", cardioDone: false, updatedAt: 0,
  exercises: [{ name: "Bench", targetSets: 1, repRange: "6–8", skipped: false,
    sets: [{ weight: 60, reps: 8, done: true }] }],
});

describe("HistoryList", () => {
  it("renders sessions newest-first", () => {
    render(<HistoryList sessions={[s("a", "2026-07-01"), s("b", "2026-07-08")]} />);
    const items = screen.getAllByText(/Push A/);
    expect(items).toHaveLength(2);
    // newest date should appear before the older one in the DOM
    const dates = screen.getAllByText(/2026-07/).map((n) => n.textContent);
    expect(dates[0]).toContain("2026-07-08");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- history`
Expected: FAIL — cannot resolve `./page`.

- [ ] **Step 3: Implement `src/app/history/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessions } from "@/lib/db/repo";
import type { Session } from "@/lib/types";

export function HistoryList({ sessions }: { sessions: Session[] }) {
  const ordered = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <ul className="space-y-2">
      {ordered.map((s) => {
        const setCount = s.exercises.reduce((n, e) => n + e.sets.length, 0);
        return (
          <li key={s.id}>
            <Link
              href={`/session/${s.id}`}
              className="block rounded-2xl bg-surface border border-line p-4"
            >
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm text-muted">{s.date} · {setCount} sets</div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  useEffect(() => { getSessions().then(setSessions); }, []);
  return (
    <main className="p-5 space-y-3">
      <h1 className="text-2xl font-bold">History</h1>
      {sessions.length === 0 ? (
        <p className="text-muted">No sessions logged yet.</p>
      ) : (
        <HistoryList sessions={sessions} />
      )}
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- history`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: History screen"
```

---

## Task 14: Progress screen (charts)

**Files:**
- Create: `src/app/progress/page.tsx`, `src/components/BodyweightChart.tsx`, `src/components/WeightChart.tsx`, `src/lib/logic/exerciseSeries.ts`
- Test: `src/lib/logic/exerciseSeries.test.ts`

**Interfaces:**
- Consumes: repo (`getSessions`, `getBodyweights`), `rollingAverage7`, Recharts.
- Produces:
  - `exerciseTopSetSeries(sessions: Session[], exerciseName: string): { date: string; topWeight: number }[]` — max weight per session date for an exercise, chronological.
  - `<BodyweightChart data={BodyweightEntry[]} />`, `<WeightChart series={{date,topWeight}[]} />` (Recharts wrappers).

- [ ] **Step 1: Write the failing test**

`src/lib/logic/exerciseSeries.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { exerciseTopSetSeries } from "./exerciseSeries";
import type { Session } from "@/lib/types";

const mk = (date: string, weights: number[]): Session => ({
  id: date, date, dayKey: "pushA", title: "Push A", cardioDone: false, updatedAt: 0,
  exercises: [{ name: "Bench", targetSets: weights.length, repRange: "6–8", skipped: false,
    sets: weights.map((w) => ({ weight: w, reps: 8, done: true })) }],
});

describe("exerciseTopSetSeries", () => {
  it("returns the max weight per date, chronological", () => {
    const out = exerciseTopSetSeries(
      [mk("2026-07-08", [60, 62.5]), mk("2026-07-01", [57.5, 60])],
      "Bench"
    );
    expect(out).toEqual([
      { date: "2026-07-01", topWeight: 60 },
      { date: "2026-07-08", topWeight: 62.5 },
    ]);
  });

  it("skips sessions without the exercise", () => {
    expect(exerciseTopSetSeries([mk("2026-07-01", [60])], "Squat")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- exerciseSeries`
Expected: FAIL — cannot resolve `./exerciseSeries`.

- [ ] **Step 3: Implement `src/lib/logic/exerciseSeries.ts`**

```ts
import type { Session } from "@/lib/types";

export function exerciseTopSetSeries(
  sessions: Session[],
  exerciseName: string
): { date: string; topWeight: number }[] {
  return [...sessions]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .flatMap((s) => {
      const ex = s.exercises.find((e) => e.name === exerciseName && !e.skipped);
      if (!ex || ex.sets.length === 0) return [];
      const topWeight = Math.max(...ex.sets.map((set) => set.weight));
      return [{ date: s.date, topWeight }];
    });
}
```

- [ ] **Step 4: Implement `src/components/BodyweightChart.tsx`**

```tsx
"use client";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";
import { rollingAverage7 } from "@/lib/logic/rollingAverage";
import type { BodyweightEntry } from "@/lib/types";

export function BodyweightChart({ data }: { data: BodyweightEntry[] }) {
  const series = rollingAverage7(data);
  if (series.length === 0) return <p className="text-muted">No weigh-ins yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8a8a92" }} hide />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#8a8a92" }} />
        <Tooltip contentStyle={{ background: "#1d1d20", border: "1px solid #2a2a2e" }} />
        <ReferenceLine y={70} stroke="#8a8a92" strokeDasharray="4 4" label={{ value: "goal 70", fill: "#8a8a92", fontSize: 10 }} />
        <Line type="monotone" dataKey="weight" stroke="#3a3a40" dot={false} />
        <Line type="monotone" dataKey="avg" stroke="#c6ff3f" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 5: Implement `src/components/WeightChart.tsx`**

```tsx
"use client";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";

export function WeightChart({ series }: { series: { date: string; topWeight: number }[] }) {
  if (series.length === 0) return <p className="text-muted">No data for this lift yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8a8a92" }} hide />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#8a8a92" }} />
        <Tooltip contentStyle={{ background: "#1d1d20", border: "1px solid #2a2a2e" }} />
        <Line type="monotone" dataKey="topWeight" stroke="#c6ff3f" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 6: Implement `src/app/progress/page.tsx`**

```tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { getSessions, getBodyweights } from "@/lib/db/repo";
import { BodyweightChart } from "@/components/BodyweightChart";
import { WeightChart } from "@/components/WeightChart";
import { exerciseTopSetSeries } from "@/lib/logic/exerciseSeries";
import type { Session, BodyweightEntry } from "@/lib/types";

export default function ProgressPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bw, setBw] = useState<BodyweightEntry[]>([]);
  const [exercise, setExercise] = useState<string>("");

  useEffect(() => {
    getSessions().then(setSessions);
    getBodyweights().then(setBw);
  }, []);

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((s) => s.exercises.forEach((e) => names.add(e.name)));
    return [...names].sort();
  }, [sessions]);

  const selected = exercise || exerciseNames[0] || "";
  const series = exerciseTopSetSeries(sessions, selected);

  return (
    <main className="p-5 space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      <section className="space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-muted">Bodyweight · 7-day avg</h2>
        <BodyweightChart data={bw} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-muted">Lift progression</h2>
        <select
          value={selected}
          onChange={(e) => setExercise(e.target.value)}
          className="w-full rounded-xl bg-surface2 border border-line px-3 py-2"
        >
          {exerciseNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <WeightChart series={series} />
      </section>
    </main>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- exerciseSeries`
Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Progress screen with bodyweight and lift charts"
```

---

## Task 15: Diet screen

**Files:**
- Create: `src/app/diet/page.tsx`
- Test: `src/app/diet/diet.test.tsx`

**Interfaces:**
- Consumes: `DIET`.
- Produces: `<DietTables />` (exported from page module) rendering training + rest tables and the rules list.

- [ ] **Step 1: Write the failing test**

`src/app/diet/diet.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DietTables } from "./page";

describe("DietTables", () => {
  it("renders both day types and at least one rule", () => {
    render(<DietTables />);
    expect(screen.getByText(/Training \/ Run Days/)).toBeInTheDocument();
    expect(screen.getByText(/Rest Days/)).toBeInTheDocument();
    expect(screen.getByText(/Lift heavy/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- diet`
Expected: FAIL — cannot resolve `./page`.

- [ ] **Step 3: Implement `src/app/diet/page.tsx`**

```tsx
import { DIET, type DietDay } from "@/lib/data/diet";

function DayBlock({ day }: { day: DietDay }) {
  return (
    <section className="rounded-2xl bg-surface border border-line p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">{day.label}</h2>
        <span className="text-sm text-accent">{day.calories} · {day.protein}</span>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {day.meals.map((m) => (
          <li key={m.meal} className="py-2">
            <div className="text-xs uppercase tracking-wide text-muted">{m.meal}</div>
            <div className="text-sm">{m.food}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DietTables() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{DIET.context}</p>
      <DayBlock day={DIET.training} />
      <DayBlock day={DIET.rest} />
      <section className="rounded-2xl bg-surface border border-line p-4">
        <h2 className="font-semibold">Key rules</h2>
        <ol className="mt-2 list-decimal pl-5 space-y-1 text-sm text-muted">
          {DIET.rules.map((r, i) => <li key={i}>{r}</li>)}
        </ol>
      </section>
    </div>
  );
}

export default function DietPage() {
  return (
    <main className="p-5 space-y-4">
      <h1 className="text-2xl font-bold">Diet</h1>
      <DietTables />
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- diet`
Expected: PASS (1 test).

- [ ] **Step 5: Full verification**

Run: `npm test`
Expected: all suites PASS.

Run: `npm run build`
Expected: production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Diet screen"
```

---

## Task 16: Wire up online/offline sync trigger + docs

**Files:**
- Create: `src/lib/useSync.ts`, `README.md`
- Modify: `src/app/layout.tsx` (mount a client sync trigger)
- Create: `src/components/SyncTrigger.tsx`
- Test: `src/lib/useSync.test.tsx`

**Interfaces:**
- Produces: `<SyncTrigger />` — a client component that calls `sync()` on mount and on the browser `online` event; renders nothing.

- [ ] **Step 1: Write the failing test**

`src/lib/useSync.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const sync = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/db/sync", () => ({ sync: () => sync() }));

import { SyncTrigger } from "@/components/SyncTrigger";

describe("SyncTrigger", () => {
  beforeEach(() => sync.mockClear());

  it("syncs on mount", () => {
    render(<SyncTrigger />);
    expect(sync).toHaveBeenCalledTimes(1);
  });

  it("syncs again when the browser comes online", () => {
    render(<SyncTrigger />);
    window.dispatchEvent(new Event("online"));
    expect(sync).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useSync`
Expected: FAIL — cannot resolve `@/components/SyncTrigger`.

- [ ] **Step 3: Implement `src/components/SyncTrigger.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { sync } from "@/lib/db/sync";

export function SyncTrigger() {
  useEffect(() => {
    sync().catch(() => {});
    const handler = () => sync().catch(() => {});
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, []);
  return null;
}
```

- [ ] **Step 4: Mount it in `src/app/layout.tsx`**

Add the import and render `<SyncTrigger />` just inside `<body>`:
```tsx
import { SyncTrigger } from "@/components/SyncTrigger";
// ...
      <body className="min-h-screen bg-ink text-white">
        <SyncTrigger />
        <div className="mx-auto max-w-md pb-20">{children}</div>
        <BottomNav />
      </body>
```

- [ ] **Step 5: Write `README.md`**

````markdown
# Wayne — Gym Tracker

Offline-first PWA for Harsh's body-recomposition program.

## Setup

```bash
npm install
cp .env.example .env.local   # then set MONGODB_URI
npm run dev
```

## Test / build

```bash
npm test
npm run build
```

## Deploy (Vercel)

Set `MONGODB_URI` in Vercel project env vars, then deploy. The service worker
is generated at build time; installability works from the deployed URL.
````

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- useSync`
Expected: PASS (2 tests).

- [ ] **Step 7: Final full verification**

Run: `npm test`
Expected: all suites PASS.

Run: `npm run build`
Expected: production build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: online/offline sync trigger and project README"
```

---

## Self-Review Notes (coverage against spec)

- Workout logging + last-time inline → Tasks 3, 12.
- Auto-select today's session + manual template → Tasks 1, 11.
- Non-brittle plan (skip/swap/add today-only, template untouched) → Tasks 2, 11, 12.
- Bodyweight trend + 7-day average + target line → Tasks 4, 11, 14.
- Diet view (training/rest + rules) → Tasks 2, 15.
- Offline-first (Dexie + queue + sync + reconcile) → Tasks 5, 6, 9, 16.
- MongoDB Atlas via route handlers → Tasks 7, 8.
- PWA installable/offline shell, dark theme, bottom nav → Task 10.
- Env secrecy (`MONGODB_URI`, `.env.example`) → Tasks 1, 7, 16.

Notes: "swap exercise" is delivered as skip + add (Task 12) rather than a dedicated
swap control — a deliberate simplification that covers the same need. Real app icons
are placeholders (Task 10) to be replaced before store-quality install.
