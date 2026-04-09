function Legend({ items }) {
  if (!items?.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-on-surface-variant">
      {items.map((it) => (
        <div key={it.statusCode} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm border border-outline-variant/30"
            style={{ backgroundColor: it.colorHex }}
            aria-hidden
          />
          <span className="font-medium text-on-surface">{it.statusName}</span>
        </div>
      ))}
    </div>
  );
}

function Cell({ cell, align = "left" }) {
  if (!cell) return null;
  return (
    <div
      className={`px-3 py-2 rounded-md border border-outline-variant/20 text-[13px] font-semibold text-black ${
        align === "right" ? "text-right" : "text-left"
      }`}
      style={{ backgroundColor: cell.colorHex }}
      title={`${cell.statusName} (${cell.displayText})`}
    >
      {cell.displayText}
    </div>
  );
}

export default function RiskStrengthTable({ data, legend }) {
  if (!data?.length) return null;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
      <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
        <span>종합 리스크/우위 분석</span>
      </h3>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container-highest/50 text-[10px] font-bold text-outline uppercase tracking-wider">
            <th className="px-4 py-3 rounded-tl-lg">지표명</th>
            <th className="px-4 py-3">지역 대비</th>
            <th className="px-4 py-3">전국 대비</th>
            <th className="px-4 py-3 rounded-tr-lg">종합 판정</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((row, index) => (
            <tr
              key={row.indicator?.code || row.indicator}
              className={`hover:bg-surface-container-low transition-colors ${index > 0 ? "border-t border-outline-variant/10" : ""}`}
            >
              <td className="px-4 py-4 font-semibold text-primary">
                {row.indicator?.name || row.indicator}
              </td>
              <td className="px-4 py-4">
                <Cell cell={row.regional} align="right" />
              </td>
              <td className="px-4 py-4">
                <Cell cell={row.national} align="right" />
              </td>
              <td className="px-4 py-4">
                <div
                  className="px-3 py-2 rounded-md border border-outline-variant/20 text-[12px] font-bold text-black inline-block"
                  style={{ backgroundColor: row.overall?.colorHex }}
                  title={row.overall?.statusName}
                >
                  {row.overall?.displayText || row.overallStatus}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Legend items={legend} />
    </div>
  );
}
