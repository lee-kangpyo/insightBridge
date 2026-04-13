import EmptyState from "../common/EmptyState";

export default function OverviewDetailGridTable({ items, title = "핵심 지표 상세 그리드" }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-outline-variant/10">
        <h3 className="text-xl font-bold font-headline text-primary">{title}</h3>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest">
                <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  지표
                </th>
                <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  우리 대학
                </th>
                <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  지역 평균
                </th>
                <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
                  원천 테이블
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rows.map((row) => {
                const metricLabel = `${row.metricName}${row.metricYear ? ` (${row.metricYear})` : ""}`;
                const myValue = row.myValueDisplay ?? "";
                const regionAvg = row.regionAvgDisplay ?? "";
                const sourceTable = row.sourceTableName ?? "";
                const sourceExpr = row.sourceColumnExpr ?? "";

                return (
                  <tr
                    key={`${row.metricCode}-${row.metricYear}-${row.displayOrder}`}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-8 py-4 text-sm font-semibold text-primary whitespace-pre-wrap break-words">
                      {metricLabel}
                    </td>
                    <td className="px-8 py-4 text-sm text-on-surface-variant whitespace-pre-wrap break-words">
                      {myValue}
                    </td>
                    <td className="px-8 py-4 text-sm text-on-surface-variant whitespace-pre-wrap break-words">
                      {regionAvg}
                    </td>
                    <td className="px-8 py-4 text-right whitespace-pre-wrap break-words">
                      <div className="text-sm font-semibold text-primary">{sourceTable}</div>
                      <div className="text-xs text-outline mt-1">{sourceExpr}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6">
          <EmptyState
            title="미공시"
            description="핵심 지표 상세 그리드 데이터가 미공시입니다."
            minHeight={220}
            icon="grid_on"
          />
        </div>
      )}
    </div>
  );
}

