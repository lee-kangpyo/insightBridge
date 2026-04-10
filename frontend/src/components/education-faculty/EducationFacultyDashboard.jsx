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

export default function EducationFacultyDashboard() {
  const { pageTitle, pageSubtitle, baseYear, filters, kpiCards, semesterRatios, courseDistribution, insights, tablePreview } =
    educationFacultyData;

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection title={pageTitle} subtitle={pageSubtitle} baseYear={baseYear} />

      <StatusChips filters={filters} />
      <EducationFacultyKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterFullTimeRatioChart semesterRatios={semesterRatios} />
        <CourseSizeDistributionChart courseDistribution={courseDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EducationFacultyInsights insights={insights} />
        <div className="lg:col-span-2">
          <EducationFacultyTable tablePreview={tablePreview} />
        </div>
      </div>
    </div>
  );
}