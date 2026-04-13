export default function InsightsPanel({ title, items, loading }) {
  const resolvedTitle = (title || "인사이트").trim() || "인사이트";
  if (loading) {
    return (
      <div className="bg-primary p-8 rounded-xl shadow-[0_12px_32px_rgba(24,28,30,0.06)] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-8xl">lightbulb</span>
        </div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary-fixed">auto_awesome</span>
          {resolvedTitle}
        </h3>
        <p className="text-sm text-secondary-fixed-dim relative z-10">인사이트를 불러오는 중…</p>
      </div>
    );
  }

  if (!items?.length) return null;

  return (
    <div className="bg-primary p-8 rounded-xl shadow-[0_12px_32px_rgba(24,28,30,0.06)] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="material-symbols-outlined text-8xl">lightbulb</span>
      </div>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary-fixed">auto_awesome</span>
        {resolvedTitle}
      </h3>
      <ul className="space-y-4 text-sm leading-relaxed relative z-10">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 items-start">
            <span className="text-secondary-fixed font-bold shrink-0">•</span>
            <span
              className="text-secondary-fixed-dim flex-1"
              dangerouslySetInnerHTML={{ __html: item.text }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}