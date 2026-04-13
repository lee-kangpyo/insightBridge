import { AnimatedPercentBarFill } from '../common/AnimatedPercentBarFill';
import EmptyState from "../common/EmptyState";

/**
 * @param {object} props
 * @param {Array<{label:string,current:number,target:number,unit:string}>} [props.startupProgress] — 샘플/폴백
 * @param {Array<{label:string,percentage:number,valueCaption:string}>} [props.overrideProgress] — undefined: startupProgress 사용. 배열: DB 행만(빈 배열이면 null)
 */
export default function TechStartupProgressChart({
  startupProgress,
  title,
  subtitle,
  overrideProgress,
}) {
  const heading = title?.trim() ? title : '기술이전 및 창업 성과 지표';
  const sub = subtitle?.trim() ? subtitle : '';

  const rows =
    overrideProgress !== undefined
      ? overrideProgress
      : Array.isArray(startupProgress)
        ? startupProgress.map((item) => ({
            kind: 'legacy',
            label: item.label,
            percentage: item.target > 0 ? Math.min(100, (item.current / item.target) * 100) : 0,
            current: item.current,
            target: item.target,
            unit: item.unit,
          }))
        : [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm border border-outline-variant/10">
        <div className="mb-8">
          <h3 className="text-xl font-bold font-headline text-primary">{heading}</h3>
          {sub ? <p className="mt-1 text-xs text-on-surface-variant">{sub}</p> : null}
        </div>
        <EmptyState
          title="미공시"
          description="기술이전 및 창업 성과 지표 데이터가 미공시입니다."
          minHeight={220}
          icon="stacked_line_chart"
        />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm border border-outline-variant/10">
      <div className="mb-8">
        <h3 className="text-xl font-bold font-headline text-primary">{heading}</h3>
        {sub ? <p className="mt-1 text-xs text-on-surface-variant">{sub}</p> : null}
      </div>
      <div className="space-y-6">
        {rows.map((item) => {
          const pct = Math.min(100, Math.max(0, Number(item.percentage) || 0));
          const isLegacy = item.kind === 'legacy';
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-on-surface-variant">{item.label}</span>
                <span className="font-bold text-secondary text-right">
                  {isLegacy ? (
                    <>
                      {item.current}
                      {item.unit}{' '}
                      <span className="text-xs font-normal text-outline">
                        / {item.target}
                        {item.unit}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm">{item.valueCaption}</span>
                  )}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                <AnimatedPercentBarFill
                  percent={pct}
                  className="h-full shrink-0 rounded-full bg-secondary"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 pt-8 border-t border-outline-variant/10">
        <div className="bg-primary-container/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary">lightbulb</span>
            <span className="font-bold text-primary">Insight</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            기술이전 건수는 목표치에 근접했으나, 학생 창업 활성화를 위한 추가 지원 프로그램이 필요해 보입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
