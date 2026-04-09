export default function DropoutReasonChart({ dropoutReasons }) {
  if (!dropoutReasons?.length) return null;

  return (
    <div className="bg-surface-container-low p-6 rounded-lg">
      <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
        중도탈락 사유 분해
        <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 border border-outline-variant/30 rounded">
          단위: 명
        </span>
      </h3>
      <div className="space-y-3">
        {dropoutReasons.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs mb-0.5">
              <span className="font-medium text-slate-500">{item.reason}</span>
              <span className="font-semibold text-slate-600">{item.count}</span>
            </div>
              <div className="h-2 w-full bg-surface-container-highest/70 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.percentage}%`, backgroundColor: '#E03130' }}
                />
              </div>
          </div>
        ))}
      </div>
    </div>
  );
}
