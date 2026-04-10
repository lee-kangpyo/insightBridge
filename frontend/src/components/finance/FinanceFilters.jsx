export default function FinanceFilters({ filters }) {
  if (!filters) return null;

  return (
    <section className="bg-surface-container-low rounded-lg p-4 flex flex-wrap items-center gap-6">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-lg opacity-50">lock</span>
          <span className="text-xs font-bold uppercase tracking-wider font-label">{filter.label}:</span>
          <span className="text-sm font-medium">{filter.value}</span>
        </div>
      ))}
    </section>
  );
}