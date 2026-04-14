import KPICard from '../main/KPICard';
import EmptyState from "../common/EmptyState";

export default function CampusKPICards({ kpiCards }) {
  const rows = Array.isArray(kpiCards) ? kpiCards : [];
  if (!rows.length) {
    return (
      <section className="mb-8">
        <EmptyState
          title="미공시"
          description="캠퍼스 KPI 데이터가 미공시입니다."
          minHeight={220}
          icon="analytics"
        />
      </section>
    );
  }

  return (
    <section className="mb-8">
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
    </section>
  );
}