import KPICard from '../main/KPICard';
import EmptyState from "../common/EmptyState";

export default function ResearchIndustryStartupKPICards({ kpiCards }) {
  const rows = Array.isArray(kpiCards) ? kpiCards : [];
  if (!rows.length) {
    return (
      <div className="mb-8">
        <EmptyState
          title="미공시"
          description="연구/산학 KPI 데이터가 미공시입니다."
          minHeight={220}
          icon="analytics"
        />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {rows.map((card) => (
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