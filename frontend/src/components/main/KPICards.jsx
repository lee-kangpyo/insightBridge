import KPICard from './KPICard';
import EmptyState from "../common/EmptyState";

export default function KPICards({ kpiCards, columns = 6, isMainDashboard = false }) {
  const rows = Array.isArray(kpiCards) ? kpiCards : [];

  const gridClass = columns === 5
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4';

  if (!rows.length) {
    return (
      <div className="mb-8">
        <EmptyState
          title="미공시"
          description="핵심 KPI 데이터가 미공시입니다."
          minHeight={220}
          icon="analytics"
        />
      </div>
    );
  }

  return (
    <div className={`${gridClass} mb-8`}>
      {rows.map((card) => (
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