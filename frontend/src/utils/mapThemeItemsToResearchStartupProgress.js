import { parseBarRatioDisplayTextPercent } from './parseBarRatioDisplayTextPercent';

/**
 * 연구 CHART_RIGHT: 막대 `bar_ratio_display_text`, 표시 `bar_ratio_num`.
 */
export function mapThemeItemsToResearchStartupProgress(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((it) => {
    const label = typeof it.label === 'string' ? it.label : '';
    const raw = it.bar_ratio_display_text;
    const percentage = parseBarRatioDisplayTextPercent(raw);
    const bar_ratio_display_text =
      raw != null && String(raw).trim() ? String(raw).trim() : '';
    const n = it.bar_ratio_num;
    const bar_ratio_num =
      typeof n === 'number' && Number.isFinite(n) ? n : null;
    const valueCaption = bar_ratio_num != null ? `${bar_ratio_num}%` : '';
    return { label, percentage, bar_ratio_display_text, bar_ratio_num, valueCaption };
  });
}
