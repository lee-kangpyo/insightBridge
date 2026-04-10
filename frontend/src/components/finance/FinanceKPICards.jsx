const ACCENT_COLORS = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  'on-primary-fixed-variant': 'bg-on-primary-fixed-variant',
  'tertiary-container': 'bg-tertiary-container',
  'primary-container': 'bg-primary-container',
  outline: 'bg-outline',
};

const BADGE_COLORS = {
  primary: 'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed',
  'on-primary-fixed-variant': 'bg-primary-fixed text-on-primary-fixed-variant',
  'tertiary-container': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'primary-container': 'bg-primary-fixed text-on-primary-container',
  outline: 'bg-surface-container text-on-surface',
};

export default function FinanceKPICards({ kpis }) {
  if (!kpis) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-surface-container-lowest rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow duration-300 relative"
        >
          {kpi.accentColor !== 'none' && (
            <div
              className={`w-1.5 shrink-0 ${ACCENT_COLORS[kpi.accentColor] || 'bg-primary'}`}
              aria-hidden
            />
          )}
          <div className="p-5 flex-1">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-primary uppercase tracking-tight">
                {kpi.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-label ${BADGE_COLORS[kpi.accentColor] || 'bg-surface-container text-on-surface'}`}>
                {kpi.year}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-secondary mb-2 font-headline tracking-tighter">
              {kpi.value}
            </div>
            {kpi.comparisons && (
              <div className="flex items-center gap-2">
                {kpi.comparisons.map((comp, idx) => (
                  <span key={idx} className="text-[10px] text-on-surface-variant bg-surface-container p-1 rounded">
                    {comp.label} {comp.value}
                  </span>
                ))}
              </div>
            )}
            {kpi.subLabel && (
              <span
                className={`mt-1 inline-block w-max max-w-full text-[10px] rounded font-semibold ${kpi.subLabelBg ? 'p-1 bg-tertiary-fixed text-on-tertiary-container' : 'text-on-surface-variant'}`}
              >
                {kpi.subLabel}
              </span>
            )}
            {kpi.trend && (
              <div className="flex gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  kpi.trend.status === 'negative' 
                    ? 'text-error bg-error-container' 
                    : 'text-tertiary bg-tertiary-container'
                }`}>
                  {kpi.trend.value}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}