export default function EducationFacultyInsights({ insights }) {
  return (
    <div className="bg-primary text-white p-8 rounded-lg shadow-lg">
      <h3 className="text-lg font-headline font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">lightbulb</span>
        샘플 인사이트
      </h3>
      <ul className="space-y-4 text-sm opacity-90 leading-relaxed">
        {insights.map(({ bullet }, index) => (
          <li key={index} className="flex gap-3">
            <span className="text-tertiary-fixed font-bold">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}