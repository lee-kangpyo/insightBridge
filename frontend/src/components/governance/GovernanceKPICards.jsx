import LargeKpiCard from '../main/LargeKpiCard';

export default function GovernanceKPICards({ kpiCards }) {
  if (!kpiCards?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiCards.map((card) => (
        <LargeKpiCard
          key={card.id}
          label={card.label}
          value={card.value}
          year={card.year}
          accentColor={card.accentColor}
          regionalComparison={card.regionalComparison}
          nationalComparison={card.nationalComparison}
        />
      ))}
    </div>
  );
}
