export default function EducationFacultyInsights({ title, insights }) {
  if (!insights?.length) return null;

  const resolvedTitle = (title || '인사이트').trim() || '인사이트';

  return (
    <div className="bg-primary text-white p-8 rounded-lg shadow-lg">
      <h3 className="text-lg font-headline font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">lightbulb</span>
        {resolvedTitle}
      </h3>
      <ul className="space-y-4 text-sm opacity-90 leading-relaxed">
        {insights.map((item, index) => {
          if (item?.text != null && item.text !== '') {
            return (
              <li key={index} className="flex gap-3">
                <span className="text-tertiary-fixed font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              </li>
            );
          }
          if (item?.bullet != null && item.bullet !== '') {
            return (
              <li key={index} className="flex gap-3">
                <span className="text-tertiary-fixed font-bold">•</span>
                <span>{item.bullet}</span>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
}