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

export default function ResearchIndustryStartupDashboard() {
  const { pageTitle, pageSubtitle, baseYear, filters, kpiCards, fundStructure, startupProgress, insights, tablePreview } =
    researchData;

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection title={pageTitle} subtitle={pageSubtitle} baseYear={baseYear} />

      <StatusChips filters={filters} />
      <ResearchIndustryStartupKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ResearchFundStructureChart fundStructure={fundStructure} />
        </div>
        <TechStartupProgressChart startupProgress={startupProgress} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResearchIndustryStartupInsights insights={insights} />
        <div className="lg:col-span-2">
          <ResearchIndustryStartupTable tablePreview={tablePreview} />
        </div>
      </div>
    </div>
  );
}