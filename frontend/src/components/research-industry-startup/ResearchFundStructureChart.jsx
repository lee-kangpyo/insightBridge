import { useMemo } from 'react';

const BAR_COLORS = {
  '교내 연구비': 'bg-primary',
  교내: 'bg-primary',
  중앙정부: 'bg-secondary',
  지자체: 'bg-secondary-container',
  민간: 'bg-tertiary',
  외국: 'bg-outline',
};

/** 레거시 4분류(지자체/민간 합산) → 5행 표시용 */
function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];
  const out = [];
  for (const s of sources) {
    const name = s?.name;
    const pct = Number(s?.percentage);
    if (!name || Number.isNaN(pct)) continue;
    if (name === '지자체/민간') {
      const half = Math.round((pct / 2) * 10) / 10;
      const rest = Math.round((pct - half) * 10) / 10;
      out.push({ name: '지자체', percentage: half });
      out.push({ name: '민간', percentage: rest });
    } else if (name === '교내') {
      out.push({ name: '교내 연구비', percentage: pct });
    } else {
      out.push({ name, percentage: pct });
    }
  }
  return out;
}

export default function ResearchFundStructureChart({ fundStructure, title, subtitle }) {
  const heading = title?.trim() ? title : '연구비 재원 구조';
  const sub = subtitle?.trim() ? subtitle : '';

  const latest = useMemo(() => {
    if (!Array.isArray(fundStructure) || fundStructure.length === 0) return null;
    return [...fundStructure].sort((a, b) => Number(b.year) - Number(a.year))[0];
  }, [fundStructure]);

  const rows = useMemo(() => normalizeSources(latest?.sources), [latest]);

  if (!latest || rows.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm border border-outline-variant/10">
      <div className="mb-8">
        <h3 className="text-xl font-bold font-headline text-primary">{heading}</h3>
        {sub ? <p className="mt-1 text-xs text-on-surface-variant">{sub}</p> : null}
        <p className="mt-2 text-sm text-on-surface-variant">
          <span className="font-semibold text-primary">{latest.year}년</span>
          <span className="mx-2 text-outline">·</span>
          <span>{latest.total}</span>
        </p>
      </div>
      <div className="space-y-6">
        {rows.map((item) => {
          const pct = Math.min(100, Math.max(0, Number(item.percentage) || 0));
          const barClass = BAR_COLORS[item.name] || 'bg-secondary';
          return (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-on-surface-variant">{item.name}</span>
                <span className="font-bold text-secondary">
                  {pct}
                  <span className="text-xs font-normal text-outline">%</span>
                </span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
