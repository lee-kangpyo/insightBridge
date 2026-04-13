import { AnimatedPercentBarFill } from "../common/AnimatedPercentBarFill";
import EmptyState from "../common/EmptyState";

export default function EnrollmentRateChart({ title, subtitle, enrollmentRates }) {
  const rows = Array.isArray(enrollmentRates) ? enrollmentRates : [];

  return (
    <div className="bg-surface-container-low p-8 rounded-lg relative overflow-hidden group">
      <div className="flex justify-between items-start mb-10 gap-4">
        <div>
          <h3 className="font-headline text-lg font-bold text-primary">
            {title || "전형별 최종등록률"}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-on-surface-variant">{subtitle}</p>
          ) : null}
        </div>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
      {rows.length ? (
        <div className="space-y-6">
          {rows.map((rate, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">{rate.type}</span>
                <span className="text-primary">{rate.currentYear}%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <AnimatedPercentBarFill
                  percent={rate.currentYear}
                  className="h-full rounded-full bg-secondary"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="미공시"
          description="전형별 최종등록률 데이터가 미공시입니다."
          minHeight={240}
          icon="bar_chart"
        />
      )}
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