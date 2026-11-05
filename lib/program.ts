import curriculum from "@/data/curriculum.json";
import { getCurrentWeek } from "@/lib/currentWeek.js";

export type ChecklistItem = {
  id: string;
  title: string;
  time?: string;
  category?: "research";
  isNew?: boolean;
};

export type WeekMeta = { number: number; title: string; items: ChecklistItem[] };

export const PROGRAM = curriculum.program;
export const TOTAL_WEEKS: number = curriculum.program.totalWeeks;

const weeks = curriculum.weeks as Record<string, { title: string; items: ChecklistItem[] }>;

export function getWeek(n: number): WeekMeta {
  const clamped = Math.min(TOTAL_WEEKS, Math.max(1, n));
  const w = weeks[String(clamped)];
  return { number: clamped, title: w?.title ?? "", items: w?.items ?? [] };
}

export function resolveCurrentWeek(now = new Date()) {
  return getCurrentWeek({ startDate: PROGRAM.startDate, totalWeeks: TOTAL_WEEKS, now }) as {
    week: number;
    elapsedWeeks: number;
    status: "before" | "active" | "finished";
  };
}

export const weekKey = (n: number) => `week-${n}`;
export const pad2 = (n: number) => String(n).padStart(2, "0");
