export default function CourseSizeDistributionChart({ courseDistribution }) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-headline font-bold text-primary">강좌 규모 분포</h3>
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
          2024 최신 확정치 기준
        </span>
      </div>
      <div className="space-y-4">
        {courseDistribution.map(({ range, count, percentage }) => (
          <div key={range} className="grid grid-cols-[100px_1fr_60px] items-center gap-4">
            <span className="text-[11px] text-slate-500">{range}</span>
            <div className="h-4 bg-surface-container-high rounded-sm overflow-hidden">
              <div
                className="bg-tertiary/70 h-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-[11px] font-bold text-right text-on-surface">
              {count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}