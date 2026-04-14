import KPICard from '../main/KPICard';
import EmptyState from "../common/EmptyState";

export default function StudentCareerKPICards({ kpiCards }) {
  const rows = Array.isArray(kpiCards) ? kpiCards : [];
  if (!rows.length) {
    return (
      <div className="mb-8">
        <EmptyState
          title="미공시"
          description="학생/진로 KPI 데이터가 미공시입니다."
          minHeight={220}
          icon="analytics"
        />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
          />
        ))}
      </div>
    </div>
  );
}