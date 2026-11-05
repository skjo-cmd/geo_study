"use client";

import { useMemo, useState } from "react";
import links from "@/data/links.json";
import { useGuestState } from "@/lib/guestStore";

const CATS = ["전체", "검색 문서", "서치콘솔", "측정", "트렌드 분석", "유용한 도구"];

export default function LinksPage() {
  const { state, update, hydrated } = useGuestState();
  const [cat, setCat] = useState("전체");
  const fav = new Set(state.favoriteLinks);
  const list = useMemo(() => (cat === "전체" ? links : links.filter((l) => l.cat === cat)), [cat]);
  const favorites = links.filter((l) => fav.has(l.id));

  const toggleFav = (id: string) =>
    update((s) => ({ ...s, favoriteLinks: s.favoriteLinks.includes(id) ? s.favoriteLinks.filter((x) => x !== id) : [...s.favoriteLinks, id] }));

  return (
    <div className="stack">
      <header>
        <div className="eyebrow">MEMBER LIBRARY</div>
        <h1 className="hero-title" style={{ fontSize: 40 }}>유용한 링크 모음</h1>
        <p className="hero-desc">검색 문서부터 웹마스터 도구, 측정과 트렌드 분석 사이트까지 실습에 필요한 링크를 모았어요.</p>
      </header>

      <section className="card">
        <h2>내 바로가기</h2>
        <p className="card-sub" style={{ marginBottom: 12 }}>별표를 누른 자료를 빠르게 열 수 있어요.</p>
        {hydrated && favorites.length === 0 ? (
          <div className="empty">아직 바로가기가 없어요. 자료에 별표를 눌러 보세요.</div>
        ) : (
          <div className="filter-row" style={{ margin: 0 }}>
            {favorites.map((l) => (
              <a key={l.id} className="btn btn-sm" href={l.url} target="_blank" rel="noreferrer">★ {l.title}</a>
            ))}
          </div>
        )}
      </section>

      <div>
        <div className="card-head" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: 16 }}>{links.length}개 자료</h2>
        </div>
        <div className="filter-row">
          {CATS.map((c) => (
            <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="grid-cards">
          {list.map((l) => (
            <div key={l.id} className="card link-card">
              <button className={`star ${fav.has(l.id) ? "on" : ""}`} aria-label={fav.has(l.id) ? "즐겨찾기 해제" : "즐겨찾기 추가"} onClick={() => toggleFav(l.id)}>
                {fav.has(l.id) ? "★" : "☆"}
              </button>
              <div className="cat">{l.cat}</div>
              <h3><a href={l.url} target="_blank" rel="noreferrer">{l.title} ↗</a></h3>
              <p>{l.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
