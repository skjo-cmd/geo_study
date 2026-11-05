"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { PROGRAM } from "@/lib/curriculum";
import { formatWeekLabel } from "@/lib/week";
import { ProgressRing } from "@/components/ProgressRing";
import { Checklist } from "./Checklist";
import { GoalsCard } from "./GoalsCard";
import { LogItem } from "@/components/LogItem";

export function DashboardView() {
  const { ready, workspace, current, selectedWeek, selectedWeekData, completedCount, streak } = useStore();
  const name = workspace.profile.displayName || "게스트";
  const week = selectedWeekData;
  const { done, total } = completedCount(week.number);
  const pct = total === 0 ? 0 : (done / total) * 100;
  const goalsDone = workspace.goals.filter((g) => g.done).length;
  const goalsTotal = workspace.goals.length;
  const recent = workspace.logs.slice(0, 3);

  const remaining = total - done;
  const progressMessage =
    total === 0
      ? "이 주차에는 체크리스트가 없어요."
      : remaining === 0
        ? "이번 주 항목을 모두 완료했어요!"
        : `${remaining}개만 더 완료하면 이번 주 미션 달성`;

  return (
    <>
      <div className="banner">
        <span>지난 4주 동안 무엇이 바뀌었는지 숫자로 돌아보세요.</span>
        <Link href="/stories" className="btn btn-sm">
          나의 성장 회고 보기 →
        </Link>
      </div>

      {!ready ? (
        <div className="empty" aria-busy="true">
          불러오는 중…
        </div>
      ) : (
        <div className="stack">
          <div className="grid-2">
            <section className="card hero" aria-labelledby="hero-title">
              <p className="eyebrow">
                {formatWeekLabel(week.number)} · {week.eyebrow}
              </p>
              <h1 className="hero-title" id="hero-title">
                {name}님,
                <br />
                오늘도 <em>한 걸음</em>.
              </h1>
              <p className="page-lead">{week.intro}</p>
              <div className="hero-meta">
                <span>
                  📅 {week.number}주차 · {week.title}
                </span>
                <span>🎯 {week.goal}</span>
              </div>
              {current.phase === "after" && selectedWeek === current.number && (
                <p className="notice">
                  {PROGRAM.name}의 {current.totalWeeks}주 과정이 끝났어요. 마지막 주차를 보여드려요. 남은 항목을 마무리하고 회고를
                  작성해 보세요.
                </p>
              )}
              {current.phase === "before" && (
                <p className="notice">스터디는 {PROGRAM.startDate}에 시작해요. 그 전에 1주차 가이드를 미리 읽어두면 좋아요.</p>
              )}
              {selectedWeek !== current.number && (
                <p className="notice">
                  지금은 {current.number}주차예요. {week.number}주차 항목을 보고 있어요.
                </p>
              )}
            </section>

            <section className="card progress-card" aria-labelledby="progress-title">
              <h2 className="card-title" id="progress-title">
                이번 주 진행률
              </h2>
              <ProgressRing value={pct} label={`이번 주 진행률 ${Math.round(pct)}%`} />
              <p className="card-sub">{progressMessage}</p>
            </section>
          </div>

          <div className="grid-3">
            <div className="card stat">
              <span className="stat-icon" aria-hidden="true">
                ☑
              </span>
              <div>
                <div className="stat-value">
                  {done}/{total}
                </div>
                <div className="stat-label">이번 주 체크리스트</div>
              </div>
            </div>
            <div className="card stat">
              <span className="stat-icon" aria-hidden="true">
                ◎
              </span>
              <div>
                {/* 목표가 없으면 0/1 같은 가짜 분모를 보여주지 않는다 (결함 4) */}
                <div className="stat-value">{goalsTotal === 0 ? "—" : `${goalsDone}/${goalsTotal}`}</div>
                <div className="stat-label">{goalsTotal === 0 ? "목표를 추가해 보세요" : "완료한 개인 목표"}</div>
              </div>
            </div>
            <div className="card stat">
              <span className="stat-icon" aria-hidden="true">
                🔥
              </span>
              <div>
                <div className="stat-value">{streak}일</div>
                <div className="stat-label">연속 기록</div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="stack">
              <Checklist week={week} />
              <section className="card" aria-labelledby="recent-title">
                <div className="card-head">
                  <div>
                    <h2 className="card-title" id="recent-title">
                      최근 기록
                    </h2>
                    <p className="card-sub">짧게라도 남긴 기록은 다음 실험의 출발점이 돼요.</p>
                  </div>
                  <Link href="/logs" className="btn btn-sm">
                    기록하기 →
                  </Link>
                </div>
                {recent.length === 0 ? (
                  <div className="empty">
                    아직 기록이 없어요.
                    <br />
                    오늘 확인한 변화나 궁금한 점부터 남겨보세요.
                  </div>
                ) : (
                  recent.map((log) => <LogItem key={log.id} log={log} />)
                )}
              </section>
            </div>
            <div className="stack">
              <GoalsCard />
              <section className="card" aria-labelledby="site-title">
                <div className="card-head">
                  <div>
                    <h2 className="card-title" id="site-title">
                      내 사이트 점수
                    </h2>
                    <p className="card-sub">1주차에 기준선을 찍고 4주차에 다시 확인하세요.</p>
                  </div>
                </div>
                <Link href="/site-check" className="btn btn-primary" style={{ width: "100%" }}>
                  사이트 체크하러 가기
                </Link>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
