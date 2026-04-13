import KPICard from '../main/KPICard';

export default function GovernanceKPICards({ kpiCards }) {
  if (!kpiCards?.length) return null;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {kpiCards.map((card) => (
          <KPICard
            key={card.id}
            label={card.label}
            value={card.value}
            year={card.year}
            accentColor={card.accentColor}
            accentColorHex={card.accentColorHex}
            regionalComparison={card.regionalComparison}
            nationalComparison={card.nationalComparison}
          />
        ))}
      </div>
    </div>
  );
}