"use client";

import { useState } from "react";
import { useGuestState } from "@/lib/guestStore";

type Result = {
  url: string; finalUrl: string; hostname: string; httpStatus: number; score: number; total: number;
  checks: { id: string; label: string; ok: boolean; value?: string; link?: string }[];
  external: { id: string; label: string; desc: string; url: string }[];
};

export default function SiteCheckPage() {
  const { state, update, hydrated } = useGuestState();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (target = url) => {
    const t = target.trim();
    if (!t) return;
    setBusy(true); setErr(null); setResult(null);
    try {
      const res = await fetch("/api/site-check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: t }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "검사에 실패했어요.");
      setResult(data);
      update((s) => ({ ...s, recentChecks: [data.finalUrl, ...s.recentChecks.filter((x) => x !== data.finalUrl)].slice(0, 6) }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "검사에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      <header>
        <div className="eyebrow">QUICK SITE CHECK</div>
        <h1 className="hero-title" style={{ fontSize: 40 }}>내 사이트 간단 체크하기</h1>
        <p className="hero-desc">공개된 사이트에서 확인 가능한 기본 검색 설정과 AI 크롤러 안내 파일을 빠르게 점검해요.</p>
      </header>

      <section className="card">
        <form className="check-bar" onSubmit={(e) => { e.preventDefault(); run(); }}>
          <input className="input" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="검사할 사이트 주소" />
          <button className="btn btn-primary" disabled={busy || !url.trim()}>{busy ? "검사 중…" : "체크"}</button>
        </form>
        <p className="card-sub" style={{ marginTop: 10 }}>로그인이나 접근 제한이 있는 페이지는 일부 항목을 확인하지 못할 수 있어요.</p>
        {hydrated && state.recentChecks.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="card-sub" style={{ marginBottom: 8 }}>최근 체크한 사이트</div>
            <div className="filter-row" style={{ margin: 0 }}>
              {state.recentChecks.map((u) => (
                <button key={u} onClick={() => { setUrl(u); run(u); }}>{new URL(u).hostname}</button>
              ))}
            </div>
          </div>
        )}
        {err && <div className="empty" style={{ marginTop: 14, color: "#b91c1c" }}>{err}</div>}
      </section>

      {result && (
        <>
          <div className="card-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="eyebrow">검사 완료 · HTTP {result.httpStatus}</div>
              <h2 style={{ fontSize: 24 }}>{result.hostname}</h2>
              <a href={result.finalUrl} target="_blank" rel="noreferrer" className="card-sub">{result.finalUrl} ↗</a>
            </div>
            <div className="score">{result.score}/{result.total}</div>
          </div>
          <div className="grid-2">
            <section className="card">
              <h2>기본 체크리스트</h2>
              <p className="card-sub" style={{ marginBottom: 14 }}>사이트에서 직접 인식한 항목이에요.</p>
              {result.checks.map((c) => (
                <div key={c.id} className={`result-row ${c.ok ? "ok" : ""}`}>
                  <span className="mark">{c.ok ? "✓" : "—"}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="label">{c.label}</div>
                    {c.value && <div className="value">{c.value}</div>}
                    {c.link && <a className="card-sub" href={c.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--blue)" }}>파일 열기 ↗</a>}
                  </div>
                  <span className="status">{c.ok ? "확인됨" : "확인 안 됨"}</span>
                </div>
              ))}
            </section>
            <section className="card">
              <h2>추가 검색 결과</h2>
              <p className="card-sub" style={{ marginBottom: 14 }}>검색엔진별 색인 결과와 외부 검사 도구를 확인하세요.</p>
              {result.external.map((x) => (
                <a key={x.id} className="ext-link" href={x.url} target="_blank" rel="noreferrer">
                  <div style={{ flex: 1 }}>
                    <strong>{x.label}</strong>
                    <span>{x.desc}</span>
                  </div>
                  <span aria-hidden>↗</span>
                </a>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
