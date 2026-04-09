export default function StudentCareerFilters({ filters }) {
  if (!filters) return null;

  const filterList = Object.values(filters);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-container-low rounded-lg mb-8">
      {filterList.map((filter, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest rounded-full"
        >
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
            {filter.label}
          </span>
          <span className="text-sm font-medium text-slate-600">{filter.value}</span>
          <span className="material-symbols-outlined text-[14px] text-slate-300">lock</span>
        </div>
      ))}
    </div>
  );
}
