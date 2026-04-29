import { useEffect, useState } from 'react';
import { getItemRender } from '../services/adminApi';
import ChartRenderer from './ChartRenderer';
import { CompositeKpiCardPreview } from './admin/items/Phase1ItemPreview';

function SlotItemRenderer({ itemId }) {
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
        const result = await getItemRender(itemId);
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
  }, [itemId]);

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
      <div className="w-full h-full p-2 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-outline/20">
              {data.columns.map((c) => (
                <th key={c.dataKey} className="text-left py-2 px-2 whitespace-nowrap">
                  {c.header || c.dataKey}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i} className="border-b border-outline/10">
                {data.columns.map((c) => (
                  <td key={c.dataKey} className="py-1.5 px-2">
                    {row?.[c.dataKey] == null || row?.[c.dataKey] === '' ? '—' : String(row[c.dataKey])}
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
      <div className="w-full h-full p-2 overflow-auto">
        <CompositeKpiCardPreview
          title={data.title}
          headline={data.headline}
          rows={data.rows}
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
