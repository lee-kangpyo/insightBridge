import educationFacultyData from '../../data/education-faculty-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import {
  EducationFacultyKPICards,
  SemesterFullTimeRatioChart,
  CourseSizeDistributionChart,
  EducationFacultyInsights,
  EducationFacultyTable,
} from './index';
import { useThemeInsights } from '../../hooks/useThemeInsights';
import { useThemeSourceRefs } from '../../hooks/useThemeSourceRefs';
import { useThemeChartBlockMeta } from '../../hooks/useThemeChartBlockMeta';

export default function EducationFacultyDashboard() {
  const { pageTitle, pageSubtitle, baseYear, filters, kpiCards, semesterRatios, courseDistribution, insights, tablePreview } =
    educationFacultyData;

  const { items: dbInsights } = useThemeInsights({
    screenCode: 'education',
    screenVer: 'v0.1',
    screenBaseYear: 2025,
    schlNm: '충남대학교',
  });

  const { refs: sourceRefs } = useThemeSourceRefs({
    screenCode: 'education',
    screenVer: 'v0.1',
    screenBaseYear: 2025,
    schlNm: '충남대학교',
  });

  const { chartLeft, chartRight } = useThemeChartBlockMeta({
    screenCode: 'education',
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
      <EducationFacultyKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterFullTimeRatioChart
          semesterRatios={semesterRatios}
          title={chartLeft.title}
          subtitle={chartLeft.subtitle}
        />
        <CourseSizeDistributionChart
          courseDistribution={courseDistribution}
          title={chartRight.title}
          subtitle={chartRight.subtitle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EducationFacultyInsights insights={insightsToRender} />
        <div className="lg:col-span-2">
          <EducationFacultyTable tablePreview={tableToRender} />
        </div>
      </div>
    </div>
  );
}