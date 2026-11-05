export default function ProgressRing({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className="progress-ring"
      style={{ ["--progress" as string]: p }}
      data-label={`${p}%`}
      role="img"
      aria-label={`이번 주 진행률 ${p}%`}
    />
  );
}
