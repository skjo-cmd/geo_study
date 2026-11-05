"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

export function GoalsCard() {
  const { workspace, addGoal, toggleGoal, removeGoal } = useStore();
  const { notify } = useToast();
  const [draft, setDraft] = useState("");

  return (
    <section className="card" aria-labelledby="goals-title">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="goals-title">
            나의 목표
          </h2>
          <p className="card-sub">이번 스터디에서 꼭 이루고 싶은 것. 숫자로 적을수록 좋아요.</p>
        </div>
      </div>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          addGoal(draft);
          setDraft("");
          notify("목표를 추가했어요.", "success");
        }}
      >
        <input
          className="input"
          aria-label="새 목표"
          placeholder="예: 서치콘솔 노출 주 100회 → 300회"
          value={draft}
          maxLength={80}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
          추가
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        {workspace.goals.length === 0 ? (
          <div className="empty">아직 목표가 없어요. 4주 뒤 확인할 수 있는 목표 하나를 적어보세요.</div>
        ) : (
          workspace.goals.map((g) => (
            <div className="goal-row" key={g.id}>
              <button
                type="button"
                className="check-row"
                role="checkbox"
                aria-checked={g.done}
                onClick={() => toggleGoal(g.id)}
                style={{ flex: 1 }}
              >
                <span className="check-box" aria-hidden="true">
                  {g.done ? "✓" : ""}
                </span>
                <span className="check-title">{g.title}</span>
              </button>
              <button
                type="button"
                className="link-button danger"
                aria-label={`목표 삭제: ${g.title}`}
                onClick={() => {
                  removeGoal(g.id);
                  notify("목표를 삭제했어요.");
                }}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
