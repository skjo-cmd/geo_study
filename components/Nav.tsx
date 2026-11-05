"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "내 대시보드", short: "대시보드", icon: "▦" },
  { href: "/logs", label: "성장 기록", short: "성장 기록", icon: "✎" },
  { href: "/site-check", label: "사이트 체크", short: "체크", icon: "◎" },
  { href: "/info", label: "정보", short: "정보", icon: "ⓘ" },
  { href: "/links", label: "링크 모음", short: "링크", icon: "⧉" },
];

export default function Nav() {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/dashboard" className="brand">
            <span className="brand-mark">GEO</span>
            <span>Study Lab</span>
          </Link>
          <nav className="main-nav" aria-label="주요 메뉴">
            {ITEMS.map((it) => (
              <Link key={it.href} href={it.href} prefetch={false} className={isActive(it.href) ? "active" : ""}>
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="guest-badge">
            <span>
              <strong>게스트</strong>
              비로그인 체험
            </span>
            <div className="avatar" aria-hidden>게</div>
          </div>
        </div>
      </header>
      <div className="banner">
        <div className="banner-inner">
          <span>✦ 비로그인 상태의 기록은 이 브라우저에만 저장돼요.</span>
          <Link href="/logs" className="btn btn-sm btn-lime">오늘 기록 남기기 →</Link>
        </div>
      </div>
      <nav className="mobile-tabs" aria-label="모바일 메뉴">
        {ITEMS.map((it) => (
          <Link key={it.href} href={it.href} prefetch={false} className={isActive(it.href) ? "active" : ""}>
            <span aria-hidden>{it.icon}</span>
            {it.short}
          </Link>
        ))}
      </nav>
    </>
  );
}
