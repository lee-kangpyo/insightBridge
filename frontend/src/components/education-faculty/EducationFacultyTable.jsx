const statusStyles = {
  ACTIVE: 'bg-tertiary-fixed text-on-tertiary-fixed',
  SYNCING: 'bg-secondary-fixed text-on-secondary-fixed',
};

export default function EducationFacultyTable({ tablePreview }) {
  const rows = Array.isArray(tablePreview) ? tablePreview : [];
  const isApiShape = Boolean(rows?.[0] && typeof rows[0].columnExpr === 'string');

  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-headline font-bold text-primary">참조 테이블 프리뷰</h3>
        <button className="text-xs text-secondary font-semibold hover:underline">
          Full Documentation
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead>
            <tr className="bg-surface-container-highest">
              <th className="py-3 px-4 rounded-tl-lg font-semibold text-primary">
                {isApiShape ? 'Order' : 'Table Name'}
              </th>
              <th className="py-3 px-4 font-semibold text-primary">
                {isApiShape ? 'Table Name' : 'Key Columns'}
              </th>
              <th className="py-3 px-4 font-semibold text-primary">
                {isApiShape ? 'Column/Expr' : 'Last Updated'}
              </th>
              <th className="py-3 px-4 rounded-tr-lg font-semibold text-primary">
                {isApiShape ? 'Note' : 'Status'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {isApiShape
              ? rows.map((row) => (
                  <tr
                    key={`${row.order}-${row.tableName}`}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{row.order}</td>
                    <td className="py-3 px-4 text-slate-600">{row.tableName}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-pre-wrap break-words">{row.columnExpr}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-pre-wrap break-words">{row.note}</td>
                  </tr>
                ))
              : rows.map(({ tableName, columns, lastUpdated, status }) => (
                  <tr key={tableName} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{tableName}</td>
                    <td className="py-3 px-4 text-slate-500">{columns.join(', ')}</td>
                    <td className="py-3 px-4 text-slate-500">{lastUpdated}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}