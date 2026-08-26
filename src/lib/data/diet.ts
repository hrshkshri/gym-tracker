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
    "Recalculated at 76kg, then rebuilt around micronutrients: seeds daily (pumpkin + flax in the shake, sunflower with chai), rajma/chana at lunch for fiber and iron, raw capsicum + lemon at dinner for vitamin C to unlock the plant iron. Chicken holds at 275g on both day types. Note the seeds and rajma push both days ~220–290 kcal above the previous cut — the deficit is shallower on purpose. Supplement: Avvatar 100% Performance Whey, Cold Coffee — 1 scoop daily (27.5g protein, ~135 kcal).",
  training: {
    label: "Training Days",
    calories: "~2,420 kcal",
    protein: "~193g",
    meals: [
      { meal: "Pre-workout", food: "1 bread" },
      { meal: "Breakfast", food: "4-egg omelette + 2 bread + 1 cheese slice" },
      { meal: "Mid-morning shake", food: "1 banana + 30g oats + 300ml milk + 1 scoop whey + 15g pumpkin seeds + 10g ground flaxseed" },
      { meal: "Chai", food: "1hr after breakfast — with 15g sunflower seeds" },
      { meal: "Lunch", food: "1 bread + 100g cooked rajma/chana (3–4×/week)" },
      { meal: "Snack", food: "Chai only" },
      { meal: "Dinner", food: "100g cooked rice + 275g cooked chicken + 50g raw capsicum + ½ lemon" },
      { meal: "Daily", food: "1 apple + fiber source at dinner" },
    ],
  },
  rest: {
    label: "Rest Days (Thu + Sun)",
    calories: "~2,040 kcal",
    protein: "~175g",
    meals: [
      { meal: "Breakfast", food: "2-egg omelette + 2 bread + 1 cheese slice" },
      { meal: "Mid-morning shake", food: "20g oats + 300ml milk + 1 scoop whey (no banana) + 15g pumpkin seeds + 10g ground flaxseed" },
      { meal: "Chai", food: "1hr after breakfast — with 15g sunflower seeds" },
      { meal: "Lunch", food: "1 bread + 100g cooked rajma/chana" },
      { meal: "Snack", food: "Chai only" },
      { meal: "Dinner", food: "100g cooked rice + 275g cooked chicken + 50g raw capsicum + ½ lemon" },
      { meal: "Daily", food: "1 apple + fiber source at dinner" },
    ],
  },
  rules: [
    "Run this diet unchanged for 2 weeks; judge the 7-day scale average, then reassess. No mid-window edits.",
    "Lift heavy — do NOT lighten weights to 'tone'. Compound lifts protect muscle on the cut.",
    "Progressive overload every week on squat, bench, OHP, deadlift, rows, pull-ups.",
    "Pull-up assist: drop by 2.5–5kg every 2–3 weeks as reps allow.",
    "Scale target: ~0.4kg/week average. If dropping >0.5kg/week, add 100–150 kcal back. If stalled 2+ weeks, trim again (oats next).",
    "Weekly checks: fasted weight daily (7-day average), waist at navel once/week, main lift numbers.",
    "Next dietary recalculation at 74kg, then every 2kg.",
    "Post-binge or off-plan days: return to this plan immediately — no extra restriction, no added cardio.",
    "All food weights are cooked weights. 100g cooked rice ≈ 33g raw; 275g cooked chicken ≈ 350–365g raw.",
    "Carbs near training are fuel, carbs far from training are the budget — cuts come from dinner first, never the morning shake.",
  ],
};
