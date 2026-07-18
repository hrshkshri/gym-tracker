// Per-exercise coaching metadata: the primary muscles worked and a short form
// cue. Keyed by the exact exercise name used in templates.ts. Lookups fall back
// to a version with any "(...)" or " — label" suffix stripped, so renamed or
// user-added variants still resolve when the base name matches.

export interface ExerciseMeta {
  muscles: string; // e.g. "Quads · Glutes · Core"
  cue: string;     // one short form reminder
}

const META: Record<string, ExerciseMeta> = {
  // Legs
  "Barbell Squat": { muscles: "Quads · Glutes · Core", cue: "Brace hard, sit between your heels, break parallel every rep." },
  "RDL": { muscles: "Hamstrings · Glutes", cue: "Hinge at the hips, soft knees, bar close — feel the stretch." },
  "Bulgarian Split Squat": { muscles: "Quads · Glutes", cue: "Weight through the front heel, torso tall, control the drop." },
  "Leg Extension": { muscles: "Quads", cue: "Pause and squeeze at the top, lower slow." },
  "Leg Curl": { muscles: "Hamstrings", cue: "Full range, no hip rocking — curl with the hamstrings." },
  "Calf Raises": { muscles: "Calves", cue: "Full stretch at the bottom, pause hard at the top." },
  "Decline Sit-ups": { muscles: "Upper Abs", cue: "Curl ribs toward hips, don't yank the neck." },

  // Pull
  "Assisted Pull Ups": { muscles: "Lats · Biceps", cue: "Lead with the elbows, chin over the bar, full hang each rep." },
  "Assisted Chin Ups": { muscles: "Lats · Biceps", cue: "Underhand grip, chest to bar, full stretch at the bottom." },
  "Barbell Row": { muscles: "Lats · Upper Back", cue: "Hinge ~45°, pull to the belly, squeeze the shoulder blades." },
  "Chest-Supported Machine Row": { muscles: "Mid Back · Lats", cue: "Drive the elbows back, pause, don't shrug." },
  "Lat Pulldown": { muscles: "Lats", cue: "Pull to the collarbone, chest up, control the return." },
  "Face Pulls": { muscles: "Rear Delts · Traps", cue: "Pull to the eyes, elbows high, squeeze the rear delts." },
  "DB Curl": { muscles: "Biceps", cue: "No swing — elbows pinned, full squeeze at the top." },
  "Hammer Curl": { muscles: "Biceps · Forearms", cue: "Neutral grip, controlled, zero momentum." },
  "Deadlift": { muscles: "Posterior Chain", cue: "Brace, push the floor away, bar close, hips and chest rise together." },
  "Single Arm DB Row": { muscles: "Lats · Upper Back", cue: "Flat back, pull to the hip, full stretch each rep." },
  "Cable Straight-Arm Pulldown": { muscles: "Lats", cue: "Arms straight, drive from the lats to your thighs." },
  "Reverse Fly": { muscles: "Rear Delts", cue: "Slight bend, squeeze the shoulder blades, no momentum." },
  "Incline DB Curl": { muscles: "Biceps", cue: "Full stretch on the incline, elbows back, slow negatives." },

  // Push
  "Barbell Bench Press": { muscles: "Chest · Triceps", cue: "Blades pinned, bar to lower chest, drive through the floor." },
  "Barbell Incline Press": { muscles: "Upper Chest · Shoulders", cue: "Bar to upper chest, elbows ~45°, controlled descent." },
  "Assisted Dips": { muscles: "Chest · Triceps", cue: "Lean forward for chest, full stretch, don't flare." },
  "Standing Barbell OHP": { muscles: "Shoulders · Triceps", cue: "Squeeze glutes, brace, press the bar over the crown of your head." },
  "Lateral Raise": { muscles: "Side Delts", cue: "Lead with the elbows, no swing, pinky slightly up." },
  "Triceps Pushdown": { muscles: "Triceps", cue: "Elbows pinned to your sides, full lockout, control back." },
  "Reverse Crunches": { muscles: "Lower Abs", cue: "Curl the pelvis up, control down — no leg swing." },
  "DB Flat Press": { muscles: "Chest · Triceps", cue: "Dumbbells stacked over the elbows, deep stretch, press together." },
  "DB Shoulder Press": { muscles: "Shoulders · Triceps", cue: "Press slightly in, don't clank, full lockout." },
  "Cable Flye": { muscles: "Chest", cue: "Fix a slight elbow bend, hug the reps, squeeze the center." },
  "Seated Lateral Raise": { muscles: "Side Delts", cue: "Strict — no torso english, lead with the elbows." },
  "Triceps Overhead Extension": { muscles: "Triceps", cue: "Elbows high and tucked, full stretch behind the head." },
  "Bicycle Crunches": { muscles: "Obliques", cue: "Opposite elbow to knee, slow — twist from the core." },
};

function baseName(name: string): string {
  // Strip "(...)" and " — label" / " - label" suffixes, collapse spaces.
  return name
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s*[—-]\s.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getExerciseMeta(name: string): ExerciseMeta | null {
  return META[name] ?? META[baseName(name)] ?? null;
}
