export default function PageTitleSection({
  title,
  subtitle,
  baseYear,
  showSummaryJudgment = false,
  summaryJudgmentTitle,
  summaryJudgmentSubtitle,
}) {
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
          <div className="bg-surface-container-low px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              calendar_today
            </span>
            기준연도: {baseYear}
          </div>
        )}
        {showSummaryJudgment && (
          <div className="bg-primary text-white px-5 py-2 rounded-lg shadow-lg shadow-primary/20 text-left">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-sm mt-0.5">
                summarize
              </span>
              <div className="leading-tight min-w-0">
                <div className="text-sm font-bold">
                  {summaryJudgmentTitle}
                </div>
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
