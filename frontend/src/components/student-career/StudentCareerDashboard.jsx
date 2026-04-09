import studentCareerData from '../../data/student-career-data.json';
import {
  StudentCareerFilters,
  StudentCareerKPICards,
  DropoutReasonChart,
  EmploymentRetentionChart,
  StudentCareerInsights,
  StudentCareerTable,
} from './index';

export default function StudentCareerDashboard() {
  const { filters, kpiCards, dropoutReasons, employmentRetention, insights, tablePreview } =
    studentCareerData;

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-6 space-y-8">
      <StudentCareerFilters filters={filters} />
      <StudentCareerKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DropoutReasonChart dropoutReasons={dropoutReasons} />
        <EmploymentRetentionChart employmentRetention={employmentRetention} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <StudentCareerInsights insights={insights} />
        <div className="lg:col-span-2">
          <StudentCareerTable tablePreview={tablePreview} />
        </div>
      </div>
    </div>
  );
}
