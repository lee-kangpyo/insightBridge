export default function SqlDetail({ data, className }) {
  return (
    <div className={`flex flex-col gap-2${className ? ` ${className}` : ''}`}>
      <p className="font-label text-on-surface-variant text-[13px]">생성된 SQL 쿼리</p>
      <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto">
        <pre><code>{data?.sql || '-'}</code></pre>
      </div>
    </div>
  );
}