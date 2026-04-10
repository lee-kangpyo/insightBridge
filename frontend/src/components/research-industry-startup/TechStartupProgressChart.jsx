export default function TechStartupProgressChart({ startupProgress }) {
  return (
    <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm border border-outline-variant/10">
      <h3 className="text-xl font-bold font-headline text-primary mb-8">기술이전 및 창업 성과 지표</h3>
      <div className="space-y-6">
        {startupProgress.map((item) => {
          const percentage = (item.current / item.target) * 100;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-on-surface-variant">{item.label}</span>
                <span className="font-bold text-secondary">
                  {item.current}{item.unit} <span className="text-xs font-normal text-outline">/ {item.target}{item.unit}</span>
                </span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
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