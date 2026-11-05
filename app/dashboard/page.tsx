"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProgressRing from "@/components/ProgressRing";
import { getWeek, resolveCurrentWeek, TOTAL_WEEKS, weekKey, pad2, PROGRAM } from "@/lib/program";
import { useGuestState, uid, computeStreak } from "@/lib/guestStore";

export default function DashboardPage() {
  const { state, update, hydrated } = useGuestState();
  const current = useMemo(() => resolveCurrentWeek(), []);
  const [viewWeek, setViewWeek] = useState(current.week);
  const week = getWeek(viewWeek);

  const done = new Set(state.completedItemsByWeek[weekKey(viewWeek)] ?? []);
  const total = week.items.length;
  const doneCount = week.items.filter((i) => done.has(i.id)).length;
  const percent = total ? (doneCount / total) * 100 : 0;
  const goalsDone = state.goals.filter((g) => g.done).length;
  const streak = computeStreak(state.logs);
  const recentLogs = [...state.logs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);

  const toggleItem = (id: string) =>
    update((s) => {
      const k = weekKey(viewWeek);
      const cur = new Set(s.completedItemsByWeek[k] ?? []);
      cur.has(id) ? cur.delete(id) : cur.add(id);
      return { ...s, completedItemsByWeek: { ...s.completedItemsByWeek, [k]: [...cur] } };
    });

  const [goalText, setGoalText] = useState("");
  const addGoal = () => {
    const t = goalText.trim();
    if (!t) return;
    update((s) => ({ ...s, goals: [...s.goals, { id: uid(), title: t, done: false, createdAt: new Date().toISOString() }] }));
    setGoalText("");
  };

  const mainItems = week.items.filter((i) => i.category !== "research");
  const researchItems = week.items.filter((i) => i.category === "research");

  const statusLine =
    current.status === "finished"
      ? `${TOTAL_WEEKS}주 과정이 끝났어요. 마지막 주차 체크리스트를 다시 돌아보거나 기록을 정리해 보세요.`
      : current.status === "before"
        ? "아직 과정 시작 전이에요. 1주차 내용을 미리 살펴볼 수 있어요."
        : "이번 주는 내 사이트의 현재 위치를 확인하는 시간이에요. 작은 기록이 4주 뒤 선명한 성장의 증거가 돼요.";

  return (
    <div className="stack">
      <div className="grid-2">
        <section className="card">
          <div className="eyebrow">
            WEEK {pad2(current.week)} · {PROGRAM.phaseLabel}
            {current.status === "finished" && " · 완료"}
          </div>
          <h1 className="hero-title">
            게스트님,
            <br />
            오늘도 <span className="hl">한 걸음</span>.
          </h1>
          <p className="hero-desc">{statusLine}</p>
          <div className="hero-meta">
            <span>
              ▦ <strong>{current.week}주차</strong> · {getWeek(current.week).title}
            </span>
            <span>◎ {PROGRAM.goal}</span>
          </div>
        </section>

        <aside className="card" aria-label={`이번 주 진행률 ${Math.round(percent)}%`}>
          <h2>이번 주 진행률</h2>
          <ProgressRing percent={percent} />
          <p className="progress-note">
            {total === 0
              ? "이 주차 체크리스트를 준비 중이에요."
              : doneCount === total
                ? "이번 주 미션을 모두 달성했어요!"
                : `${total - doneCount}개만 더 완료하면 이번 주 미션 달성`}
          </p>
        </aside>
      </div>

      <div className="grid-3">
        <div className="card kpi">
          <div className="kpi-icon">☑</div>
          <div>
            <strong>{doneCount}/{total}</strong>
            <span>이번 주 체크리스트</span>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-icon">◎</div>
          <div>
            <strong>{goalsDone}/{state.goals.length}</strong>
            <span>완료한 개인 목표</span>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-icon">🔥</div>
          <div>
            <strong>{streak}일</strong>
            <span>연속 기록</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>이번 주 체크리스트</h2>
                <p className="card-sub">완료한 항목을 바로 체크해 주세요.</p>
              </div>
              <div className="week-nav" aria-label="체크리스트 주차 선택">
                <button aria-label="이전 주차" disabled={viewWeek <= 1} onClick={() => setViewWeek((w) => w - 1)}>‹</button>
                <strong>WEEK {pad2(viewWeek)}</strong>
                <button aria-label="다음 주차" disabled={viewWeek >= TOTAL_WEEKS} onClick={() => setViewWeek((w) => w + 1)}>›</button>
              </div>
            </div>
            <p className="card-sub" style={{ marginBottom: 14 }}>{week.title}</p>
            {!hydrated ? null : total === 0 ? (
              <div className="empty">이 주차의 체크리스트는 아직 준비 중이에요.</div>
            ) : (
              <div className="check-list">
                {mainItems.map((it) => (
                  <button key={it.id} className={`check-item ${done.has(it.id) ? "done" : ""}`} onClick={() => toggleItem(it.id)} aria-pressed={done.has(it.id)}>
                    <span className="check-box">{done.has(it.id) ? "✓" : ""}</span>
                    <span>
                      <div className="check-title">{it.title}</div>
                      {(it.time || it.isNew) && (
                        <div className="check-meta">
                          {it.time && <span>⏱ {it.time}</span>}
                          {it.isNew && <span className="chip new">NEW</span>}
                        </div>
                      )}
                    </span>
                  </button>
                ))}
                {researchItems.length > 0 && (
                  <>
                    <div className="check-group-label">리서치 · 개념 정리</div>
                    {researchItems.map((it) => (
                      <button key={it.id} className={`check-item ${done.has(it.id) ? "done" : ""}`} onClick={() => toggleItem(it.id)} aria-pressed={done.has(it.id)}>
                        <span className="check-box">{done.has(it.id) ? "✓" : ""}</span>
                        <span>
                          <div className="check-title">{it.title}</div>
                          {it.isNew && <div className="check-meta"><span className="chip new">NEW</span></div>}
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>최근 기록</h2>
                <p className="card-sub">짧게라도 남긴 기록은 다음 실험의 출발점이 돼요.</p>
              </div>
              <Link href="/logs" className="btn btn-sm">기록하기 →</Link>
            </div>
            {hydrated && recentLogs.length === 0 ? (
              <div className="empty">아직 기록이 없어요.<br />오늘 확인한 변화나 궁금한 점부터 남겨보세요.</div>
            ) : (
              recentLogs.map((l) => (
                <div key={l.id} className="log-item">
                  <div className="log-date">{l.date}</div>
                  <div className="log-body">{l.body.length > 160 ? l.body.slice(0, 160) + "…" : l.body}</div>
                </div>
              ))
            )}
          </section>
        </div>

        <section className="card">
          <h2>개인 목표</h2>
          <p className="card-sub" style={{ marginBottom: 14 }}>이번 스터디에서 꼭 이루고 싶은 것을 적어두세요.</p>
          <div className="goal-row">
            <input
              className="input"
              aria-label="새 목표"
              placeholder="예: 검색 유입 10% 늘리기"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
            />
            <button className="btn btn-primary" onClick={addGoal}>추가</button>
          </div>
          {hydrated && state.goals.length === 0 ? (
            <div className="empty">아직 목표가 없어요.</div>
          ) : (
            <div className="stack" style={{ gap: 8 }}>
              {state.goals.map((g) => (
                <div key={g.id} className={`goal-item ${g.done ? "done" : ""}`}>
                  <input
                    type="checkbox"
                    checked={g.done}
                    aria-label={`${g.title} 완료`}
                    onChange={() => update((s) => ({ ...s, goals: s.goals.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)) }))}
                  />
                  <span>{g.title}</span>
                  <button className="x" aria-label="목표 삭제" onClick={() => update((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== g.id) }))}>×</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
