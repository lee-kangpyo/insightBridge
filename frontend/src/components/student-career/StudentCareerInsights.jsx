export default function StudentCareerInsights({ insights }) {
  if (!insights?.length) return null;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/10">
      <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-lg">lightbulb</span>
        샘플 인사이트
      </h3>
      <ul className="space-y-4">
        {insights.map((insight, index) => (
          <li key={index} className="flex gap-3">
            <div className="mt-0.5 h-5 w-5 rounded-full bg-primary-fixed/50 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-primary/70">{insight.number}</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-600">{insight.highlight}:</span>{' '}
              {insight.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
