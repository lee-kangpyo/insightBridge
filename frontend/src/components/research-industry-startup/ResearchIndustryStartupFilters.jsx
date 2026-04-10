export default function ResearchIndustryStartupFilters({ filters }) {
  if (!filters) return null;

  const filterList = Object.values(filters);

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {filterList.map((filter, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg border-b-2 border-secondary/20"
        >
          <span className="text-sm font-medium text-on-surface-variant">
            {filter.label}: {filter.value}
          </span>
          <span className="material-symbols-outlined text-xs text-outline">lock</span>
        </div>
      ))}
    </div>
  );
}