"use client";

import { useMemo, useState } from "react";
import { useStore, type LogEntry } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { Dialog } from "@/components/Dialog";
import { LogItem } from "@/components/LogItem";
import { allItems } from "@/lib/curriculum";
import { formatWeekLabel, todayISO } from "@/lib/week";

const HISTORY_LIMIT = 30;

export function LogsView() {
  const { ready, workspace, selectedWeek, selectedWeekData, selectWeek, totalWeeks, isCompleted, addLog, updateLog, removeLog } =
    useStore();
  const { notify } = useToast();

  const [date, setDate] = useState(() => todayISO());
  const [content, setContent] = useState("");
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState<LogEntry | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");
  const [deleting, setDeleting] = useState<LogEntry | null>(null);

  // 대시보드와 같은 selectedWeek 를 인용한다 (결함 2)
  const items = useMemo(() => allItems(selectedWeekData), [selectedWeekData]);
  const sorted = useMemo(() => {
    const pending = items.filter((i) => !isCompleted(i.id));
    const done = items.filter((i) => isCompleted(i.id));
    return [...pending, ...done];
  }, [items, isCompleted]);
  const visible = showAll ? sorted : sorted.slice(0, 4);

  const toggleItem = (id: string) => setItemIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const history = workspace.logs.slice(0, HISTORY_LIMIT);

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">GROWTH JOURNAL</p>
        <h1 className="page-title">성장 기록</h1>
        <p className="page-lead">
          완성된 보고서가 아니어도 괜찮아요. 확인한 변화, 막힌 점, 다음에 시도할 일을 자유롭게 적어두세요.
        </p>
      </div>

      <div className="grid-2">
        <section className="card" aria-labelledby="log-form-title">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!content.trim()) return;
              addLog({ date, content, itemIds, week: selectedWeek });
              setContent("");
              setItemIds([]);
              notify("성장 기록을 이 브라우저에 저장했어요.", "success");
            }}
          >
            <div className="card-head">
              <div>
                <h2 className="card-title" id="log-form-title">
                  {date} 기록
                </h2>
                <p className="card-sub">이날 내 사이트에서 무엇을 확인했나요?</p>
              </div>
              <div className="week-nav" role="group" aria-label="기록할 주차">
                <button
                  type="button"
                  className="icon-button"
                  aria-label="이전 주차"
                  onClick={() => selectWeek(selectedWeek - 1)}
                  disabled={selectedWeek <= 1}
                >
                  ‹
                </button>
                <span className="week-nav-label">{formatWeekLabel(selectedWeek)}</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="다음 주차"
                  onClick={() => selectWeek(selectedWeek + 1)}
                  disabled={selectedWeek >= totalWeeks}
                >
                  ›
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="log-date">
                날짜
              </label>
              <input id="log-date" type="date" className="input" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="log-content">
                내용
              </label>
              <textarea
                id="log-content"
                className="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={5000}
                placeholder="예: 서치콘솔에서 처음으로 노출된 검색어를 확인했다. 내일은 해당 페이지의 제목과 설명을 더 명확하게 수정할 예정이다."
              />
            </div>

            <div className="field">
              <span className="field-label">
                체크리스트 인용 · {formatWeekLabel(selectedWeek)} · 미완료 우선
              </span>
              <div className="chip-list">
                {visible.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="chip"
                    aria-pressed={itemIds.includes(item.id)}
                    onClick={() => toggleItem(item.id)}
                  >
                    {isCompleted(item.id) ? "✓ " : ""}
                    {item.title}
                  </button>
                ))}
                {sorted.length > 4 && (
                  <button type="button" className="chip" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll}>
                    {showAll ? "접기" : `더보기 (${sorted.length - 4})`}
                  </button>
                )}
              </div>
            </div>

            <div className="dialog-actions">
              <button type="submit" className="btn btn-primary" disabled={!ready || !content.trim()}>
                성장 기록 저장
              </button>
            </div>
          </form>
        </section>

        <section className="card" aria-labelledby="history-title">
          <div className="card-head">
            <div>
              <h2 className="card-title" id="history-title">
                기록 히스토리
              </h2>
              <p className="card-sub">최근 {HISTORY_LIMIT}개까지 보여드려요. 전체 {workspace.logs.length}개</p>
            </div>
          </div>
          {!ready ? (
            <div className="empty" aria-busy="true">
              불러오는 중…
            </div>
          ) : history.length === 0 ? (
            <div className="empty">첫 기록을 기다리고 있어요.</div>
          ) : (
            history.map((log) => (
              <LogItem
                key={log.id}
                log={log}
                onCopy={async (l) => {
                  try {
                    await navigator.clipboard.writeText(l.content);
                    notify("기록을 복사했어요.", "success");
                  } catch {
                    notify("클립보드에 접근할 수 없어요.", "error");
                  }
                }}
                onEdit={(l) => {
                  setEditing(l);
                  setEditContent(l.content);
                  setEditDate(l.date);
                }}
                onDelete={(l) => setDeleting(l)}
              />
            ))
          )}
        </section>
      </div>

      <Dialog open={editing !== null} title="기록 수정" eyebrow="EDIT" onClose={() => setEditing(null)} initialFocus="textarea">
        {editing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateLog(editing.id, { content: editContent.trim(), date: editDate });
              setEditing(null);
              notify("기록을 수정했어요.", "success");
            }}
          >
            <div className="field">
              <label className="field-label" htmlFor="edit-date">
                날짜
              </label>
              <input id="edit-date" type="date" className="input" value={editDate} max={todayISO()} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="edit-content">
                내용
              </label>
              <textarea id="edit-content" className="textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} maxLength={5000} />
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn" onClick={() => setEditing(null)}>
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                저장
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={deleting !== null} title="이 기록을 삭제할까요?" eyebrow="DELETE" onClose={() => setDeleting(null)}>
        {deleting && (
          <>
            <p className="card-sub">
              {deleting.kind === "check" ? "체크 완료 상태는 그대로 남고 기록만 삭제돼요." : "삭제한 기록은 되돌릴 수 없어요."}
            </p>
            <div className="dialog-actions">
              <button type="button" className="btn" onClick={() => setDeleting(null)}>
                취소
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  removeLog(deleting.id);
                  setDeleting(null);
                  notify("기록을 삭제했어요.");
                }}
              >
                삭제
              </button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
