import { AnimatedPercentBarFill } from '../common/AnimatedPercentBarFill';
import EmptyState from "../common/EmptyState";

export default function CourseSizeDistributionChart({ courseDistribution, title, subtitle }) {
  const heading = title?.trim() ? title : '강좌 규모 분포';
  const sub = subtitle?.trim() ? subtitle : '2024 최신 확정치 기준';

  const rows = Array.isArray(courseDistribution) ? courseDistribution : [];

  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary">{heading}</h3>
          {sub ? (
            <p className="mt-1 text-[10px] text-slate-400 uppercase font-bold tracking-tight">{sub}</p>
          ) : null}
        </div>
      </div>
      {rows.length ? (
        <div className="space-y-4">
          {rows.map(({ range, count, percentage, colorHex }) => (
            <div key={range} className="grid grid-cols-[100px_1fr_60px] items-center gap-4">
              <span className="text-[11px] text-slate-500">{range}</span>
              <div className="h-4 overflow-hidden rounded-sm bg-surface-container-high">
                <AnimatedPercentBarFill
                  percent={percentage}
                  className="h-full shrink-0 bg-tertiary/70"
                  style={colorHex ? { backgroundColor: colorHex } : undefined}
                />
              </div>
              <span className="text-[11px] font-bold text-right text-on-surface">
                {Number(count).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="미공시"
          description="강좌 규모 분포 데이터가 미공시입니다."
          minHeight={220}
          icon="bar_chart"
        />
      )}
    </div>
  );
}