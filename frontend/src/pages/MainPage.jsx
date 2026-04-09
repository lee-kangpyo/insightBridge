import MainLayout from '../layouts/MainLayout';
import PageTitleSection from '../components/main/PageTitleSection';
import KpiBentoGrid from '../components/main/KpiBentoGrid';
import StrengthWeaknessMatrix from '../components/main/StrengthWeaknessMatrix';
import InsightsPanel from '../components/main/InsightsPanel';
import RiskStrengthTable from '../components/main/RiskStrengthTable';
import ProgressMetricGrid from '../components/main/ProgressMetricGrid';
import sampleData from '../data/main_page_samples.json';
import { useEffect, useState } from 'react';
import { getOverviewMatrixPoints, getOverviewRiskTable } from '../services/api';

export default function MainPage() {
  const [matrix, setMatrix] = useState(sampleData.matrix);
  const [riskTable, setRiskTable] = useState(sampleData.riskTable);
  const [riskLegend, setRiskLegend] = useState(sampleData.riskLegend || []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOverviewMatrixPoints({
          screen_code: 'overview',
          screen_ver: 'v0.1',
          screen_base_year: 2025,
          metric_year: 2025,
          schl_nm: '충남대학교',
        });
        if (data?.points) setMatrix(data);
      } catch {
        // fallback: keep sample matrix
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOverviewRiskTable({
          screen_code: 'overview',
          screen_ver: 'v0.1',
          screen_base_year: 2025,
          schl_nm: '충남대학교',
        });
        if (data?.items?.length) {
          setRiskTable(data.items);
          setRiskLegend(data.legend || []);
        }
      } catch {
        // fallback: keep sample riskTable
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      <PageTitleSection meta={sampleData.meta} />
      <KpiBentoGrid
        largeKpis={sampleData.kpis.large}
        smallKpis={sampleData.kpis.small}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <StrengthWeaknessMatrix matrix={matrix} />
        <InsightsPanel insights={sampleData.insights} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RiskStrengthTable data={riskTable} legend={riskLegend} />
        <ProgressMetricGrid metrics={sampleData.progressMetrics} />
      </div>
    </MainLayout>
  );
}