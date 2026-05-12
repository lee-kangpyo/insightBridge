import { useEffect, useState } from 'react';
import { getItemRender } from '../services/adminApi';
import ChartRenderer from './ChartRenderer';
import { CompositeKpiCardPreview } from './admin/items/Phase1ItemPreview';

function SlotItemRenderer({ itemId, baseYear }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedBaseYear, setUsedBaseYear] = useState(null);

  const EmptyState = ({ year }) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant p-8 text-center">
      <div className="text-4xl mb-4 opacity-40">📅</div>
      <p className="text-sm">
        선택하신 {year}년에 표시할 데이터가 없습니다.
      </p>
      <p className="text-xs mt-1 opacity-70">다른 연도를 선택해 주세요.</p>
    </div>
  );

  const hasRows = data?.rows && data.rows.length > 0;
  const hasChartData = data?.type === 'chart' && data?.data && Array.isArray(data.data) && data.data.length > 0;
  const hasData = data?.type === 'chart' ? hasChartData : hasRows;

  useEffect(() => {
    if (!itemId) {
      setData(null);
      setLoading(false);
      setError(null);
      setUsedBaseYear(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const ctx = baseYear != null ? { base_year: baseYear } : undefined;
        setUsedBaseYear(baseYear);
        const result = await getItemRender(itemId, ctx);
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.detail || e.message || '데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId, baseYear]);

  if (!itemId) {
    return (
      <div className="w-full h-full" />
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-error text-sm p-4">
        {error}
      </div>
    );
  }

  if (!data || !data.type) {
    if (usedBaseYear != null) {
      return <EmptyState year={usedBaseYear} />;
    }
    return (
      <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
        렌더링할 데이터가 없습니다.
      </div>
    );
  }

  if (!hasData) {
    return usedBaseYear != null ? <EmptyState year={usedBaseYear} /> : (
      <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  if (data.type === 'chart') {
    return (
      <div className="w-full h-full p-2">
        <ChartRenderer data={data.data} chartConfig={data.chartConfig} />
      </div>
    );
  }

  if (data.type === 'grid') {
    return (
      <div className="w-full h-full overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white/70 backdrop-blur-sm">
              {data.columns.map((c, i) => (
                <th
                  key={c.dataKey}
                  className="py-2.5 px-3 text-left text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant whitespace-nowrap border-b border-white/60"
                  style={{ borderRadius: i === 0 ? '0' : undefined }}
                >
                  {c.header || c.dataKey}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-outline/8 transition-colors hover:bg-sky-50/40 ${i % 2 === 0 ? '' : 'bg-white/20'}`}
              >
                {data.columns.map((c) => (
                  <td key={c.dataKey} className="py-2 px-3 text-on-surface tabular-nums">
                    {row?.[c.dataKey] == null || row?.[c.dataKey] === '' ? (
                      <span className="text-on-surface-variant/40">—</span>
                    ) : String(row[c.dataKey])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.type === 'card') {
    return (
      <div className="w-full h-full">
        <CompositeKpiCardPreview
          title={data.title}
          headline={data.headline}
          rows={Array.isArray(data.rows) ? data.rows : []}
          sources={[]}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
      지원되지 않는 타입: {data.type}
    </div>
  );
}

export default SlotItemRenderer;
