import { parseBarRatioDisplayTextPercent } from './parseBarRatioDisplayTextPercent';

function clampPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Math.min(100, Math.max(0, Number(value)));
}

function safeToken(value, allowed) {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s) return null;
  return allowed.has(s) ? s : null;
}

/**
 * CHART_LEFT (finance): 비율 표시 `bar_ratio_num`, 막대 `bar_ratio_display_text`만.
 */
export function mapThemeItemsToFinanceTuitionBars(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const colorTokens = new Set([
    'primary',
    'secondary',
    'secondary-container',
    'on-primary-container',
    'primary-fixed-dim',
  ]);

  return items.map((it) => {
    const raw = it?.bar_ratio_display_text;
    const text = raw != null && String(raw).trim() ? String(raw).trim() : '';
    return {
      field: typeof it?.label === 'string' ? it.label : '',
      bar_ratio_num:
        typeof it?.bar_ratio_num === 'number' && Number.isFinite(it.bar_ratio_num)
          ? clampPercent(it.bar_ratio_num)
          : null,
      bar_ratio_display_text: text,
      barPercent: parseBarRatioDisplayTextPercent(it?.bar_ratio_display_text),
      colorHex: typeof it?.colorHex === 'string' && it.colorHex.trim() ? it.colorHex.trim() : null,
      colorToken: safeToken(it?.noteText, colorTokens),
    };
  });
}

/**
 * CHART_RIGHT (finance): 비율 표시 `bar_ratio_num`만.
 */
export function mapThemeItemsToFinanceRevenueTop(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const borderTokens = new Set([
    'border-primary',
    'border-secondary',
    'border-secondary-container',
    'border-on-primary-container',
    'border-primary-fixed-dim',
  ]);

  return items.map((it) => {
    const raw = it?.bar_ratio_display_text;
    const text = raw != null && String(raw).trim() ? String(raw).trim() : '';
    return {
      item: typeof it?.label === 'string' ? it.label : '',
      bar_ratio_num:
        typeof it?.bar_ratio_num === 'number' && Number.isFinite(it.bar_ratio_num)
          ? clampPercent(it.bar_ratio_num)
          : null,
      bar_ratio_display_text: text,
      borderColorHex:
        typeof it?.colorHex === 'string' && it.colorHex.trim() ? it.colorHex.trim() : null,
      borderToken: safeToken(it?.noteText, borderTokens),
    };
  });
}
