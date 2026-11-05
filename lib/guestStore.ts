"use client";

import { useCallback, useEffect, useState } from "react";

export type Goal = { id: string; title: string; done: boolean; createdAt: string };
export type LogEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  body: string;
  checklistItemIds: string[];
  createdAt: string;
};

export type GuestState = {
  goals: Goal[];
  logs: LogEntry[];
  completedItemsByWeek: Record<string, string[]>; // "week-3": [itemId, ...]
  favoriteLinks: string[];
  recentChecks: string[];
};

const KEY = "geo-study-guest-state";

const EMPTY: GuestState = {
  goals: [],
  logs: [],
  completedItemsByWeek: {},
  favoriteLinks: [],
  recentChecks: [],
};

function read(): GuestState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function write(s: GuestState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode 등에서 실패해도 UI는 동작 */
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const today = () => {
  const d = new Date();
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
};

/** SSR 안전한 게스트 상태 훅. hydrated 전에는 EMPTY를 돌려준다. */
export function useGuestState() {
  const [state, setState] = useState<GuestState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  const update = useCallback((fn: (s: GuestState) => GuestState) => {
    setState((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  return { state, update, hydrated };
}

/** 연속 기록 일수: 오늘 또는 어제부터 거슬러 올라가며 끊기지 않은 날 수 */
export function computeStreak(logs: LogEntry[]): number {
  const days = new Set(logs.map((l) => l.date));
  if (days.size === 0) return 0;
  const d = new Date(today() + "T00:00:00");
  if (!days.has(fmt(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(fmt(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
function fmt(d: Date) {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}
