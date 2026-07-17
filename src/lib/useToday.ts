"use client";
import { getDayKeyForWeekday } from "@/lib/logic/schedule";
import { getTemplate } from "@/lib/data/templates";

export function localIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useToday() {
  const now = new Date();
  const dayKey = getDayKeyForWeekday(now.getDay());
  const todayIso = localIsoDate(now);
  return { dayKey, template: getTemplate(dayKey), todayIso };
}
