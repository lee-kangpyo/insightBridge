function isLegacyInsightShape(insights) {
  const first = insights?.[0];
  return Boolean(first && typeof first.highlight === 'string');
}

export default function StudentCareerInsights({ title, insights }) {
  if (!insights?.length) return null;

  const legacy = isLegacyInsightShape(insights);
  const resolvedTitle = (title || '인사이트').trim() || '인사이트';

  return (
    <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/10">
      <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-lg">
          lightbulb
        </span>
        {resolvedTitle}
      </h3>
      <ul className="space-y-4">
        {legacy
          ? insights.map((insight, index) => (
              <li key={index} className="flex gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-primary-fixed/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-primary/70">{insight.number}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-medium text-slate-600">{insight.highlight}:</span> {insight.text}
                </p>
              </li>
            ))
          : insights.map((insight, index) => (
              <li key={index} className="flex gap-3 items-start">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-primary-fixed/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-primary/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p
                  className="text-sm text-slate-500 leading-relaxed flex-1"
                  dangerouslySetInnerHTML={{ __html: insight.text }}
                />
              </li>
            ))}
      </ul>
    </div>
  );
}
