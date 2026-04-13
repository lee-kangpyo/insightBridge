import AnimatedNumberText from "../common/AnimatedNumberText";

/** 본문 지표 색(valueColors)과 동일 토너로 맞춤(종합현황 등 토큰-only 카드). *-fixed 배지는 본문 text-*와 색상 계열이 달라져 어긋남. */
const yearBadgeColors = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  tertiary: "bg-tertiary/15 text-tertiary",
  error: "bg-error/15 text-error",
  "primary-container": "bg-primary/15 text-primary",
  "secondary-container": "bg-secondary/15 text-secondary",
  "tertiary-container": "bg-tertiary/15 text-tertiary",
  outline: "bg-secondary/15 text-secondary",
  "error-container": "bg-error/15 text-error",
};

const accentColorBorderMap = {
  primary: "#6750A4",
  secondary: "#625B71",
  tertiary: "#7D5260",
  error: "#B3261E",
  "primary-container": "#6750A4",
  "secondary-container": "#625B71",
  "tertiary-container": "#7D5260",
  outline: "#625B71",
  "error-container": "#B3261E",
};

const valueColors = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  error: "text-error",
};

function TrendText({ value, status }) {
  const isUndisclosed = value == null || value === "";
  if (isUndisclosed) {
    return <span className="font-medium text-slate-400">미공시</span>;
  }
  const colorClass =
    status === "positive"
      ? "text-tertiary"
      : status === "negative"
        ? "text-error"
        : "text-on-surface";
  return (
    <span className={`text-sm font-semibold tabular-nums ${colorClass}`}>
      {value}
    </span>
  );
}

export default function KPICard({
  label,
  value,
  year,
  unit,
  isMainDashboard,
  accentColor,
  accentColorHex,
  regionalAvg,
  nationalAvg,
  regionalComparison,
  nationalComparison,
  auxLabel,
  auxText,
}) {
  if (!label) return null;

  const isUndisclosed = value == null || value === "";

  const yearBadgeColor =
    yearBadgeColors[accentColor] || yearBadgeColors.secondary;
  const valueColor = accentColorHex
    ? undefined
    : valueColors[accentColor] || valueColors.primary;

  const valueText = isUndisclosed ? "미공시" : String(value);
  const shouldAppendUnit = Boolean(unit && !valueText.includes(String(unit)));

  /** accentColorHex가 있으면 본문 숫자와 같은 액센트로 배지를 맞춤(스펙: 액센트에 맞는 연도 배지). */
  const yearBadgeStyle = accentColorHex
    ? {
        backgroundColor: `color-mix(in srgb, ${accentColorHex} 22%, white)`,
        color: accentColorHex,
      }
    : undefined;

  const cardBorderColor = accentColorHex || accentColorBorderMap[accentColor];
  const cardStyle = cardBorderColor
    ? { borderBottom: `4px solid ${cardBorderColor}` }
    : undefined;

  const regionalAvgText =
    regionalAvg == null || regionalAvg === ""
      ? "미공시"
      : `${regionalAvg}${unit || ""}`;
  const nationalAvgText =
    nationalAvg == null || nationalAvg === ""
      ? "미공시"
      : `${nationalAvg}${unit || ""}`;

  return (
    <div
      className="bg-surface-container-lowest p-5 rounded-lg border border-transparent hover:border-outline-variant/15 transition-all"
      style={cardStyle}
    >
      {/** 같은 그리드 행에서 제목 줄 수(1·2줄)에 따라 본문 수치·구분선 높이가 어긋나지 않도록 2줄 분 min-height + 초과 시 말줄임 */}
      <div className="flex justify-between items-start gap-3 min-w-0 mb-1.5 min-h-[2.75rem]">
        <span
          className="min-w-0 flex-1 pr-1 text-base font-bold text-on-surface-variant uppercase tracking-wide leading-snug line-clamp-2 break-words"
          title={label}
        >
          {label}
        </span>
        {year && (
          <span
            className={`shrink-0 self-start px-1 py-px text-[10px] font-semibold leading-none rounded-full ${accentColorHex ? "" : yearBadgeColor}`}
            style={yearBadgeStyle}
          >
            {year}
          </span>
        )}
      </div>
      <div
        className={`text-3xl font-semibold tabular-nums mb-3 ${valueColor || ""}`}
        style={accentColorHex ? { color: accentColorHex } : undefined}
      >
        {isMainDashboard && !isUndisclosed ? (
          <AnimatedNumberText text={valueText} duration={1500} />
        ) : (
          valueText
        )}
        {shouldAppendUnit && (
          <span className="text-base font-medium ml-0.5">{unit}</span>
        )}
      </div>
      <div className="space-y-1.5">
        {isMainDashboard ? (
          <>
            <div className="flex justify-between items-baseline gap-2 text-sm">
              <span className="text-on-surface-variant font-semibold shrink-0 leading-snug">
                지역 대비
              </span>
              <TrendText
                value={regionalComparison?.value}
                status={regionalComparison?.status}
              />
            </div>
            <div className="flex justify-between items-baseline gap-2 text-sm">
              <span className="text-on-surface-variant font-semibold shrink-0 leading-snug">
                전국 대비
              </span>
              <TrendText
                value={nationalComparison?.value}
                status={nationalComparison?.status}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-baseline gap-2 text-sm">
              <span className="text-on-surface-variant font-semibold shrink-0 leading-snug">
                권역평균
              </span>
              <span className="text-sm font-semibold tabular-nums text-on-surface">
                {regionalAvg}
                {unit}
              </span>
            </div>
            <div className="flex justify-between items-baseline gap-2 text-sm">
              <span className="text-on-surface-variant font-semibold shrink-0 leading-snug">
                전국평균
              </span>
              <span className="text-sm font-semibold tabular-nums text-on-surface">
                {nationalAvg}
                {unit}
              </span>
            </div>
          </>
        )}
      </div>
      {auxLabel && auxText && (
        <div className="flex justify-between items-baseline gap-2 text-sm mt-2 pt-2 border-t border-outline-variant/70">
          <span className="text-on-surface-variant font-semibold leading-snug">
            {auxLabel}
          </span>
          <span className="font-semibold tabular-nums text-on-surface">
            {auxText}
          </span>
        </div>
      )}
    </div>
  );
}
