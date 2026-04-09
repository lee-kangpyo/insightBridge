export default function AdmissionFilters({ filters }) {
  if (!filters?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {filters.map((filter, index) => (
        <div
          key={index}
          className="flex items-center bg-white px-4 py-2 rounded-full border border-outline-variant/15 text-xs font-medium"
        >
          <span className="text-slate-400 mr-2">{filter.label}</span>
          <span className="text-primary font-bold">{filter.value}</span>
        </div>
      ))}
    </div>
  );
}