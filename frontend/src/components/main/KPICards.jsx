import KPICard from './KPICard';

export default function KPICards({ kpiCards, columns = 6, isMainDashboard = false }) {
  if (!kpiCards?.length) return null;

  const gridClass = columns === 5
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4';

  return (
    <div className={`${gridClass} mb-8`}>
      {kpiCards.map((card) => (
        <KPICard
          key={card.id}
          label={card.label}
          value={card.value}
          year={card.year}
          unit={card.unit}
          isMainDashboard={isMainDashboard}
          accentColor={card.accentColor}
          accentColorHex={card.accentColorHex}
          regionalAvg={card.regionalAvg}
          nationalAvg={card.nationalAvg}
          regionalComparison={card.regionalComparison}
          nationalComparison={card.nationalComparison}
          auxLabel={card.auxLabel}
          auxText={card.auxText}
        />
      ))}
    </div>
  );
}