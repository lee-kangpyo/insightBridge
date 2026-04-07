import MaterialIcon from '../MaterialIcon';

export default function KpiTile({ icon, delta, label, title, deltaClassName = '' }) {
  return (
    <div className="group flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:bg-primary">
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-surface-container p-3 transition-colors group-hover:bg-white/10">
          <MaterialIcon
            name={icon}
            className="text-primary transition-colors group-hover:text-white"
          />
        </div>
        <span className={`text-[10px] font-black ${deltaClassName}`}>{delta}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-blue-200">
          {label}
        </span>
        <span className="text-lg font-bold text-primary transition-colors group-hover:text-white">
          {title}
        </span>
      </div>
    </div>
  );
}
