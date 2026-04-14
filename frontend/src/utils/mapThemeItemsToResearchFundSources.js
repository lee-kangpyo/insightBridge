import { parseBarRatioDisplayTextPercent } from './parseBarRatioDisplayTextPercent';

/**
 * 연구 CHART_LEFT: 막대는 `bar_ratio_display_text`만 파싱.
 */
export function mapThemeItemsToResearchFundSources(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((it) => {
    const raw = it.bar_ratio_display_text;
    const percentage = parseBarRatioDisplayTextPercent(raw);
    const text = raw != null && String(raw).trim() ? String(raw).trim() : '';
    return {
      name: typeof it.label === 'string' ? it.label : '',
      percentage,
      bar_ratio_display_text: text,
    };
  });
}
