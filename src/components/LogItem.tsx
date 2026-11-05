"use client";

import { findItem, PROGRAM } from "@/lib/curriculum";
import type { LogEntry } from "@/lib/store";
import { formatWeekLabel } from "@/lib/week";

export function LogItem({
  log,
  onEdit,
  onDelete,
  onCopy,
}: {
  log: LogEntry;
  onEdit?: (log: LogEntry) => void;
  onDelete?: (log: LogEntry) => void;
  onCopy?: (log: LogEntry) => void;
}) {
  const linked = log.itemIds.map((id) => findItem(PROGRAM, id)?.item.title).filter(Boolean) as string[];
  return (
    <article className="log-item">
      <div className="log-head">
        <span className="pill pill-muted">{log.date}</span>
        <span className={`pill ${log.kind === "check" ? "pill-success" : ""}`}>{log.kind === "check" ? "체크 완료" : "성장 기록"}</span>
        <span className="spacer" />
        <span className="eyebrow">{formatWeekLabel(log.week)}</span>
        {(onEdit || onDelete || onCopy) && (
          <span className="log-actions">
            {onCopy && (
              <button type="button" className="link-button" onClick={() => onCopy(log)} aria-label="기록 본문 복사">
                복사
              </button>
            )}
            {onEdit && (
              <button type="button" className="link-button" onClick={() => onEdit(log)}>
                수정
              </button>
            )}
            {onDelete && (
              <button type="button" className="link-button danger" onClick={() => onDelete(log)}>
                삭제
              </button>
            )}
          </span>
        )}
      </div>
      {log.content ? <p className="log-body">{log.content}</p> : <p className="log-body" style={{ color: "var(--faint)" }}>(메모 없음)</p>}
      {linked.length > 0 && (
        <div className="log-tags">
          {linked.map((t) => (
            <span key={t} className="pill">
              ✓ {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
