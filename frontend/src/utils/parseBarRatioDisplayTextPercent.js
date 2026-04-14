/** 막대 렌더링용: API/DB `bar_ratio_display_text` → 0~100. 파싱 실패 시 0. */
export function parseBarRatioDisplayTextPercent(raw) {
  if (raw == null) return 0;
  const s = String(raw)
    .trim()
    .replace(/%/g, '')
    .replace(',', '.')
    .trim();
  if (!s) return 0;
  const x = parseFloat(s);
  if (Number.isNaN(x)) return 0;
  return Math.min(100, Math.max(0, x));
}

/** 비율 표시용: `bar_ratio_num` → "12%" / "12.3%" (없으면 빈 문자열). */
export function formatBarRatioNumPercent(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '';
  const rounded = Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1)));
  return `${rounded}%`;
}
