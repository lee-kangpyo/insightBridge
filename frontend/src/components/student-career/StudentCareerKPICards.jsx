import KPICard from '../main/KPICard';

export default function StudentCareerKPICards({ kpiCards }) {
  if (!kpiCards?.length) return null;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <KPICard
            key={card.id}
            label={card.label}
            value={card.value}
            year={card.year}
            unit={card.unit}
            accentColor={card.accentColor}
            accentColorHex={card.accentColorHex}
            regionalAvg={card.regionalAvg}
            nationalAvg={card.nationalAvg}
          />
        ))}
      </div>
    </div>
  );
}