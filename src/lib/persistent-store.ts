"use client";

import { useSyncExternalStore } from "react";
import { readStorage, removeStorage, writeStorage, type StorageKey } from "./storage";

/**
 * localStorage 를 외부 스토어로 다루는 작은 유틸.
 * - 서버 스냅샷은 항상 fallback → 하이드레이션 불일치 없음
 * - 클라이언트 첫 읽기에서만 localStorage 를 읽고, 이후에는 메모리 상태를 돌려준다
 * - 쓰기는 set()/reset() 에서만 일어난다. 읽기 경로는 저장소를 건드리지 않는다
 */
export type PersistentStore<T> = {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: (updater: (prev: T) => T) => void;
  reset: () => void;
};

export function createPersistentStore<T>(key: StorageKey, version: number, fallback: T): PersistentStore<T> {
  let state: T = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    state = readStorage<T>(key, version, fallback);
  };

  return {
    getSnapshot: () => {
      load();
      return state;
    },
    getServerSnapshot: () => fallback,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (updater) => {
      load();
      const next = updater(state);
      if (Object.is(next, state)) return;
      state = next;
      writeStorage(key, version, state);
      emit();
    },
    reset: () => {
      loaded = true;
      state = fallback;
      removeStorage(key);
      emit();
    },
  };
}

export function usePersistentStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

const noopSubscribe = () => () => {};

/** 하이드레이션이 끝나 클라이언트 상태를 신뢰할 수 있는지 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
