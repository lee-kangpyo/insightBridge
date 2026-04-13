import AnimatedNumberText from "../common/AnimatedNumberText";

/** 본문 지표 색(valueColors)과 동일 토너로 맞춤(종합현황 등 토큰-only 카드). *-fixed 배지는 본문 text-*와 색상 계열이 달라져 어긋남. */
const yearBadgeColors = {
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  tertiary: 'bg-tertiary/15 text-tertiary',
  error: 'bg-error/15 text-error',
  'primary-container': 'bg-primary/15 text-primary',
  'secondary-container': 'bg-secondary/15 text-secondary',
  'tertiary-container': 'bg-tertiary/15 text-tertiary',
  outline: 'bg-secondary/15 text-secondary',
  'error-container': 'bg-error/15 text-error',
};

const accentColorBorderMap = {
  primary: '#6750A4',
  secondary: '#625B71',
  tertiary: '#7D5260',
  error: '#B3261E',
  'primary-container': '#6750A4',
  'secondary-container': '#625B71',
  'tertiary-container': '#7D5260',
  outline: '#625B71',
  'error-container': '#B3261E',
};

const valueColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  error: 'text-error',
};

function TrendText({ value, status }) {
  const colorClass = status === 'positive'
    ? 'text-tertiary'
    : status === 'negative'
    ? 'text-error'
    : 'text-slate-600';
  return <span className={`font-medium ${colorClass}`}>{value}</span>;
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
  if (!label || !value) return null;

  const yearBadgeColor = yearBadgeColors[accentColor] || yearBadgeColors.secondary;
  const valueColor = accentColorHex
    ? undefined
    : valueColors[accentColor] || valueColors.primary;

  const valueText = value == null ? "" : String(value);
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

  return (
    <div
      className="bg-surface-container-lowest p-5 rounded-lg border border-transparent hover:border-outline-variant/15 transition-all"
      style={cardStyle}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {year && (
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${accentColorHex ? '' : yearBadgeColor}`}
            style={yearBadgeStyle}
          >
            {year}
          </span>
        )}
      </div>
      <div
        className={`text-3xl font-semibold mb-3 ${valueColor || ''}`}
        style={accentColorHex ? { color: accentColorHex } : undefined}
      >
        {isMainDashboard ? (
    <AnimatedNumberText text={valueText} duration={1500} />
        ) : (
          valueText
        )}
        {shouldAppendUnit && (
          <span className="text-base font-medium ml-0.5">{unit}</span>
        )}
      </div>
      <div className="space-y-1">
        {isMainDashboard ? (
          <>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">지역 대비</span>
              <TrendText
                value={regionalComparison?.value}
                status={regionalComparison?.status}
              />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">전국 대비</span>
              <TrendText
                value={nationalComparison?.value}
                status={nationalComparison?.status}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">권역평균</span>
              <span className="font-medium text-slate-600">{regionalAvg}{unit}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">전국평균</span>
              <span className="font-medium text-slate-600">{nationalAvg}{unit}</span>
            </div>
          </>
        )}
      </div>
      {auxLabel && auxText && (
        <div className="flex justify-between text-[10px] mt-2 pt-2 border-t border-outline-variant/10">
          <span className="text-slate-400">{auxLabel}</span>
          <span className="font-medium text-slate-600">{auxText}</span>
        </div>
      )}
    </div>
  );
}