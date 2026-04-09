export default function AdmissionInsights({ insights }) {
  if (!insights?.length) return null;

  return (
    <div className="lg:col-span-1 bg-surface-container-lowest p-8 rounded-lg shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-secondary">tips_and_updates</span>
        <h3 className="font-headline text-lg font-bold text-primary">샘플 인사이트</h3>
      </div>
      <ul className="space-y-4">
        {insights.map((insight, index) => (
          <li key={index} className="flex gap-3 items-start">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
            <p
              className="text-sm text-on-surface-variant leading-relaxed"
              dangerouslySetInnerHTML={{ __html: insight.text }}
            />
          </li>
        ))}
      </ul>
      <button
        className="mt-8 w-full py-3 border border-outline-variant/30 rounded-lg text-xs font-bold text-secondary hover:bg-slate-50 transition-colors disabled:opacity-50"
        disabled
      >
        상세 분석 리포트 다운로드
      </button>
    </div>
  );
}