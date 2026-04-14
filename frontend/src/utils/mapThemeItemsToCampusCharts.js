import { parseBarRatioDisplayTextPercent } from './parseBarRatioDisplayTextPercent';

function clampPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Math.min(100, Math.max(0, Number(value)));
}

function parseNumberLoose(value) {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const s = String(value);
  const digits = s.replace(/[^\d.-]/g, '');
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function safeToken(value, allowed) {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s) return null;
  return allowed.has(s) ? s : null;
}

/**
 * CHART_LEFT (campus): 비율 표시 `bar_ratio_num`, 막대 `bar_ratio_display_text`만.
 * ㎡ 수치는 참고용(별도 필드), 막대·% 표시와 무관.
 */
export function mapThemeItemsToCampusConfiguration(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const colorTokens = new Set(['primary', 'secondary', 'secondary-container', 'error', 'tertiary']);

  return items.map((it) => {
    const value =
      typeof it?.valueNum === 'number' && Number.isFinite(it.valueNum)
        ? it.valueNum
        : parseNumberLoose(it?.displayText) ?? 0;
    const unit = typeof it?.noteText === 'string' && it.noteText.trim() ? it.noteText.trim() : null;
    const brt = it?.bar_ratio_display_text;
    const barText = brt != null && String(brt).trim() ? String(brt).trim() : '';
    return {
      item: typeof it?.label === 'string' ? it.label : '',
      bar_ratio_num:
        typeof it?.bar_ratio_num === 'number' && Number.isFinite(it.bar_ratio_num)
          ? clampPercent(it.bar_ratio_num)
          : null,
      bar_ratio_display_text: barText,
      barPercent: parseBarRatioDisplayTextPercent(it?.bar_ratio_display_text),
      value: Math.max(0, Number(value) || 0),
      unit: unit ?? '㎡',
      colorHex: typeof it?.colorHex === 'string' && it.colorHex.trim() ? it.colorHex.trim() : null,
      colorToken: safeToken(it?.noteText, colorTokens),
    };
  });
}

/**
 * CHART_RIGHT (campus): 안전·보호 운영 상태 리스트.
 */
export function mapThemeItemsToCampusSafetyStatus(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const statusTokens = new Set(['tertiary-fixed', 'secondary-fixed', 'surface-container-high']);

  return items.map((it) => ({
    label: typeof it?.label === 'string' ? it.label : '',
    value:
      (typeof it?.displayText === 'string' && it.displayText.trim()
        ? it.displayText.trim()
        : null) ??
      (typeof it?.noteText === 'string' && it.noteText.trim() ? it.noteText.trim() : null) ??
      (it?.valueNum != null ? String(it.valueNum) : ''),
    description: typeof it?.noteText === 'string' && it.noteText.trim() ? it.noteText.trim() : '',
    statusColor: safeToken(it?.colorHex, statusTokens),
  }));
}
