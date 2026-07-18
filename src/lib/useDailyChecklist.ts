"use client";
import { useEffect, useState } from "react";
import { localIsoDate } from "@/lib/useToday";

const PREFIX = "wayne.diet.";

// A set of checked item ids that lives under today's date key, so it resets
// automatically at midnight: a new day means a new (empty) key. Old days are
// pruned on load. Local-only — not synced across devices.
export function useDailyChecklist(dateIso: string = localIsoDate(new Date())) {
  const storageKey = PREFIX + dateIso;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setChecked(raw ? JSON.parse(raw) : {});
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX) && k !== storageKey) localStorage.removeItem(k);
      }
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep in-memory state */
      }
      return next;
    });
  }

  return { checked, toggle };
}
