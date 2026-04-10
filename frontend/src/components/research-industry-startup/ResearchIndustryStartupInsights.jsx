export default function ResearchIndustryStartupInsights({ insights }) {
  if (!insights?.length) return null;

  return (
    <div className="bg-primary text-white p-8 rounded-lg shadow-xl">
      <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">analytics</span>
        인사이트
      </h3>
      <ul className="space-y-4">
        {insights.map((item, index) => {
          if (item?.text != null && item.text !== '') {
            return (
              <li key={index} className="flex gap-3">
                <span className="text-secondary-fixed mt-1">●</span>
                <p
                  className="text-sm text-primary-fixed leading-relaxed flex-1"
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </li>
            );
          }
          if (item?.bullet != null && item.bullet !== '') {
            return (
              <li key={index} className="flex gap-3">
                <span className="text-secondary-fixed mt-1">●</span>
                <p className="text-sm text-primary-fixed leading-relaxed">{item.bullet}</p>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
}