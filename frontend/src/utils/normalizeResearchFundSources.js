/**
 * 연구비 재원 행 정규화 → { name, percentage, bar_ratio_display_text? }[]
 */
export function normalizeResearchFundSources(sources) {
  if (!Array.isArray(sources)) return [];
  const out = [];
  for (const s of sources) {
    const name = s?.name;
    const pct = Number(s?.percentage);
    const disp =
      typeof s?.bar_ratio_display_text === 'string' && s.bar_ratio_display_text.trim()
        ? s.bar_ratio_display_text.trim()
        : '';
    if (!name || Number.isNaN(pct)) continue;
    if (name === '지자체/민간') {
      const half = Math.round((pct / 2) * 10) / 10;
      const rest = Math.round((pct - half) * 10) / 10;
      out.push({ name: '지자체', percentage: half, bar_ratio_display_text: disp });
      out.push({ name: '민간', percentage: rest, bar_ratio_display_text: disp });
    } else if (name === '교내') {
      out.push({ name: '교내 연구비', percentage: pct, bar_ratio_display_text: disp });
    } else {
      out.push({ name, percentage: pct, bar_ratio_display_text: disp });
    }
  }
  return out;
}

export function pickLatestFundYear(fundStructure) {
  if (!Array.isArray(fundStructure) || fundStructure.length === 0) return null;
  return [...fundStructure].sort((a, b) => Number(b.year) - Number(a.year))[0];
}
