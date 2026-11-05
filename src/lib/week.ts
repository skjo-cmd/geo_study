/**
 * 주차 계산의 단일 진입점.
 *
 * 벤치마킹 대상 사이트에서 발견한 결함 두 가지를 설계 단계에서 제거한다.
 *  1. 주차가 커리큘럼 길이를 넘어 무한히 증가 → 항상 [1, totalWeeks]로 클램프
 *  2. 페이지마다 "현재 주차" 기준이 다름 → 모든 화면이 resolveWeek()만 사용
 */

export type WeekPhase = "before" | "during" | "after";

export type ResolvedWeek = {
  /** 화면에 쓰는 주차. 항상 1 이상 totalWeeks 이하 */
  number: number;
  /** 클램프 전 계산값. 진단/디버그용 */
  raw: number;
  /** 프로그램 시작 전 / 진행 중 / 종료 후 */
  phase: WeekPhase;
  totalWeeks: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD 를 로컬 자정 Date 로 */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** 로컬 자정 기준 날짜 차이(일). 음수 가능 */
export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.floor((b - a) / DAY_MS);
}

export function resolveWeek(
  startDate: string,
  totalWeeks: number,
  now: Date = new Date(),
): ResolvedWeek {
  if (!Number.isInteger(totalWeeks) || totalWeeks < 1) {
    throw new Error("totalWeeks must be a positive integer");
  }
  const days = daysBetween(parseLocalDate(startDate), now);
  const raw = Math.floor(days / 7) + 1;

  let phase: WeekPhase = "during";
  if (raw < 1) phase = "before";
  else if (raw > totalWeeks) phase = "after";

  const number = Math.min(Math.max(raw, 1), totalWeeks);
  return { number, raw, phase, totalWeeks };
}

/** 주차 이동 시에도 같은 클램프를 거친다 */
export function clampWeek(weekNumber: number, totalWeeks: number): number {
  if (!Number.isFinite(weekNumber)) return 1;
  return Math.min(Math.max(Math.round(weekNumber), 1), totalWeeks);
}

export function weekKey(weekNumber: number): string {
  return `week-${weekNumber}`;
}

export function formatWeekLabel(weekNumber: number): string {
  return `WEEK ${String(weekNumber).padStart(2, "0")}`;
}

export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 연속 기록 일수. 오늘 또는 어제부터 거꾸로 하루도 빠짐없이 기록이 있는 날 수.
 * dates: YYYY-MM-DD 목록(중복 허용)
 */
export function computeStreak(dates: string[], now: Date = new Date()): number {
  const set = new Set(dates);
  if (set.size === 0) return 0;
  const today = todayISO(now);
  const yesterday = todayISO(new Date(now.getTime() - DAY_MS));
  let cursor: Date;
  if (set.has(today)) cursor = new Date(now);
  else if (set.has(yesterday)) cursor = new Date(now.getTime() - DAY_MS);
  else return 0;

  let streak = 0;
  while (set.has(todayISO(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}
