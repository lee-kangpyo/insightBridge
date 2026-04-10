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
  const { label, value, unit, trend, trendValue, target, regionalAvg, progress, color } =
    card;
  const colorClass = cardColors[color] || cardColors.primary;

  return (
    <div
      className={`bg-surface-container-low p-6 rounded-lg ${colorClass.border} shadow-sm`}
    >
      <p className="text-[0.6875rem] font-label text-slate-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-headline font-bold text-primary">
          {value}
          {unit}
        </h3>
        {trend && (
          <span className={`text-sm font-medium flex items-center ${trendColors[trend]}`}>
            <span className="material-symbols-outlined text-sm">
              {trend === 'up' ? 'trending_up' : 'arrow_downward'}
            </span>
            {trendValue}
          </span>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-surface-container flex flex-col gap-1">
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Target: {target || 'N/A'}</span>
          <span>Regional Avg: {regionalAvg}</span>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1 overflow-hidden">
          <div className={`bg-${color} h-1.5`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function KPICardType2({ card }) {
  const { label, value, unit, detail, color } = card;
  const colorClass = cardColors[color] || cardColors.primary;

  return (
    <div className={`bg-surface-container-low p-6 rounded-lg ${colorClass.border} shadow-sm`}>
      <p className="text-[0.6875rem] font-label text-slate-400 mb-1">{label}</p>
      <h3 className="text-2xl font-headline font-bold text-primary">
        {value}
        {unit}
      </h3>
      <p className="text-xs text-slate-500 mt-2">
        {detail || card.nationalAvg ? `Total ${detail}. National avg ${card.nationalAvg}` : ''}
        {card.benchmark || ''}
      </p>
    </div>
  );
}

export default function EducationFacultyKPICards({ kpiCards }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICardType1 card={kpiCards[0]} />
        <KPICardType1 card={kpiCards[1]} />
        <KPICardType1 card={kpiCards[2]} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICardType2 card={kpiCards[3]} />
        <KPICardType2 card={kpiCards[4]} />
        <KPICardType2 card={kpiCards[5]} />
      </div>
    </>
  );
}