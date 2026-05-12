import { useEffect, useState } from 'react';
import { getItemRender } from '../services/adminApi';
import ChartRenderer from './ChartRenderer';
import { CompositeKpiCardPreview } from './admin/items/Phase1ItemPreview';

function SlotItemRenderer({ itemId, baseYear }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itemId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const ctx = baseYear != null ? { base_year: baseYear } : undefined;
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
    return (
      <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
        렌더링할 데이터가 없습니다.
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
