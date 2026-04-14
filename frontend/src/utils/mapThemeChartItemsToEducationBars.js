/**
 * `/api/theme/chart-blocks` 의 ThemeChartItem → 교육/교원 바 차트 props.
 * - bar_ratio_num → 헤더 비율 표시(%)
 * - bar_ratio_display_text → 막대 길이(파싱)
 * - displayText / noteText → 강좌 수 등(숫자 추출)
 */

import { parseBarRatioDisplayTextPercent } from './parseBarRatioDisplayTextPercent';

function clampPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Math.min(100, Math.max(0, Number(value)));
}

function parseIntLoose(value) {
  if (value == null || value === '') return 0;
  const digits = String(value).replace(/[^\d]/g, '');
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

function pickCount(item) {
  const fromDisplay = parseIntLoose(item?.displayText);
  if (fromDisplay > 0) return fromDisplay;
  return parseIntLoose(item?.noteText);
}

function pickDisplayRatio(it) {
  const n = it.bar_ratio_num;
  return typeof n === 'number' && Number.isFinite(n) ? clampPercent(n) : 0;
}

function pickBarRenderPercent(it) {
  return parseBarRatioDisplayTextPercent(it.bar_ratio_display_text);
}

function pickBarDisplayText(it) {
  const v = it?.bar_ratio_display_text;
  return v != null && String(v).trim() ? String(v).trim() : '';
}

/**
 * CHART_LEFT: 학기별 전임 강의담당 비율
 */
export function mapThemeItemsToSemesterRatios(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((it) => ({
    semester: typeof it.label === 'string' ? it.label : '',
    ratio: pickDisplayRatio(it),
    barPercent: pickBarRenderPercent(it),
    courses: pickCount(it),
    colorHex: typeof it.colorHex === 'string' && it.colorHex.trim() ? it.colorHex.trim() : null,
  }));
}

/**
 * CHART_RIGHT: 강좌 규모 분포
 */
export function mapThemeItemsToCourseDistribution(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((it) => ({
    range: typeof it.label === 'string' ? it.label : '',
    percentage: pickBarRenderPercent(it),
    bar_ratio_display_text: pickBarDisplayText(it),
    count: pickCount(it),
    colorHex: typeof it.colorHex === 'string' && it.colorHex.trim() ? it.colorHex.trim() : null,
  }));
}
