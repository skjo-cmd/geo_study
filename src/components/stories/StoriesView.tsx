"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { PROGRAM, allItems } from "@/lib/curriculum";
import { formatWeekLabel } from "@/lib/week";

/**
 * 성장 회고: 이 브라우저에 쌓인 기록으로 회고 초안을 만들어 준다.
 * 다른 회원의 회고를 보여주는 기능(원본 사이트)은 계정·백엔드가 생긴 뒤에 붙인다.
 */
export function StoriesView() {
  const { ready, workspace, completedCount, streak, current } = useStore();
  const { notify } = useToast();

  const summary = useMemo(() => {
    const totalItems = PROGRAM.weeks.reduce((n, w) => n + allItems(w).length, 0);
    const doneItems = PROGRAM.weeks.reduce((n, w) => n + completedCount(w.number).done, 0);
    const notes = workspace.logs.filter((l) => l.kind === "note");
    const checks = workspace.logs.filter((l) => l.kind === "check");
    const activeDays = new Set(workspace.logs.map((l) => l.date)).size;
    const goalsDone = workspace.goals.filter((g) => g.done).length;
    return { totalItems, doneItems, notes, checks, activeDays, goalsDone };
  }, [workspace, completedCount]);

  const draft = useMemo(() => {
    const name = workspace.profile.displayName || "나";
    const lines: string[] = [];
    lines.push(`# ${PROGRAM.name} · ${name}의 성장 회고`);
    lines.push("");
    lines.push(`- 완료한 체크리스트: ${summary.doneItems}/${summary.totalItems}`);
    lines.push(`- 기록한 날: ${summary.activeDays}일 (현재 연속 ${streak}일)`);
    lines.push(`- 성장 기록 ${summary.notes.length}개 · 체크 메모 ${summary.checks.length}개`);
    if (workspace.goals.length > 0) {
      lines.push(`- 목표 달성: ${summary.goalsDone}/${workspace.goals.length}`);
      for (const g of workspace.goals) lines.push(`  - [${g.done ? "x" : " "}] ${g.title}`);
    }
    lines.push("");
    lines.push("## 시도한 것");
    const byWeek = new Map<number, string[]>();
    for (const l of [...workspace.logs].reverse()) {
      if (!l.content) continue;
      const arr = byWeek.get(l.week) ?? [];
      arr.push(l.content.split("\n")[0].slice(0, 120));
      byWeek.set(l.week, arr);
    }
    if (byWeek.size === 0) lines.push("(아직 기록이 없어요. 성장 기록을 남기면 여기에 정리돼요.)");
    for (const [week, items] of [...byWeek.entries()].sort((a, b) => a[0] - b[0])) {
      lines.push(`### ${formatWeekLabel(week)}`);
      for (const i of items) lines.push(`- ${i}`);
    }
    lines.push("");
    lines.push("## 숫자로 본 변화");
    lines.push("- 사이트 체크 점수: 1주차 __/10 → 4주차 __/10");
    lines.push("- 서치콘솔 노출/클릭 (28일): __ → __");
    lines.push("- 색인된 페이지 수: __ → __");
    lines.push("- AI 답변 속 브랜드 언급: 질문 __개 중 __개");
    lines.push("");
    lines.push("## 가장 막혔던 점과 해결");
    lines.push("- ");
    lines.push("");
    lines.push("## 다음 4주에 할 것");
    lines.push("- ");
    return lines.join("\n");
  }, [workspace, summary, streak]);

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">GROWTH STORY</p>
        <h1 className="page-title">나의 성장 회고</h1>
        <p className="page-lead">
          결과만큼 소중한 건 그 결과에 도착하기까지의 과정이에요. 이 브라우저에 쌓인 기록으로 회고 초안을 만들어 드려요. 복사해서
          다듬어 보세요.
        </p>
      </div>

      {!ready ? (
        <div className="empty" aria-busy="true">
          불러오는 중…
        </div>
      ) : (
        <div className="stack">
          <section className="card" aria-labelledby="numbers-title">
            <h2 className="card-title" id="numbers-title" style={{ marginBottom: 12 }}>
              숫자로 먼저 보는 {current.totalWeeks}주
            </h2>
            <div className="retro-grid">
              <div className="retro-stat">
                <b>
                  {summary.doneItems}/{summary.totalItems}
                </b>
                <span>완료한 체크리스트</span>
              </div>
              <div className="retro-stat">
                <b>{summary.activeDays}일</b>
                <span>기록한 날</span>
              </div>
              <div className="retro-stat">
                <b>{summary.notes.length}개</b>
                <span>성장 기록</span>
              </div>
              <div className="retro-stat">
                <b>
                  {workspace.goals.length === 0 ? "—" : `${summary.goalsDone}/${workspace.goals.length}`}
                </b>
                <span>{workspace.goals.length === 0 ? "목표 없음" : "달성한 목표"}</span>
              </div>
            </div>
          </section>

          <section className="card" aria-labelledby="draft-title">
            <div className="card-head">
              <div>
                <h2 className="card-title" id="draft-title">
                  회고 초안
                </h2>
                <p className="card-sub">빈칸(__)은 서치콘솔과 사이트 체크에서 숫자를 찾아 채워주세요.</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(draft);
                    notify("회고 초안을 복사했어요.", "success");
                  } catch {
                    notify("클립보드에 접근할 수 없어요.", "error");
                  }
                }}
              >
                초안 복사
              </button>
            </div>
            <pre className="retro-text">{draft}</pre>
          </section>

          <section className="card" aria-labelledby="howto-title">
            <h2 className="card-title" id="howto-title">
              좋은 회고의 조건
            </h2>
            <ul style={{ margin: "10px 0 0", paddingLeft: 20, color: "var(--muted)" }}>
              <li>숫자는 「전 → 후」로 쓴다. 한 쌍이라도 있으면 회고가 증거가 된다.</li>
              <li>잘 된 것보다 막혔던 것과 그때 내린 판단을 자세히 쓴다. 다음 사람에게 더 유용하다.</li>
              <li>근거가 된 화면(서치콘솔, 사이트 체크)은 캡처해 함께 둔다.</li>
              <li>마지막 줄은 다음 4주의 첫 번째 실험 하나로 끝낸다.</li>
            </ul>
            <div className="dialog-actions" style={{ justifyContent: "flex-start" }}>
              <Link href="/logs" className="btn">
                기록 더 남기기
              </Link>
              <Link href="/info/geo-question-set" className="btn">
                GEO 측정 가이드
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
