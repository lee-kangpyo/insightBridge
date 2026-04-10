export default function EducationFacultyFilters({ filters }) {
  const filterEntries = Object.entries(filters);

  return (
    <div className="bg-[#f1f4f7] flex items-center gap-6 px-8 py-3 w-full border-b border-slate-200/10">
      <div className="flex items-center gap-2 text-[#0a4687] font-medium">
        <span className="material-symbols-outlined text-sm">lock</span>
        <span className="text-[0.6875rem] font-label uppercase tracking-wider opacity-70">
          Configuration
        </span>
      </div>
      <div className="flex gap-4">
        {filterEntries.map(([key, { label, value }]) => (
          <div
            key={key}
            className="flex items-center gap-2 px-3 py-1 bg-surface-container-lowest rounded-full shadow-sm text-xs text-on-surface"
          >
            <span className="text-slate-400">{label}:</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 text-slate-400">
        <span className="material-symbols-outlined text-xl">filter_list</span>
      </div>
    </div>
  );
}