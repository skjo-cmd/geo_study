import type { Metadata } from "next";
import Link from "next/link";
import { docsByGroup } from "@/lib/docs";

export const metadata: Metadata = { title: "가이드" };

export default function InfoIndexPage() {
  const groups = docsByGroup();
  return (
    <>
      <div className="page-head">
        <p className="eyebrow">GUIDES</p>
        <h1 className="page-title">4주 가이드</h1>
        <p className="page-lead">주차별 체크리스트 항목에서 바로 연결되는 실행 가이드예요. 위에서부터 순서대로 따라오면 돼요.</p>
      </div>
      <div className="stack">
        {groups.map((g) => (
          <section key={g.group} aria-labelledby={`group-${g.group}`}>
            <h2 className="card-title" id={`group-${g.group}`} style={{ marginBottom: 10 }}>
              {g.group}
            </h2>
            <div className="stack" style={{ gap: 10 }}>
              {g.docs.map((d) => (
                <Link key={d.slug} href={`/info/${d.slug}`} className="card doc-card">
                  <div className="card-head" style={{ marginBottom: 4 }}>
                    <span className="card-title" style={{ fontSize: 16 }}>
                      {d.title}
                    </span>
                    {d.week && <span className="pill">{d.week}주차</span>}
                  </div>
                  <p className="card-sub">{d.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
