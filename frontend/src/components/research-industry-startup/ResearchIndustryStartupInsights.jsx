export default function ResearchIndustryStartupInsights({ insights }) {
  return (
    <div className="bg-primary text-white p-8 rounded-lg shadow-xl">
      <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">analytics</span>
        주요 연구 성과 요약
      </h3>
      <ul className="space-y-4">
        {insights.map(({ bullet }, index) => (
          <li key={index} className="flex gap-3">
            <span className="text-secondary-fixed mt-1">●</span>
            <p className="text-sm text-primary-fixed leading-relaxed">{bullet}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}