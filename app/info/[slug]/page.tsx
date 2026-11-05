import Link from "next/link";
import { notFound } from "next/navigation";
import guides from "@/data/guides.json";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  return (
    <div className="stack">
      <header>
        <div className="eyebrow">STEP-BY-STEP GUIDE</div>
        <h1 className="hero-title" style={{ fontSize: 40 }}>{guide.title}</h1>
        <p className="hero-desc">{guide.summary}</p>
        <div className="hero-meta">
          <span><strong>핵심 항목 {guide.steps.length}개</strong></span>
          <span>위에서부터 따라오시면 돼요</span>
        </div>
      </header>

      <div className="grid-2">
        <section className="card">
          {guide.steps.map((s, i) => (
            <article key={i} className="guide-step" id={`step-${i + 1}`}>
              <div className="guide-num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="eyebrow" style={{ fontSize: 11 }}>핵심 안내</div>
                <h3>{s.heading}</h3>
                <p>{s.body}</p>
                {s.points.length > 0 && <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>}
                {"links" in s && s.links && (
                  <div className="filter-row" style={{ marginBottom: 0 }}>
                    {s.links.map((l) => (
                      <a key={l.url} className="btn btn-sm" href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
        <aside className="card" style={{ alignSelf: "start", position: "sticky", top: "calc(var(--nav-h) + 16px)" }}>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>이 페이지에서 볼 내용</h2>
          <div className="toc">
            {guide.steps.map((s, i) => (
              <a key={i} href={`#step-${i + 1}`}><b>{i + 1}</b>{s.heading}</a>
            ))}
          </div>
          <Link href="/info" className="btn btn-sm" style={{ marginTop: 16 }}>← 전체 문서</Link>
        </aside>
      </div>
    </div>
  );
}
