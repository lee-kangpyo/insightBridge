export default function StudentCareerTable({ refs = [] }) {
  const hasRows = Array.isArray(refs) && refs.length > 0;

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
        <h3 className="text-base font-semibold text-primary">참조 테이블 프리뷰</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-medium">출처: DB (tq_screen_source_ref)</span>
          <button type="button" className="text-xs font-medium text-secondary flex items-center gap-1 hover:underline">
            전체보기
            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
          </button>
        </div>
      </div>
      {!hasRows ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          참조 출처 정보가 없습니다. (screen_code=student, 기준연도·학교명 확인)
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/30">
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-14">
                  순서
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider min-w-[8rem]">
                  테이블
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider min-w-[12rem]">
                  컬럼/식
                </th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {refs.map((row) => (
                <tr key={`${row.order}-${row.tableName}`} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500 tabular-nums">{row.order}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.tableName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-pre-wrap break-words">
                    {row.columnExpr}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 whitespace-pre-wrap break-words">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
