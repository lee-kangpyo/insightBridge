export default function OpportunityBalanceChart({ title, subtitle, opportunityBalance }) {
  if (!opportunityBalance?.length) return null;

  return (
    <div className="bg-surface-container-low p-8 rounded-lg">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="font-headline text-lg font-bold text-primary">
            {title || "기회균형 선발 구성"}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-on-surface-variant">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex bg-white rounded-lg p-1">
          <button className="px-3 py-1 text-[10px] font-bold bg-secondary text-white rounded-md">
            구성비
          </button>
          <button className="px-3 py-1 text-[10px] font-bold text-slate-400 rounded-md">
            인원수
          </button>
        </div>
      </div>
      <div className="flex flex-col h-[200px] justify-between">
        {opportunityBalance.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-600 w-24">{item.category}</span>
            <div className="flex-1 h-8 bg-surface-container rounded-lg overflow-hidden flex">
              <div
                className="bg-primary h-full"
                style={{ width: `${item.ratio}%` }}
              />
              <div
                className="bg-secondary h-full opacity-20"
                style={{ width: `${100 - item.ratio}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary min-w-[3rem] text-right">
              {item.barRatioDisplayText ?? `${item.ratio}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}