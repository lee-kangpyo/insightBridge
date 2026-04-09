export default function EmploymentRetentionChart({ employmentRetention }) {
  if (!employmentRetention?.length) return null;

  return (
    <div className="bg-surface-container-low p-6 rounded-lg flex flex-col">
      <h3 className="text-lg font-bold text-primary mb-6">유지취업률 추이</h3>
      <div className="flex-grow space-y-6 flex flex-col justify-center py-4">
        {employmentRetention.map((item, index) => {
          const opacity = 1 - index * 0.1;
          return (
            <div key={index} className="grid grid-cols-[100px_1fr_60px] items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface">{item.stage}</span>
                <span className="text-[10px] text-outline">총계</span>
              </div>
              <div className="h-5 w-full bg-surface-container-highest rounded-md overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-md transition-all duration-500"
                  style={{ width: `${item.rate}%`, opacity }}
                />
              </div>
              <span className="text-sm font-bold text-on-surface text-right">{item.rate}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
