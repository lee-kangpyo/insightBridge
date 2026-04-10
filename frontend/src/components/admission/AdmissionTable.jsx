export default function AdmissionTable({ refs = [] }) {
  const hasRows = Array.isArray(refs) && refs.length > 0;

  return (
    <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-headline text-lg font-bold text-primary">참조 테이블 프리뷰</h3>
        <span className="text-xs text-slate-400 font-medium">출처: DB (tq_screen_source_ref)</span>
      </div>
      {!hasRows ? (
        <div className="px-8 py-12 text-center text-sm text-on-surface-variant">
          참조 출처 정보가 없습니다. 동일 학교·기준연도·screen_code에 대한 행을 확인해 주세요.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14">
                  순서
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[8rem]">
                  테이블
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[12rem]">
                  컬럼/식
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {refs.map((row) => (
                <tr key={`${row.order}-${row.tableName}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4 text-sm font-mono text-on-surface-variant tabular-nums">
                    {row.order}
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-primary">{row.tableName}</td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant whitespace-pre-wrap break-words">
                    {row.columnExpr}
                  </td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant whitespace-pre-wrap break-words">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}