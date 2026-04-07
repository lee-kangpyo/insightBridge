import DashboardPageHeader from '../components/dashboard/DashboardPageHeader';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import RankingHeatmapCard from '../components/dashboard/RankingHeatmapCard';
import InstitutionSummaryPanel from '../components/dashboard/InstitutionSummaryPanel';
import StrategicInsightsCard from '../components/dashboard/StrategicInsightsCard';
import KpiTile from '../components/dashboard/KpiTile';

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 md:p-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <DashboardPageHeader />
        <DashboardFilters />
      </section>
      <div className="grid grid-cols-12 gap-6">
        <RankingHeatmapCard />
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-3">
          <InstitutionSummaryPanel />
          <StrategicInsightsCard />
        </div>
      </div>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiTile
          icon="trending_up"
          delta="+8.4%"
          label="등록 트렌드"
          title="신입생 선발 지수"
          deltaClassName="text-secondary group-hover:text-secondary-fixed"
        />
        <KpiTile
          icon="account_balance"
          delta="-1.5%"
          label="운영 효율성"
          title="시설 관리비"
          deltaClassName="text-on-tertiary-container group-hover:text-tertiary-fixed"
        />
        <KpiTile
          icon="verified_user"
          delta="Top 10%"
          label="컴플라이언스 현황"
          title="연구 윤리 감사"
          deltaClassName="text-secondary group-hover:text-secondary-fixed"
        />
      </section>
    </div>
  );
}
