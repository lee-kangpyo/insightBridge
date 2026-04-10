function clampPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Math.min(100, Math.max(0, Number(value)));
}

function parsePercentLoose(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  const cleaned = s.replace("%", "").replace(",", ".").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? clampPercent(n) : null;
}

function parseNumberLoose(value) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value);
  const digits = s.replace(/[^\d.-]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function normalizeBarPercent(items, pickRawPercent, pickRawValue) {
  const percents = items.map((it) => pickRawPercent(it)).filter((v) => v != null);
  if (percents.length > 0) return items.map((it) => clampPercent(pickRawPercent(it)));

  const values = items.map((it) => pickRawValue(it)).map((v) => (v == null ? 0 : Number(v)));
  const max = Math.max(0, ...values);
  if (!Number.isFinite(max) || max <= 0) return items.map(() => 0);
  return values.map((v) => clampPercent((100 * v) / max));
}

function safeToken(value, allowed) {
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (!s) return null;
  return allowed.has(s) ? s : null;
}

/**
 * CHART_LEFT (finance): 계열별 등록금 수준 막대.
 * 기대 매핑:
 * - label: 계열명
 * - valueNum: 등록금(원)
 * - barRatioDisplayText: 막대 비율(%), 없으면 valueNum 상대비율로 계산
 * - colorHex: 막대 색(hex) 또는 noteText에 색상 토큰(primary 등) 저장 가능
 */
export function mapThemeItemsToFinanceTuitionBars(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const colorTokens = new Set([
    "primary",
    "secondary",
    "secondary-container",
    "on-primary-container",
    "primary-fixed-dim",
  ]);

  const raw = items.map((it) => ({
    field: typeof it?.label === "string" ? it.label : "",
    amount:
      typeof it?.valueNum === "number" && Number.isFinite(it.valueNum)
        ? it.valueNum
        : parseNumberLoose(it?.displayText) ?? 0,
    rawPercent:
      parsePercentLoose(it?.barRatioDisplayText) ??
      parsePercentLoose(it?.displayText) ??
      null,
    colorHex: typeof it?.colorHex === "string" && it.colorHex.trim() ? it.colorHex.trim() : null,
    colorToken: safeToken(it?.noteText, colorTokens),
  }));

  const percents = normalizeBarPercent(
    raw,
    (x) => x.rawPercent,
    (x) => x.amount,
  );

  return raw.map((x, idx) => ({
    field: x.field,
    amount: Math.max(0, Number(x.amount) || 0),
    percentage: percents[idx] ?? 0,
    colorHex: x.colorHex,
    colorToken: x.colorToken,
  }));
}

/**
 * CHART_RIGHT (finance): 세입 구조 상위 항목 리스트.
 * 기대 매핑:
 * - label: 항목명
 * - valueNum: 비율(%)
 * - colorHex: 좌측 border 색(hex) 또는 noteText에 border 토큰(border-primary 등) 저장 가능
 */
export function mapThemeItemsToFinanceRevenueTop(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const borderTokens = new Set([
    "border-primary",
    "border-secondary",
    "border-secondary-container",
    "border-on-primary-container",
    "border-primary-fixed-dim",
  ]);

  return items.map((it) => ({
    item: typeof it?.label === "string" ? it.label : "",
    percentage:
      typeof it?.valueNum === "number" && Number.isFinite(it.valueNum)
        ? clampPercent(it.valueNum)
        : clampPercent(parsePercentLoose(it?.displayText) ?? parsePercentLoose(it?.barRatioDisplayText) ?? 0),
    borderColorHex:
      typeof it?.colorHex === "string" && it.colorHex.trim() ? it.colorHex.trim() : null,
    borderToken: safeToken(it?.noteText, borderTokens),
  }));
}

