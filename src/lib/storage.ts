/**
 * 브라우저 저장소 접근 계층.
 * - 모든 읽기/쓰기는 try/catch (사생활 보호 모드, 용량 초과, SSR 대비)
 * - 스키마 버전을 함께 저장해 이후 마이그레이션 가능
 * - "읽기만 했는데 쓰기가 일어나는" 경로를 만들지 않는다 (원본 사이트의 결함 6번)
 */

export const STORAGE_KEYS = {
  workspace: "geo-lab:workspace",
  favorites: "geo-lab:favorites",
  customLinks: "geo-lab:custom-links",
  recentChecks: "geo-lab:recent-site-checks",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

type Envelope<T> = { v: number; data: T };

export function readStorage<T>(key: StorageKey, version: number, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Envelope<T>>;
    if (parsed && typeof parsed === "object" && parsed.v === version && "data" in parsed) {
      return parsed.data as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: StorageKey, version: number, data: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    const envelope: Envelope<T> = { v: version, data };
    window.localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key: StorageKey): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function clearAllAppStorage(): void {
  (Object.values(STORAGE_KEYS) as StorageKey[]).forEach(removeStorage);
}

export function makeId(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}
