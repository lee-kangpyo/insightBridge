const ACCENT_COLORS = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  error: 'bg-error',
  'tertiary-container': 'bg-tertiary-container',
  'primary-container': 'bg-primary-container',
  outline: 'bg-outline',
};

const BADGE_COLORS = {
  primary: 'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed',
  tertiary: 'bg-tertiary-fixed text-on-tertiary',
  error: 'bg-error-container text-on-error-container',
  'tertiary-container': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'primary-container': 'bg-primary-fixed text-on-primary-container',
  'surface-container-high': 'bg-surface-container-high text-on-surface-variant',
};

const VALUE_COLORS = {
  tertiary: 'text-tertiary',
  secondary: 'text-secondary',
  error: 'text-error',
  primary: 'text-primary',
};

export default function CampusKPICards({ kpis }) {
  if (!kpis) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-surface-container-lowest rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow duration-300 relative"
        >
          {kpi.accentColor && (
            <div
              className={`w-1.5 shrink-0 ${ACCENT_COLORS[kpi.accentColor] || 'bg-primary'}`}
              aria-hidden
            />
          )}
          <div className="p-5 flex-1">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-primary uppercase tracking-tight font-label">
                {kpi.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-label ${BADGE_COLORS[kpi.accentColor] || 'bg-surface-container text-on-surface'}`}>
                {kpi.year}
              </span>
            </div>
            <div className={`text-3xl font-extrabold mb-2 font-headline tracking-tighter ${VALUE_COLORS[kpi.accentColor] || 'text-secondary'}`}>
              {kpi.value}
              {kpi.unit && <span className="text-xs font-medium text-outline ml-1">{kpi.unit}</span>}
            </div>
            {kpi.comparisons && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {kpi.comparisons.map((comp, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[10px] font-label text-outline uppercase tracking-wider">{comp.label}</span>
                    <span className="text-xs font-bold text-on-surface">{comp.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
