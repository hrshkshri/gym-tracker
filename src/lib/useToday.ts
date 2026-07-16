"use client";
import { getDayKeyForWeekday } from "@/lib/logic/schedule";
import { getTemplate } from "@/lib/data/templates";

export function useToday() {
  const now = new Date();
  const dayKey = getDayKeyForWeekday(now.getDay());
  const todayIso = now.toISOString().slice(0, 10);
  return { dayKey, template: getTemplate(dayKey), todayIso };
}
