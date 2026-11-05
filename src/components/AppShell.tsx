"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "./Toast";
import { Dialog } from "./Dialog";

/**
 * 내비게이션 항목은 한 배열에서 데스크톱·모바일 양쪽에 그린다.
 * 원본 사이트는 모바일 내비에서 '사이트 체크'가 빠져 있었다 (결함 5).
 */
export const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드", icon: "▦" },
  { href: "/logs", label: "성장 기록", icon: "✎" },
  { href: "/site-check", label: "사이트 체크", icon: "◎" },
  { href: "/info", label: "가이드", icon: "ⓘ" },
  { href: "/links", label: "링크", icon: "⇗" },
  { href: "/stories", label: "회고", icon: "★" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { workspace, setDisplayName, resetAll, ready } = useStore();
  const { notify } = useToast();
  const [resetOpen, setResetOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const name = workspace.profile.displayName || "게스트";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <>
      <a href="#main" className="skip-link">
        본문으로 건너뛰기
      </a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/dashboard" className="brand" aria-label="GEO Lab 홈">
            <span className="brand-mark" aria-hidden="true">
              GEO
            </span>
            <span className="brand-text">GEO Lab</span>
          </Link>
          <nav className="main-nav" aria-label="주요 메뉴">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="profile-chip"
              onClick={() => {
                setNameDraft(workspace.profile.displayName);
                setNameOpen(true);
              }}
              aria-label="표시 이름 바꾸기"
              title="표시 이름 바꾸기"
            >
              <span className="avatar" aria-hidden="true">
                {initial}
              </span>
              <span>{name}</span>
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="이 브라우저의 기록 초기화"
              title="이 브라우저의 기록 초기화"
              onClick={() => setResetOpen(true)}
              disabled={!ready}
            >
              ⟲
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="app-main">
        {children}
      </main>

      <nav className="mobile-nav" aria-label="주요 메뉴 (모바일)">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <Dialog open={nameOpen} title="어떻게 불러드릴까요?" eyebrow="PROFILE" onClose={() => setNameOpen(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDisplayName(nameDraft);
            setNameOpen(false);
            notify("표시 이름을 저장했어요.", "success");
          }}
        >
          <div className="field">
            <label className="field-label" htmlFor="display-name">
              표시 이름 (최대 20자)
            </label>
            <input
              id="display-name"
              className="input"
              value={nameDraft}
              maxLength={20}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="예: 민지 / 우리회사 마케팅팀"
            />
          </div>
          <p className="card-sub">이름과 모든 기록은 이 브라우저에만 저장돼요. 다른 기기와 공유되지 않아요.</p>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => setNameOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              저장
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog open={resetOpen} title="이 브라우저의 기록을 모두 지울까요?" eyebrow="RESET" onClose={() => setResetOpen(false)}>
        <p className="card-sub">
          목표, 성장 기록, 체크리스트 완료 상태, 즐겨찾기, 최근 사이트 체크가 모두 삭제돼요. 되돌릴 수 없어요.
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={() => setResetOpen(false)}>
            취소
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              resetAll();
              setResetOpen(false);
              notify("이 브라우저의 기록을 모두 지웠어요.");
            }}
          >
            모두 지우기
          </button>
        </div>
      </Dialog>
    </>
  );
}
