const cardColors = {
  primary: { border: 'border-l-4 border-primary', icon: 'text-secondary' },
  secondary: { border: 'border-l-4 border-secondary', icon: 'text-secondary' },
  tertiary: { border: 'border-l-4 border-tertiary', icon: 'text-secondary' },
};

const trendColors = {
  up: 'text-tertiary',
  down: 'text-error',
};

function KPICardType1({ card }) {
  const { label, value, unit, trend, trendValue, target, progress, color } = card;
  const colorClass = cardColors[color] || cardColors.primary;

  return (
    <div className={`bg-surface-container-lowest p-6 rounded-lg ${colorClass.border} shadow-sm`}>
      <p className="text-[0.6875rem] font-label text-secondary mb-2 uppercase tracking-tight">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold font-headline text-primary">{value}</span>
        <span className="text-xs text-on-surface-variant">{unit}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="text-outline">{target}</span>
        {trend && (
          <span className={`font-bold ${trendColors[trend]}`}>
            {trendValue}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-surface-container rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${color === 'primary' ? 'bg-primary' : color === 'secondary' ? 'bg-secondary' : 'bg-tertiary'} rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function KPICardType2({ card }) {
  const { label, value, unit, detail, color } = card;
  const colorClass = cardColors[color] || cardColors.primary;

  return (
    <div className={`bg-surface-container-lowest p-6 rounded-lg ${colorClass.border} shadow-sm`}>
      <p className="text-[0.6875rem] font-label text-secondary mb-2 uppercase tracking-tight">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold font-headline text-primary">{value}</span>
        <span className="text-xs text-on-surface-variant">{unit}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="text-outline">{detail}</span>
        {card.trend && (
          <span className={`font-bold ${trendColors[card.trend]}`}>
            {card.trendValue}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-surface-container rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${color === 'secondary' ? 'bg-secondary' : 'bg-tertiary'} rounded-full`} style={{ width: `${card.progress}%` }}></div>
      </div>
    </div>
  );
}

export default function ResearchIndustryStartupKPICards({ kpiCards }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      <KPICardType1 card={kpiCards[0]} />
      <KPICardType1 card={kpiCards[1]} />
      <KPICardType1 card={kpiCards[2]} />
      <KPICardType2 card={kpiCards[3]} />
      <KPICardType2 card={kpiCards[4]} />
      <KPICardType2 card={kpiCards[5]} />
    </div>
  );
}