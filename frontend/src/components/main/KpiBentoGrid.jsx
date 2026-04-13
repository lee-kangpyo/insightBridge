import KPICard from "./KPICard";
import SmallKpiCard from "./SmallKpiCard";
import EmptyState from "../common/EmptyState";

export default function KpiBentoGrid({ baseYear, largeKpis, smallKpis }) {
  const displayLarge = Array.isArray(largeKpis) ? largeKpis : [];
  const displaySmall = Array.isArray(smallKpis) ? smallKpis : [];
  const hasAnyData = displayLarge.length > 0 || displaySmall.length > 0;

  return (
    <section className="mb-8">
      {hasAnyData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {displayLarge.map((kpi) => (
            <KPICard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              year={kpi.year}
              accentColor={kpi.accentColor}
              accentColorHex={kpi.accentColorHex}
              regionalComparison={kpi.regionalComparison}
              nationalComparison={kpi.nationalComparison}
              isMainDashboard={true}
            />
          ))}
          {displaySmall.map((kpi) => (
            <SmallKpiCard key={kpi.id} {...kpi} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="미공시"
          description={`${baseYear ?? ""}년 KPI 데이터가 미공시입니다.`.trim()}
          minHeight={240}
          icon="analytics"
        />
      )}
    </section>
  );
}