import { AnimatedPercentBarFill } from '../common/AnimatedPercentBarFill';
import EmptyState from "../common/EmptyState";

export default function DropoutReasonChart({ dropoutReasons }) {
  const rows = Array.isArray(dropoutReasons) ? dropoutReasons : [];

  return (
    <div className="bg-surface-container-low p-6 rounded-lg">
      <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
        중도탈락 사유 분해
        <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 border border-outline-variant/30 rounded">
          단위: 명
        </span>
      </h3>
      {rows.length ? (
        <div className="space-y-3">
          {rows.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-medium text-slate-500">{item.reason}</span>
                <span className="font-semibold text-slate-600">{item.count}</span>
              </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest/70">
                  <AnimatedPercentBarFill
                    percent={item.percentage}
                    className="h-full shrink-0 rounded-full"
                    style={{ backgroundColor: '#E03130' }}
                  />
                </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="미공시"
          description="중도탈락 사유 데이터가 미공시입니다."
          minHeight={200}
          icon="bar_chart"
        />
      )}
    </div>
  );
}
