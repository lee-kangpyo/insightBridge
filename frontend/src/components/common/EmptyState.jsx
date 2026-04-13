export default function EmptyState({
  title = "미공시",
  description = "해당 연도 데이터는 미공시입니다.",
  minHeight = 220,
  icon = "info",
}) {
  return (
    <div
      className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/15 flex items-center justify-center px-6 py-10"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      <div className="text-center max-w-[520px]">
        <div className="mx-auto w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]" aria-hidden>
            {icon}
          </span>
        </div>
        <div className="mt-4 text-base font-extrabold text-on-surface">
          {title}
        </div>
        {description ? (
          <div className="mt-1 text-sm text-on-surface-variant">{description}</div>
        ) : null}
      </div>
    </div>
  );
}
