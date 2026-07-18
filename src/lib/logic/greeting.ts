// A personal, dynamic greeting for the home header. It reacts to the time of
// day and rotates through a pool of lines tied to the weekly training split, so
// it isn't the same static string every time the app opens.

export interface Greeting {
  hey: string;
  line: string;
}

// Time-of-day salutation.
function salutation(hour: number, name: string): string {
  if (hour < 5) return `Still up, ${name}?`;
  if (hour < 12) return `Morning, ${name}`;
  if (hour < 17) return `Afternoon, ${name}`;
  if (hour < 21) return `Evening, ${name}`;
  return `Night grind, ${name}`;
}

// Indexed by JS weekday: 0 = Sunday ... 6 = Saturday. Each day has a pool the
// header rotates through so repeat visits don't show the same line.
const LINES: Record<number, string[]> = {
  0: ["Rest up — you earned it. 🧘", "Recover today, dominate tomorrow. 🌙", "Rest is where you grow. 😴"],
  1: ["Leg day. Time to move mountains. 🦵", "Legs today — no skipping. 🏔️", "Build the foundation. 🦿"],
  2: ["Pull day. Own every rep. 💪", "Back and biceps — light 'em up. 🔥", "Pull hard, grow wide. 🦅"],
  3: ["Push day. Bring the fire. 🔥", "Chest, shoulders, triceps — press on. 💥", "Push past yesterday. 🚀"],
  4: ["Lace up — miles to chase. 🏃", "Run day. Find your pace. 👟", "Chase the horizon. 🏁"],
  5: ["Pull day. Finish the week strong. 💪", "One more pull — make it count. 🦾", "Back day, best day. 🔥"],
  6: ["Push day. Last one, best one. 🔥", "Close the week with fire. 💥", "Final push — leave nothing. 🚀"],
};

// `now` is injected so this stays pure and testable.
export function getGreeting(now: Date = new Date(), name = "Harsh"): Greeting {
  const weekday = now.getDay();
  const pool = LINES[weekday];
  if (!pool) throw new Error(`Invalid weekday: ${weekday}`);
  // Rotate roughly every 20 minutes so the line shifts through the day.
  const slot = now.getHours() * 3 + Math.floor(now.getMinutes() / 20);
  return { hey: salutation(now.getHours(), name), line: pool[slot % pool.length] };
}
