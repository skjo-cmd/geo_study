"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { Dialog } from "@/components/Dialog";
import { allItems, type ChecklistItem, type Week } from "@/lib/curriculum";
import { formatWeekLabel } from "@/lib/week";

type PendingComplete = { item: ChecklistItem };
type PendingUncomplete = { item: ChecklistItem; hasLog: boolean };

export function Checklist({ week }: { week: Week }) {
  const { isCompleted, completeItem, uncompleteItem, linkedCheckLog, selectWeek, selectedWeek, totalWeeks } = useStore();
  const { notify } = useToast();
  const [pendingComplete, setPendingComplete] = useState<PendingComplete | null>(null);
  const [pendingUncomplete, setPendingUncomplete] = useState<PendingUncomplete | null>(null);
  const [memo, setMemo] = useState("");

  const onRowClick = (item: ChecklistItem) => {
    if (isCompleted(item.id)) {
      // 완료 취소도 확인을 거친다 (결함 3)
      setPendingUncomplete({ item, hasLog: Boolean(linkedCheckLog(item.id)) });
    } else {
      setMemo("");
      setPendingComplete({ item });
    }
  };

  const copyAll = async () => {
    const lines: string[] = [`${formatWeekLabel(week.number)} 체크리스트 · ${week.title}`, ""];
    for (const g of week.groups) {
      lines.push(g.title);
      for (const i of g.items) lines.push(`${isCompleted(i.id) ? "☑" : "☐"} ${i.title}${i.optional ? " (선택)" : ""}`);
      lines.push("");
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n").trim());
      notify("체크리스트를 복사했어요.", "success");
    } catch {
      notify("클립보드에 접근할 수 없어요. 브라우저 권한을 확인해 주세요.", "error");
    }
  };

  const items = allItems(week);

  return (
    <section className="card" aria-labelledby="checklist-title">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="checklist-title">
            이번 주 체크리스트
          </h2>
          <p className="card-sub">완료한 항목을 누르면 짧은 메모와 함께 기록돼요.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="icon-button"
            aria-label={`${formatWeekLabel(week.number)} 체크리스트 전체 복사`}
            title="체크리스트 전체 복사"
            onClick={copyAll}
            disabled={items.length === 0}
          >
            ⧉
          </button>
          <div className="week-nav" role="group" aria-label="주차 이동">
            <button
              type="button"
              className="icon-button"
              aria-label="이전 주차"
              onClick={() => selectWeek(selectedWeek - 1)}
              disabled={selectedWeek <= 1}
            >
              ‹
            </button>
            <span className="week-nav-label" aria-live="polite">
              {formatWeekLabel(week.number)}
            </span>
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
      </div>

      {week.groups.map((group) => (
        <div className="check-group" key={group.id}>
          <h3 className="check-group-title">{group.title}</h3>
          {group.description && <p className="check-group-desc">{group.description}</p>}
          <div role="group" aria-label={group.title}>
            {group.items.map((item) => {
              const done = isCompleted(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  className="check-row"
                  role="checkbox"
                  aria-checked={done}
                  onClick={() => onRowClick(item)}
                >
                  <span className="check-box" aria-hidden="true">
                    {done ? "✓" : ""}
                  </span>
                  <span>
                    <span className="check-title">{item.title}</span>
                    <span className="check-meta">
                      {item.optional && <span>선택</span>}
                      {item.minutes && <span>약 {item.minutes}분</span>}
                      {item.doc && (
                        <Link href={`/info/${item.doc}`} onClick={(e) => e.stopPropagation()}>
                          가이드 보기
                        </Link>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog
        open={pendingComplete !== null}
        title="간단한 기록을 남겨보세요"
        eyebrow="CHECKLIST COMPLETE"
        onClose={() => setPendingComplete(null)}
        initialFocus="textarea"
      >
        {pendingComplete && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              completeItem(pendingComplete.item.id, memo);
              setPendingComplete(null);
              notify("체크 완료 기록을 저장했어요.", "success");
            }}
          >
            <div className="dialog-item">✓ {pendingComplete.item.title}</div>
            <div className="field">
              <label className="field-label" htmlFor="check-memo">
                메모 (선택)
              </label>
              <textarea
                id="check-memo"
                className="textarea"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="확인한 내용이나 다음에 할 일을 짧게 적어보세요."
                maxLength={2000}
              />
            </div>
            <p className="card-sub">메모를 비워도 완료했다는 사실은 기록에 남아요.</p>
            <div className="dialog-actions">
              <button type="button" className="btn" onClick={() => setPendingComplete(null)}>
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                체크하기
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog
        open={pendingUncomplete !== null}
        title="완료를 취소할까요?"
        eyebrow="UNCHECK"
        onClose={() => setPendingUncomplete(null)}
      >
        {pendingUncomplete && (
          <>
            <div className="dialog-item">{pendingUncomplete.item.title}</div>
            <p className="card-sub">
              {pendingUncomplete.hasLog
                ? "이 항목을 완료할 때 남긴 기록이 있어요. 기록은 남기고 완료 상태만 되돌릴 수도 있어요."
                : "완료 상태만 되돌려요. 진행률에 바로 반영돼요."}
            </p>
            <div className="dialog-actions">
              <button type="button" className="btn" onClick={() => setPendingUncomplete(null)}>
                그대로 두기
              </button>
              {pendingUncomplete.hasLog && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    uncompleteItem(pendingUncomplete.item.id, true);
                    setPendingUncomplete(null);
                    notify("완료 상태와 연결된 기록을 삭제했어요.");
                  }}
                >
                  기록도 삭제
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  uncompleteItem(pendingUncomplete.item.id, false);
                  setPendingUncomplete(null);
                  notify(pendingUncomplete.hasLog ? "완료 상태를 되돌렸어요. 기록은 남아 있어요." : "완료 상태를 되돌렸어요.");
                }}
              >
                완료만 취소
              </button>
            </div>
          </>
        )}
      </Dialog>
    </section>
  );
}
