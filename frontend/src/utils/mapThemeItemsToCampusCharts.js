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
 * CHART_LEFT (campus): 교지 구성 및 이용 현황 막대.
 * 기대 매핑:
 * - label: 항목명
 * - valueNum: 값(㎡ 등)
 * - noteText: 단위(예: "㎡")
 * - barRatioDisplayText: 막대 비율(%), 없으면 valueNum 상대비율로 계산
 * - colorHex: 막대 색(hex) 또는 noteText에 색상 토큰(primary 등) 저장 가능(단위와 충돌 가능 → 가능하면 colorHex 사용 권장)
 */
export function mapThemeItemsToCampusConfiguration(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const colorTokens = new Set(["primary", "secondary", "secondary-container", "error", "tertiary"]);

  const raw = items.map((it) => ({
    item: typeof it?.label === "string" ? it.label : "",
    value:
      typeof it?.valueNum === "number" && Number.isFinite(it.valueNum)
        ? it.valueNum
        : parseNumberLoose(it?.displayText) ?? 0,
    unit: typeof it?.noteText === "string" && it.noteText.trim() ? it.noteText.trim() : null,
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
    (x) => x.value,
  );

  return raw.map((x, idx) => ({
    item: x.item,
    value: Math.max(0, Number(x.value) || 0),
    unit: x.unit ?? "㎡",
    percentage: percents[idx] ?? 0,
    colorHex: x.colorHex,
    colorToken: x.colorToken,
  }));
}

/**
 * CHART_RIGHT (campus): 안전·보호 운영 상태 리스트.
 * 기대 매핑(권장):
 * - label: 항목명
 * - displayText: 표시 값(예: "양호", "12건")
 * - noteText: 설명(선택)
 * - colorHex: 상태 배지 토큰(예: "tertiary-fixed")로 저장 가능(현재 UI 토큰 기반)
 */
export function mapThemeItemsToCampusSafetyStatus(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const statusTokens = new Set(["tertiary-fixed", "secondary-fixed", "surface-container-high"]);

  return items.map((it) => ({
    label: typeof it?.label === "string" ? it.label : "",
    value:
      (typeof it?.displayText === "string" && it.displayText.trim()
        ? it.displayText.trim()
        : null) ??
      (typeof it?.noteText === "string" && it.noteText.trim() ? it.noteText.trim() : null) ??
      (it?.valueNum != null ? String(it.valueNum) : ""),
    description: typeof it?.noteText === "string" && it.noteText.trim() ? it.noteText.trim() : "",
    statusColor: safeToken(it?.colorHex, statusTokens),
  }));
}

