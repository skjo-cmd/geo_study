"use client";

import { useMemo, useState } from "react";
import { getWeek, resolveCurrentWeek, weekKey, pad2 } from "@/lib/program";
import { useGuestState, uid, today } from "@/lib/guestStore";

export default function LogsPage() {
  const { state, update, hydrated } = useGuestState();
  const current = useMemo(() => resolveCurrentWeek(), []);
  const week = getWeek(current.week);
  const doneSet = new Set(state.completedItemsByWeek[weekKey(current.week)] ?? []);
  const pending = week.items.filter((i) => !doneSet.has(i.id));

  const [date, setDate] = useState(today());
  const [body, setBody] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = () => {
    const b = body.trim();
    if (!b) return;
    update((s) => ({
      ...s,
      logs: [{ id: uid(), date, body: b, checklistItemIds: picked, createdAt: new Date().toISOString() }, ...s.logs],
    }));
    setBody("");
    setPicked([]);
  };

  const titleOf = (id: string) => {
    for (let n = 1; n <= 4; n++) {
      const hit = getWeek(n).items.find((i) => i.id === id);
      if (hit) return hit.title;
    }
    return id;
  };

  const history = [...state.logs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 14);
  const shown = showAll ? pending : pending.slice(0, 4);

  return (
    <div className="stack">
      <header>
        <div className="eyebrow">GROWTH JOURNAL</div>
        <h1 className="hero-title" style={{ fontSize: 40 }}>성장 기록</h1>
        <p className="hero-desc">완성된 보고서가 아니어도 괜찮아요. 확인한 변화, 막힌 점, 다음에 시도할 일을 자유롭게 적어두세요.</p>
      </header>

      <div className="grid-2">
        <section className="card stack" style={{ gap: 16 }}>
          <div>
            <label className="card-sub" htmlFor="log-date">기록 날짜</label>
            <input id="log-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 220 }} />
          </div>
          <div>
            <label className="card-sub" htmlFor="log-body">이날 내 사이트에서 무엇을 확인했나요?</label>
            <textarea id="log-body" className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="예: Search Console에 사이트맵을 제출했다. 색인 요청 후 상태는 '가져옴'. 내일 다시 확인." />
          </div>
          <div>
            <div className="card-head" style={{ marginBottom: 8 }}>
              <div>
                <strong style={{ fontSize: 14 }}>체크리스트 인용</strong>
                <p className="card-sub">WEEK {pad2(current.week)} · 미완료 우선 — 이 기록과 관련된 항목을 선택해 함께 남겨보세요.</p>
              </div>
            </div>
            {hydrated && pending.length === 0 ? (
              <div className="empty">이번 주 미완료 항목이 없어요.</div>
            ) : (
              <div className="filter-row" style={{ margin: 0 }}>
                {shown.map((i) => (
                  <button key={i.id} className={picked.includes(i.id) ? "on" : ""} onClick={() => toggle(i.id)}>{i.title}</button>
                ))}
                {pending.length > 4 && (
                  <button onClick={() => setShowAll((v) => !v)}>{showAll ? "접기" : `더보기 (${pending.length - 4})`}</button>
                )}
              </div>
            )}
          </div>
          <div>
            <button className="btn btn-primary" onClick={save} disabled={!body.trim()}>성장 기록 저장</button>
          </div>
        </section>

        <section className="card">
          <h2>기록 히스토리</h2>
          <p className="card-sub" style={{ marginBottom: 12 }}>최근 14개의 기록을 보여줍니다.</p>
          {hydrated && history.length === 0 ? (
            <div className="empty">첫 기록을 기다리고 있어요.</div>
          ) : (
            history.map((l) => (
              <div key={l.id} className="log-item">
                <div className="log-date">{l.date}</div>
                <div className="log-body">{l.body}</div>
                {l.checklistItemIds.length > 0 && (
                  <div className="log-tags">
                    {l.checklistItemIds.map((id) => <span key={id} className="chip on">{titleOf(id)}</span>)}
                  </div>
                )}
                <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => update((s) => ({ ...s, logs: s.logs.filter((x) => x.id !== l.id) }))}>삭제</button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
