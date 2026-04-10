const statusStyles = {
  LIVE: 'bg-tertiary-fixed text-on-tertiary-fixed',
  SYNCING: 'bg-secondary-fixed text-on-secondary-fixed',
};

export default function ResearchIndustryStartupTable({ tablePreview }) {
  return (
    <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="text-xl font-bold font-headline text-primary">참조 테이블 프리뷰</h3>
        <button className="text-sm font-semibold text-secondary hover:underline transition-all">전체보기</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest">
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">테이블</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">핵심 칼럼</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">비고</th>
              <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {tablePreview.map(({ tableName, columns, note, status }) => (
              <tr key={tableName} className="hover:bg-surface-container-low transition-colors">
                <td className="px-8 py-4 text-sm font-semibold text-primary">{tableName}</td>
                <td className="px-8 py-4 text-sm text-on-surface-variant">{columns.join(', ')}</td>
                <td className="px-8 py-4 text-sm text-outline">{note}</td>
                <td className="px-8 py-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[status]}`}>
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