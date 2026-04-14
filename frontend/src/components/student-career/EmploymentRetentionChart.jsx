import { AnimatedPercentBarFill } from '../common/AnimatedPercentBarFill';
import EmptyState from "../common/EmptyState";

export default function EmploymentRetentionChart({ employmentRetention }) {
  const rows = Array.isArray(employmentRetention) ? employmentRetention : [];

  return (
    <div className="bg-surface-container-low p-6 rounded-lg flex flex-col">
      <h3 className="text-lg font-bold text-primary mb-6">유지취업률 추이</h3>
      {rows.length ? (
        <div className="flex-grow space-y-6 flex flex-col justify-center py-4">
          {rows.map((item, index) => {
            const opacity = 1 - index * 0.1;
            return (
              <div key={index} className="grid grid-cols-[100px_1fr_60px] items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">{item.stage}</span>
                  <span className="text-[10px] text-outline">총계</span>
                </div>
                <div className="h-5 w-full overflow-hidden rounded-md bg-surface-container-highest">
                  <AnimatedPercentBarFill
                    percent={item.rate}
                    className="h-full shrink-0 rounded-md bg-secondary"
                    style={{ opacity }}
                  />
                </div>
                <span className="text-sm font-bold text-on-surface text-right">{item.rate}%</span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="미공시"
          description="유지취업률 추이 데이터가 미공시입니다."
          minHeight={220}
          icon="timeline"
        />
      )}
    </div>
  );
}
