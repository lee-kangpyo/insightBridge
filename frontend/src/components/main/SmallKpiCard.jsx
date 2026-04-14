const statusColors = {
  positive: 'text-tertiary',
  negative: 'text-error',
  growth: 'text-secondary',
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
  const isUndisclosed = value == null || value === "";
  if (isUndisclosed) {
    return <span className="font-medium text-slate-400">미공시</span>;
  }
  const colorClass =
    status === "positive"
      ? "text-tertiary"
      : status === "negative"
      ? "text-error"
      : "text-slate-600";
  return <span className={`font-medium ${colorClass}`}>{value}</span>;
}

export default function SmallKpiCard({
  label,
  value,
  accentColor,
  accentColorHex,
  regionalComparison,
  nationalComparison,
}) {
  if (!label) return null;

  const isUndisclosed = value == null || value === "";
  const valueText = isUndisclosed ? "미공시" : String(value);

  const derivedAccentColor =
    accentColor ||
    undefined;

  const valueColorClass = accentColorHex
    ? ""
    : valueColors[derivedAccentColor] || "text-primary";

  const cardBorderColor = accentColorHex || accentColorBorderMap[derivedAccentColor];
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
      </div>

      <div
        className={`text-3xl font-semibold mb-3 ${isUndisclosed ? "text-slate-400" : valueColorClass}`}
        style={accentColorHex && !isUndisclosed ? { color: accentColorHex } : undefined}
      >
        {valueText}
      </div>

      <div className="space-y-1">
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
      </div>
    </div>
  );
}