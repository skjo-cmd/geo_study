import Link from "next/link";
import guides from "@/data/guides.json";

export const metadata = { title: "정보 문서 · GEO Study" };

export default function InfoIndex() {
  return (
    <div className="stack">
      <header>
        <div className="eyebrow">STEP-BY-STEP GUIDE</div>
        <h1 className="hero-title" style={{ fontSize: 40 }}>정보 문서</h1>
        <p className="hero-desc">사이트 선정부터 검색엔진 등록, 봇이 보는 내 사이트까지 순서대로 따라오시면 돼요.</p>
      </header>
      <div className="grid-cards">
        {guides.map((g, i) => (
          <Link key={g.slug} href={`/info/${g.slug}`} className="card">
            <div className="eyebrow">{String(i + 1).padStart(2, "0")}</div>
            <h2 style={{ margin: "6px 0" }}>{g.title}</h2>
            <p className="card-sub">{g.summary}</p>
            <p className="card-sub" style={{ marginTop: 10, color: "var(--blue)" }}>핵심 항목 {g.steps.length}개 →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
