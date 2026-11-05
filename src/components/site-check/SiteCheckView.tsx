"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { ERROR_MESSAGES, normalizeUrl, type SiteCheckError, type SiteCheckReport } from "@/lib/site-check";
import { STORAGE_KEYS } from "@/lib/storage";
import { createPersistentStore, usePersistentStore } from "@/lib/persistent-store";

type RecentCheck = { hostname: string; url: string; score: number; total: number; checkedAt: string };
const RECENT_VERSION = 1;
const RECENT_LIMIT = 8;
const recentStore = createPersistentStore<RecentCheck[]>(STORAGE_KEYS.recentChecks, RECENT_VERSION, []);

function externalLinks(hostname: string, origin: string) {
  const q = encodeURIComponent(`site:${hostname}`);
  return [
    { label: "Google 색인 결과", sub: `site:${hostname} 검색`, href: `https://www.google.com/search?q=${q}` },
    { label: "네이버 색인 결과", sub: `site:${hostname} 검색`, href: `https://search.naver.com/search.naver?query=${q}` },
    { label: "Bing 색인 결과", sub: `site:${hostname} 검색`, href: `https://www.bing.com/search?q=${q}` },
    { label: "PageSpeed Insights", sub: "속도와 Core Web Vitals", href: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(origin)}` },
    { label: "리치 결과 테스트", sub: "구조화 데이터 검사", href: `https://search.google.com/test/rich-results?url=${encodeURIComponent(origin)}&hl=ko` },
  ];
}

export function SiteCheckView() {
  const { notify } = useToast();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SiteCheckReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recent = usePersistentStore(recentStore);

  const run = async (raw: string) => {
    const url = normalizeUrl(raw);
    if (!url) {
      setError(ERROR_MESSAGES.invalid_url);
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/site-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.href }),
      });
      const data = (await res.json()) as SiteCheckReport | { error: SiteCheckError };
      if ("error" in data) {
        setError(data.error.message);
        return;
      }
      setReport(data);
      const entry: RecentCheck = { hostname: data.hostname, url: data.finalUrl, score: data.score, total: data.total, checkedAt: data.checkedAt };
      recentStore.set((prev) => [entry, ...prev.filter((r) => r.hostname !== entry.hostname)].slice(0, RECENT_LIMIT));
      notify(`${data.hostname} 체크 완료: ${data.score}/${data.total}`, "success");
    } catch {
      setError("체크 요청을 보내지 못했어요. 네트워크 연결을 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const origin = report ? new URL(report.finalUrl).origin : "";

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">QUICK SITE CHECK</p>
        <h1 className="page-title">내 사이트 간단 체크</h1>
        <p className="page-lead">공개된 페이지에서 확인할 수 있는 기본 검색 설정 10가지를 점검해요. 1주차에 기준선을, 4주차에 변화를 확인하세요.</p>
      </div>

      <section className="card" aria-labelledby="check-form-title">
        <h2 className="sr-only" id="check-form-title">
          사이트 주소 입력
        </h2>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
        >
          <input
            className="input"
            type="text"
            inputMode="url"
            aria-label="사이트 주소"
            placeholder="https://example.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="url"
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
            {loading ? "확인 중…" : "체크"}
          </button>
        </form>
        <p className="card-sub" style={{ marginTop: 8 }}>
          로그인이나 접근 제한이 있는 페이지는 일부 항목을 확인하지 못할 수 있어요. 내부망 주소는 확인하지 않아요.
        </p>
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
        {recent.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <span className="field-label">최근 체크한 사이트</span>
            <div className="chip-list">
              {recent.map((r) => (
                <button
                  type="button"
                  key={r.hostname}
                  className="chip"
                  onClick={() => {
                    setInput(r.url);
                    run(r.url);
                  }}
                  title={`${r.checkedAt.slice(0, 10)} · ${r.score}/${r.total}`}
                >
                  {r.hostname} · {r.score}/{r.total}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {loading && (
        <div className="empty" style={{ marginTop: 20 }} aria-busy="true">
          사이트를 불러와 확인하고 있어요. 최대 10초 정도 걸릴 수 있어요.
        </div>
      )}

      {report && (
        <div style={{ marginTop: 24 }}>
          <div className="card-head">
            <div>
              <p className="eyebrow">검사 완료 · {new Date(report.checkedAt).toLocaleString("ko-KR")}</p>
              <h2 className="page-title" style={{ fontSize: 26 }}>
                {report.hostname}
              </h2>
              <a href={report.finalUrl} target="_blank" rel="noreferrer" className="card-sub">
                {report.finalUrl} ↗
              </a>
            </div>
            <div className="score" aria-label={`점수 ${report.score}점, ${report.total}점 만점`}>
              {report.score}/{report.total}
            </div>
          </div>
          <div className="grid-2">
            <section className="card" aria-labelledby="checks-title">
              <h2 className="card-title" id="checks-title">
                기본 체크리스트
              </h2>
              <p className="card-sub" style={{ marginBottom: 14 }}>
                사이트에서 직접 읽은 항목이에요. 마지막 항목은 참고용으로 점수에 넣지 않아요.
              </p>
              {report.checks.map((c) => (
                <div className={`check-result ${c.status}`} key={c.id}>
                  <span className="check-result-status" aria-hidden="true">
                    {c.status === "ok" ? "✓" : c.status === "warn" ? "!" : "–"}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="check-result-label">
                      {c.label}{" "}
                      <span className="sr-only">{c.status === "ok" ? "확인됨" : c.status === "warn" ? "주의" : "확인 안 됨"}</span>
                    </div>
                    {c.value && <div className="check-result-value">{c.value}</div>}
                    {c.hint && <div className="check-result-hint">{c.hint}</div>}
                    {c.href && (
                      <a href={c.href} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                        파일 열기 ↗
                      </a>
                    )}
                  </div>
                  <span className={`pill ${c.status === "ok" ? "" : c.status === "warn" ? "pill-warn" : "pill-muted"}`}>
                    {c.status === "ok" ? "확인됨" : c.status === "warn" ? "주의" : "확인 안 됨"}
                  </span>
                </div>
              ))}
            </section>
            <section className="card" aria-labelledby="external-title">
              <h2 className="card-title" id="external-title">
                추가 확인
              </h2>
              <p className="card-sub" style={{ marginBottom: 14 }}>
                검색엔진별 색인 결과와 외부 검사 도구예요.
              </p>
              <div className="external-list">
                {externalLinks(report.hostname, origin).map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="external-link">
                    <span>
                      {l.label}
                      <small>{l.sub}</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
