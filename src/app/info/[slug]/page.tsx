import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DOCS, DOC_MAP } from "@/lib/docs";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = DOC_MAP[slug];
  return { title: doc ? doc.title : "가이드" };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = DOC_MAP[slug];
  if (!doc) notFound();

  const index = DOCS.findIndex((d) => d.slug === slug);
  const prev = DOCS[index - 1];
  const next = DOCS[index + 1];

  return (
    <article className="card">
      <p className="eyebrow">
        {doc.group}
        {doc.week ? ` · ${doc.week}주차` : ""}
      </p>
      <h1 className="page-title" style={{ fontSize: 30 }}>
        {doc.title}
      </h1>
      <p className="page-lead">{doc.summary}</p>

      <nav aria-label="이 문서의 목차" style={{ margin: "18px 0 6px" }}>
        <ol style={{ margin: 0, paddingLeft: 20, color: "var(--muted)", fontSize: 14 }}>
          {doc.sections.map((s, i) => (
            <li key={i}>
              <a href={`#section-${i + 1}`}>{s.heading}</a>
            </li>
          ))}
        </ol>
      </nav>

      {doc.sections.map((s, i) => (
        <section className="doc-section" key={i} id={`section-${i + 1}`}>
          <h3>
            <span className="eyebrow" style={{ marginRight: 8 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {s.heading}
          </h3>
          {s.body && <p>{s.body}</p>}
          {s.bullets && (
            <ul>
              {s.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          )}
          {s.links && (
            <div className="doc-links">
              {s.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn btn-sm">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
          {s.callout && <p className="callout">{s.callout}</p>}
        </section>
      ))}

      <div className="dialog-actions" style={{ justifyContent: "space-between", marginTop: 28 }}>
        {prev ? (
          <Link href={`/info/${prev.slug}`} className="btn">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/info/${next.slug}`} className="btn">
            {next.title} →
          </Link>
        ) : (
          <Link href="/dashboard" className="btn btn-primary">
            대시보드로
          </Link>
        )}
      </div>
    </article>
  );
}
