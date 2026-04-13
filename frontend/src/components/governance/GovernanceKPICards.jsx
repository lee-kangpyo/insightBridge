import KPICard from '../main/KPICard';
import EmptyState from "../common/EmptyState";

export default function GovernanceKPICards({ kpiCards }) {
  const rows = Array.isArray(kpiCards) ? kpiCards : [];
  if (!rows.length) {
    return (
      <div className="mb-8">
        <EmptyState
          title="미공시"
          description="거버넌스 KPI 데이터가 미공시입니다."
          minHeight={220}
          icon="analytics"
        />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {rows.map((card) => (
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