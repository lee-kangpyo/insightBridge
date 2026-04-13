import KPICard from '../main/KPICard';

export default function ResearchIndustryStartupKPICards({ kpiCards }) {
  if (!kpiCards?.length) return null;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
            auxLabel={card.auxLabel}
            auxText={card.auxText}
          />
        ))}
      </div>
    </div>
  );
}