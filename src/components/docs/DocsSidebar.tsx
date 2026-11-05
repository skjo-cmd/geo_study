"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { docsByGroup } from "@/lib/docs";

export function DocsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const groups = docsByGroup();
  const currentSlug = pathname.startsWith("/info/") ? pathname.slice("/info/".length) : "";

  return (
    <>
      {/* 모바일: 문서 트리를 본문 위에 펼치지 않고 select 하나로 대체 */}
      <div className="docs-mobile-select">
        <label className="field-label" htmlFor="docs-select">
          가이드 선택
        </label>
        <select
          id="docs-select"
          className="input"
          value={currentSlug}
          onChange={(e) => router.push(e.target.value ? `/info/${e.target.value}` : "/info")}
        >
          <option value="">가이드 목록</option>
          {groups.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.docs.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <aside className="docs-sidebar card" aria-label="가이드 목록">
        <Link href="/info" className="docs-link" aria-current={pathname === "/info" ? "page" : undefined}>
          전체 보기
        </Link>
        {groups.map((g) => (
          <div className="docs-group" key={g.group}>
            <div className="docs-group-title">{g.group}</div>
            {g.docs.map((d) => (
              <Link
                key={d.slug}
                href={`/info/${d.slug}`}
                className="docs-link"
                aria-current={currentSlug === d.slug ? "page" : undefined}
              >
                {d.title}
              </Link>
            ))}
          </div>
        ))}
      </aside>
    </>
  );
}
