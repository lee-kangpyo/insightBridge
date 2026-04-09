export default function EnrollmentRateChart({ enrollmentRates }) {
  if (!enrollmentRates?.length) return null;

  return (
    <div className="bg-surface-container-low p-8 rounded-lg relative overflow-hidden group">
      <div className="flex justify-between items-center mb-10">
        <h3 className="font-headline text-lg font-bold text-primary">전형별 최종등록률</h3>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
      <div className="space-y-6">
        {enrollmentRates.map((rate, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600">{rate.type}</span>
              <span className="text-primary">{rate.currentYear}%</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-1000"
                style={{ width: `${rate.currentYear}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-[10px] font-bold text-slate-500">당해년도</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-outline-variant/40" />
          <span className="text-[10px] font-bold text-slate-500">전년도</span>
        </div>
      </div>
    </div>
  );
}