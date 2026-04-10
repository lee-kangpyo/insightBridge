import researchData from '../../data/research-industry-startup-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import {
  ResearchIndustryStartupKPICards,
  ResearchFundStructureChart,
  TechStartupProgressChart,
  ResearchIndustryStartupInsights,
  ResearchIndustryStartupTable,
} from './index';
import { useThemeInsights } from '../../hooks/useThemeInsights';
import { useThemeSourceRefs } from '../../hooks/useThemeSourceRefs';
import { useThemeChartBlockMeta } from '../../hooks/useThemeChartBlockMeta';

export default function ResearchIndustryStartupDashboard() {
  const { pageTitle, pageSubtitle, baseYear, filters, kpiCards, fundStructure, startupProgress, insights, tablePreview } =
    researchData;

  const { items: dbInsights } = useThemeInsights({
    screenCode: 'research',
    screenVer: 'v0.1',
    screenBaseYear: 2025,
    schlNm: '충남대학교',
  });

  const { refs: sourceRefs } = useThemeSourceRefs({
    screenCode: 'research',
    screenVer: 'v0.1',
    screenBaseYear: 2025,
    schlNm: '충남대학교',
  });

  const { chartLeft, chartRight } = useThemeChartBlockMeta({
    screenCode: 'research',
    screenVer: 'v0.1',
    screenBaseYear: 2025,
    schlNm: '충남대학교',
  });

  const insightsToRender = dbInsights?.length ? dbInsights : insights;
  const tableToRender = sourceRefs?.length ? sourceRefs : tablePreview;

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection title={pageTitle} subtitle={pageSubtitle} baseYear={baseYear} />

      <StatusChips filters={filters} />
      <ResearchIndustryStartupKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ResearchFundStructureChart
            fundStructure={fundStructure}
            title={chartLeft.title}
            subtitle={chartLeft.subtitle}
          />
        </div>
        <TechStartupProgressChart
          startupProgress={startupProgress}
          title={chartRight.title}
          subtitle={chartRight.subtitle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResearchIndustryStartupInsights insights={insightsToRender} />
        <div className="lg:col-span-2">
          <ResearchIndustryStartupTable tablePreview={tableToRender} />
        </div>
      </div>
    </div>
  );
}