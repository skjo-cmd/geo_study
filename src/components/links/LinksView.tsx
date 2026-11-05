"use client";

import { useMemo, useState } from "react";
import { RESOURCES, RESOURCE_CATEGORIES, RESOURCE_MAP, type ResourceCategory } from "@/lib/links";
import { STORAGE_KEYS, makeId } from "@/lib/storage";
import { createPersistentStore, usePersistentStore } from "@/lib/persistent-store";
import { normalizeUrl } from "@/lib/site-check";
import { useToast } from "@/components/Toast";
import { Dialog } from "@/components/Dialog";

type CustomLink = { id: string; title: string; url: string };
const FAV_VERSION = 1;
const CUSTOM_VERSION = 1;
const favoritesStore = createPersistentStore<string[]>(STORAGE_KEYS.favorites, FAV_VERSION, []);
const customStore = createPersistentStore<CustomLink[]>(STORAGE_KEYS.customLinks, CUSTOM_VERSION, []);

export function LinksView() {
  const { notify } = useToast();
  const favorites = usePersistentStore(favoritesStore);
  const custom = usePersistentStore(customStore);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const toggleFavorite = (id: string) => {
    favoritesStore.set((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const removeCustom = (id: string) => {
    customStore.set((prev) => prev.filter((c) => c.id !== id));
    notify("바로가기를 삭제했어요.");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (!q) return true;
      const hay = [r.title, r.description, r.url, ...(r.keywords ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, category]);

  const favoriteResources = favorites.map((id) => RESOURCE_MAP[id]).filter(Boolean);

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">LIBRARY</p>
        <h1 className="page-title">유용한 링크 모음</h1>
        <p className="page-lead">검색 문서, 웹마스터 도구, 측정과 검사 도구. 별표를 누르면 내 바로가기에 모여요.</p>
      </div>

      <div className="stack">
        <section className="card" aria-labelledby="shortcuts-title">
          <div className="card-head">
            <div>
              <h2 className="card-title" id="shortcuts-title">
                내 바로가기
              </h2>
              <p className="card-sub">즐겨찾기와 직접 추가한 페이지</p>
            </div>
            <button type="button" className="btn btn-sm" onClick={() => setAddOpen(true)}>
              + 페이지 추가
            </button>
          </div>
          {favoriteResources.length === 0 && custom.length === 0 ? (
            <div className="empty">아직 바로가기가 없어요. 아래 자료에 별표를 누르거나 페이지를 추가해 보세요.</div>
          ) : (
            <div className="chip-list">
              {favoriteResources.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="btn btn-sm">
                  ★ {r.title}
                </a>
              ))}
              {custom.map((c) => (
                <span key={c.id} style={{ display: "inline-flex", gap: 2 }}>
                  <a href={c.url} target="_blank" rel="noreferrer" className="btn btn-sm">
                    {c.title}
                  </a>
                  <button type="button" className="link-button danger" aria-label={`${c.title} 삭제`} onClick={() => removeCustom(c.id)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="card" aria-labelledby="resources-title">
          <h2 className="sr-only" id="resources-title">
            자료 목록
          </h2>
          <div className="inline-form" style={{ marginBottom: 12 }}>
            <input
              type="search"
              className="input"
              aria-label="자료 검색"
              placeholder="제목, 설명, 키워드 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="pill pill-muted" style={{ alignSelf: "center" }}>
              {filtered.length}개
            </span>
          </div>
          <div className="chip-list" role="group" aria-label="카테고리" style={{ marginBottom: 8 }}>
            <button type="button" className="chip" aria-pressed={category === "all"} onClick={() => setCategory("all")}>
              전체
            </button>
            {RESOURCE_CATEGORIES.map((c) => (
              <button type="button" key={c.id} className="chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="empty">검색 결과가 없어요.</div>
          ) : (
            filtered.map((r) => {
              const fav = favorites.includes(r.id);
              return (
                <div className="resource" key={r.id}>
                  <div className="resource-body">
                    <span className="pill pill-muted" style={{ marginBottom: 4 }}>
                      {RESOURCE_CATEGORIES.find((c) => c.id === r.category)?.label}
                    </span>
                    <div>
                      <a href={r.url} target="_blank" rel="noreferrer" className="resource-title">
                        {r.title} ↗
                      </a>
                    </div>
                    <p className="resource-desc">{r.description}</p>
                  </div>
                  <button
                    type="button"
                    className="icon-button star"
                    aria-pressed={fav}
                    aria-label={fav ? `${r.title} 즐겨찾기 해제` : `${r.title} 즐겨찾기 등록`}
                    onClick={() => toggleFavorite(r.id)}
                  >
                    {fav ? "★" : "☆"}
                  </button>
                </div>
              );
            })
          )}
        </section>
      </div>

      <Dialog open={addOpen} title="바로가기 추가" eyebrow="CUSTOM PAGE" onClose={() => setAddOpen(false)} initialFocus="#custom-title">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const u = normalizeUrl(url);
            if (!u) {
              notify("주소 형식이 올바르지 않아요. https://example.com 처럼 입력해 주세요.", "error");
              return;
            }
            customStore.set((prev) => [...prev, { id: makeId("link"), title: title.trim() || u.hostname, url: u.href }]);
            setTitle("");
            setUrl("");
            setAddOpen(false);
            notify("바로가기를 추가했어요.", "success");
          }}
        >
          <div className="field">
            <label className="field-label" htmlFor="custom-title">
              이름
            </label>
            <input id="custom-title" className="input" value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} placeholder="예: 우리 회사 서치콘솔" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="custom-url">
              페이지 주소
            </label>
            <input id="custom-url" className="input" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => setAddOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={!url.trim()}>
              추가
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
