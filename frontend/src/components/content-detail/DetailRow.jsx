export default function DetailRow({ label, value, className }) {
  return (
    <div className={`flex gap-3 text-sm py-1.5 border-b border-outline last:border-0${className ? ` ${className}` : ''}`}>
      <span className="font-label text-on-surface-variant min-w-[110px] shrink-0">{label}</span>
      <span className="font-body text-on-surface break-all">{value ?? '-'}</span>
    </div>
  );
}