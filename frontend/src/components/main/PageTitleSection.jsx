export default function PageTitleSection({
  title,
  subtitle,
  baseYear,
  baseYearOptions,
  onBaseYearChange,
  showSummaryJudgment,
  showSummaryJudgment = false,
  summaryJudgmentTitle,
  summaryJudgmentSubtitle,
}) {
  const yearOptions = Array.isArray(baseYearOptions) ? baseYearOptions : null;
  const canToggleYear =
    yearOptions &&
    yearOptions.length > 1 &&
    typeof onBaseYearChange === "function" &&
    baseYear != null &&
    baseYear !== "";

  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">
          {title || ""}
        </h1>
        {subtitle && (
          <p className="text-secondary font-bold text-xs tracking-widest uppercase mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        {baseYear && (
          <div className="bg-surface-container-low px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">
              calendar_today
            </span>
            <span className="whitespace-nowrap">기준연도</span>
            {canToggleYear ? (
              <label className="relative">
                <span className="sr-only">기준연도 선택</span>
                <select
                  value={String(baseYear)}
                  onChange={(e) => onBaseYearChange(Number(e.target.value))}
                  className={[
                    "appearance-none bg-surface-container-highest",
                    "border border-outline-variant/40 rounded-md",
                    "pl-3 pr-9 py-1.5",
                    "text-xs font-extrabold tracking-wide tabular-nums text-on-surface",
                    "hover:bg-surface-container-high",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-low",
                  ].join(" ")}
                >
                  {yearOptions.map((y) => (
                    <option key={String(y)} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base leading-none">
                    expand_more
                  </span>
                </span>
              </label>
            ) : (
              <span className="font-extrabold text-primary tabular-nums">
                {baseYear}
              </span>
            )}
          </div>
        )}
        {showSummaryJudgment && (
          <div className="bg-primary text-white px-5 py-2 rounded-lg shadow-lg shadow-primary/20 text-left">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-sm mt-0.5">
                summarize
              </span>
              <div className="leading-tight min-w-0">
                <div className="text-sm font-bold">{summaryJudgmentTitle}</div>
                {summaryJudgmentSubtitle ? (
                  <div className="text-[11px] font-medium text-white/80 mt-0.5 whitespace-pre-wrap break-words">
                    {summaryJudgmentSubtitle}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
