import KPICard from "./KPICard";
import SmallKpiCard from "./SmallKpiCard";

export default function KpiBentoGrid({ largeKpis, smallKpis }) {
  if (!largeKpis?.length && !smallKpis?.length) return null;

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {largeKpis?.map((kpi) => (
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
        {smallKpis?.map((kpi) => (
          <SmallKpiCard key={kpi.id} {...kpi} />
        ))}
      </div>
    </section>
  );
}