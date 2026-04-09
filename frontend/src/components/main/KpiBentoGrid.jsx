import LargeKpiCard from "./LargeKpiCard";
import SmallKpiCard from "./SmallKpiCard";

export default function KpiBentoGrid({ largeKpis, smallKpis }) {
  if (!largeKpis?.length && !smallKpis?.length) return null;

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {largeKpis?.map((kpi) => (
          <LargeKpiCard key={kpi.id} {...kpi} />
        ))}
        {smallKpis?.map((kpi) => (
          <SmallKpiCard key={kpi.id} {...kpi} />
        ))}
      </div>
    </section>
  );
}
