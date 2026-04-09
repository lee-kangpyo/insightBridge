export default function AdmissionTable({ tablePreview }) {
  if (!tablePreview) return null;

  const { lastUpdate, headers, rows } = tablePreview;

  return (
    <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-headline text-lg font-bold text-primary">참조 테이블 프리뷰</h3>
        <span className="text-xs text-slate-400 font-medium">최근 업데이트: {lastUpdate}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-4 text-sm font-bold text-primary">{row.type}</td>
                <td className="px-8 py-4 text-sm text-on-surface-variant">{row.recruitment}</td>
                <td className="px-8 py-4 text-sm text-on-surface-variant">{row.applicants}</td>
                <td className="px-8 py-4 text-sm font-bold text-secondary">{row.competitionRate}</td>
                <td className="px-8 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      row.status === '마감완료'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'bg-secondary-fixed text-on-secondary-fixed'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 text-center">
        <button className="text-xs font-bold text-secondary hover:underline">전체 데이터 보기</button>
      </div>
    </div>
  );
}