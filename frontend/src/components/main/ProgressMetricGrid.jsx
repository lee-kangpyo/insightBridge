import { AnimatedPercentBarFill } from '../common/AnimatedPercentBarFill';

const progressColors = {
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  'primary-container': 'bg-primary-container',
};

export default function ProgressMetricGrid({ metrics }) {
  if (!metrics?.length) return null;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
      <h3 className="text-lg font-bold text-primary mb-6">핵심 지표 성과 추이</h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 bg-surface-container-low rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-primary">{metric.label}</span>
              <span className="text-sm font-black text-secondary">
                {metric.current} <span className="text-[10px] text-outline font-normal">/ 목표 {metric.target}</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <AnimatedPercentBarFill
                percent={metric.percentage}
                className={`h-full shrink-0 rounded-full ${progressColors[metric.color] || 'bg-secondary'}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button
          disabled
          className="text-secondary text-xs font-bold flex items-center gap-1 hover:underline cursor-not-allowed opacity-70"
        >
          전체 지표 시계열 분석 보기
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}