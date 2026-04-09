export default function StudentCareerTable({ tablePreview }) {
  if (!tablePreview?.length) return null;

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
        <h3 className="text-base font-semibold text-primary">참조 테이블 프리뷰</h3>
        <button className="text-xs font-medium text-secondary flex items-center gap-1 hover:underline">
          전체보기
          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/30">
              <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                테이블
              </th>
              <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                핵심 칼럼
              </th>
              <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                비고
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {tablePreview.map((row, index) => (
              <tr key={index} className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.table}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {row.columns.map((col, colIndex) => (
                      <span
                        key={colIndex}
                        className="px-2 py-0.5 bg-secondary-fixed/30 text-[10px] font-medium rounded text-slate-500"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
