"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { PROGRAM, allItems, findItem, getWeek, type Week } from "./curriculum";
import { STORAGE_KEYS, clearAllAppStorage, makeId } from "./storage";
import { createPersistentStore, useHydrated, usePersistentStore } from "./persistent-store";
import { clampWeek, computeStreak, resolveWeek, todayISO, type ResolvedWeek } from "./week";

export type Goal = { id: string; title: string; done: boolean; createdAt: string };

export type LogEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  week: number;
  kind: "note" | "check";
  content: string;
  /** 연결된 체크리스트 항목 id */
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Profile = { displayName: string };

export type Workspace = {
  profile: Profile;
  goals: Goal[];
  logs: LogEntry[];
  /** week number → 완료한 item id 목록. 빈 배열은 저장하지 않는다 */
  completed: Record<string, string[]>;
};

const WORKSPACE_VERSION = 1;

const EMPTY: Workspace = {
  profile: { displayName: "" },
  goals: [],
  logs: [],
  completed: {},
};

/** 워크스페이스 외부 스토어. 읽기는 저장소를 쓰지 않고, 쓰기는 mutate 로만 (결함 6) */
export const workspaceStore = createPersistentStore<Workspace>(STORAGE_KEYS.workspace, WORKSPACE_VERSION, EMPTY);

type Store = {
  ready: boolean;
  workspace: Workspace;
  current: ResolvedWeek;
  totalWeeks: number;
  /** 사용자가 보고 있는 주차 (대시보드·기록 공통) */
  selectedWeek: number;
  selectWeek: (n: number) => void;
  selectedWeekData: Week;
  isCompleted: (itemId: string) => boolean;
  completedCount: (weekNumber: number) => { done: number; total: number };
  /** 완료 처리 + 선택적으로 기록 생성 */
  completeItem: (itemId: string, memo: string) => void;
  /** 완료 취소. deleteLog=true 면 연결된 체크 기록도 삭제 */
  uncompleteItem: (itemId: string, deleteLog: boolean) => void;
  linkedCheckLog: (itemId: string) => LogEntry | undefined;
  addGoal: (title: string) => void;
  toggleGoal: (id: string) => void;
  removeGoal: (id: string) => void;
  addLog: (input: { date: string; content: string; itemIds: string[]; week?: number }) => void;
  updateLog: (id: string, patch: Partial<Pick<LogEntry, "date" | "content" | "itemIds">>) => void;
  removeLog: (id: string) => void;
  setDisplayName: (name: string) => void;
  streak: number;
  resetAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, now }: { children: ReactNode; now?: Date }) {
  const workspace = usePersistentStore(workspaceStore);
  const ready = useHydrated();
  const totalWeeks = PROGRAM.weeks.length;

  // 주차는 단 한 곳에서 계산한다 (결함 1·2)
  const current = useMemo(() => resolveWeek(PROGRAM.startDate, totalWeeks, now ?? new Date()), [totalWeeks, now]);
  const [selectedWeek, setSelectedWeekState] = useState(current.number);
  const selectWeek = useCallback((n: number) => setSelectedWeekState(clampWeek(n, totalWeeks)), [totalWeeks]);

  const mutate = useCallback((fn: (w: Workspace) => Workspace) => workspaceStore.set(fn), []);

  const selectedWeekData = getWeek(PROGRAM, selectedWeek) ?? PROGRAM.weeks[0];

  const isCompleted = useCallback(
    (itemId: string) => {
      const found = findItem(PROGRAM, itemId);
      if (!found) return false;
      return (workspace.completed[String(found.week.number)] ?? []).includes(itemId);
    },
    [workspace.completed],
  );

  const completedCount = useCallback(
    (weekNumber: number) => {
      const week = getWeek(PROGRAM, weekNumber);
      if (!week) return { done: 0, total: 0 };
      const ids = new Set(allItems(week).map((i) => i.id));
      const done = (workspace.completed[String(weekNumber)] ?? []).filter((id) => ids.has(id)).length;
      return { done, total: ids.size };
    },
    [workspace.completed],
  );

  const linkedCheckLog = useCallback(
    (itemId: string) => workspace.logs.find((l) => l.kind === "check" && l.itemIds.includes(itemId)),
    [workspace.logs],
  );

  const completeItem = useCallback(
    (itemId: string, memo: string) => {
      const found = findItem(PROGRAM, itemId);
      if (!found) return;
      const key = String(found.week.number);
      const nowIso = new Date().toISOString();
      mutate((w) => {
        const list = w.completed[key] ?? [];
        if (list.includes(itemId)) return w;
        const log: LogEntry = {
          id: makeId("log"),
          date: todayISO(),
          week: found.week.number,
          kind: "check",
          content: memo.trim(),
          itemIds: [itemId],
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        return {
          ...w,
          completed: { ...w.completed, [key]: [...list, itemId] },
          logs: [log, ...w.logs],
        };
      });
    },
    [mutate],
  );

  const uncompleteItem = useCallback(
    (itemId: string, deleteLog: boolean) => {
      const found = findItem(PROGRAM, itemId);
      if (!found) return;
      const key = String(found.week.number);
      mutate((w) => {
        const list = (w.completed[key] ?? []).filter((id) => id !== itemId);
        const completed = { ...w.completed };
        if (list.length === 0) delete completed[key];
        else completed[key] = list;
        const logs = deleteLog ? w.logs.filter((l) => !(l.kind === "check" && l.itemIds.includes(itemId))) : w.logs;
        return { ...w, completed, logs };
      });
    },
    [mutate],
  );

  const addGoal = useCallback(
    (title: string) => {
      const t = title.trim();
      if (!t) return;
      mutate((w) => ({ ...w, goals: [...w.goals, { id: makeId("goal"), title: t, done: false, createdAt: new Date().toISOString() }] }));
    },
    [mutate],
  );
  const toggleGoal = useCallback(
    (id: string) => mutate((w) => ({ ...w, goals: w.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)) })),
    [mutate],
  );
  const removeGoal = useCallback((id: string) => mutate((w) => ({ ...w, goals: w.goals.filter((g) => g.id !== id) })), [mutate]);

  const addLog = useCallback(
    (input: { date: string; content: string; itemIds: string[]; week?: number }) => {
      const content = input.content.trim();
      if (!content) return;
      const nowIso = new Date().toISOString();
      mutate((w) => ({
        ...w,
        logs: [
          {
            id: makeId("log"),
            date: input.date,
            week: clampWeek(input.week ?? selectedWeek, totalWeeks),
            kind: "note",
            content,
            itemIds: input.itemIds,
            createdAt: nowIso,
            updatedAt: nowIso,
          },
          ...w.logs,
        ],
      }));
    },
    [mutate, selectedWeek, totalWeeks],
  );
  const updateLog = useCallback(
    (id: string, patch: Partial<Pick<LogEntry, "date" | "content" | "itemIds">>) =>
      mutate((w) => ({
        ...w,
        logs: w.logs.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l)),
      })),
    [mutate],
  );
  const removeLog = useCallback((id: string) => mutate((w) => ({ ...w, logs: w.logs.filter((l) => l.id !== id) })), [mutate]);

  const setDisplayName = useCallback(
    (name: string) => mutate((w) => ({ ...w, profile: { ...w.profile, displayName: name.trim().slice(0, 20) } })),
    [mutate],
  );

  const streak = useMemo(() => computeStreak(workspace.logs.map((l) => l.date)), [workspace.logs]);

  const resetAll = useCallback(() => {
    // 다른 스토어(즐겨찾기 등)도 함께 지운다
    clearAllAppStorage();
    workspaceStore.reset();
    setSelectedWeekState(current.number);
  }, [current.number]);

  const value: Store = {
    ready,
    workspace,
    current,
    totalWeeks,
    selectedWeek,
    selectWeek,
    selectedWeekData,
    isCompleted,
    completedCount,
    completeItem,
    uncompleteItem,
    linkedCheckLog,
    addGoal,
    toggleGoal,
    removeGoal,
    addLog,
    updateLog,
    removeLog,
    setDisplayName,
    streak,
    resetAll,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
