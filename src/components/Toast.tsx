"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type Toast = { id: number; message: string; tone: "info" | "success" | "error" };

type ToastApi = { notify: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 3500;

/**
 * 토스트는 (1) 3.5초 뒤 자동으로 사라지고 (2) 페이지를 이동하면 즉시 사라진다.
 * 원본 사이트에서는 토스트가 다른 페이지까지 따라오는 문제가 있었다 (결함 7).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // 경로가 바뀌면 렌더 중에 토스트 목록을 비운다 (파생 상태 패턴)
  const [state, setState] = useState<{ pathname: string; toasts: Toast[] }>({ pathname, toasts: [] });
  if (state.pathname !== pathname) {
    setState({ pathname, toasts: [] });
  }
  const toasts = state.toasts;
  const seq = useRef(0);

  const notify = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = ++seq.current;
    setState((s) => ({ ...s, toasts: [...s.toasts, { id, message, tone }] }));
    window.setTimeout(() => setState((s) => ({ ...s, toasts: s.toasts.filter((x) => x.id !== id) })), AUTO_DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-host" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
