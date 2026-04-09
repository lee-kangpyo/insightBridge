import admissionData from '../../data/admission-data.json';
import {
  AdmissionFilters,
  AdmissionKPICards,
  EnrollmentRateChart,
  OpportunityBalanceChart,
  AdmissionInsights,
  AdmissionTable,
} from './index';

export default function AdmissionDashboard() {
  const { pageTitle, filters, kpiCards, enrollmentRates, opportunityBalance, insights, tablePreview } =
    admissionData;

  return (
    <div className="mb-8 max-w-[1600px] mx-auto">
      <h1 className="font-headline text-3xl font-extrabold text-primary mb-6 tracking-tight">
        {pageTitle}
      </h1>

      <AdmissionFilters filters={filters} />
      <AdmissionKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <EnrollmentRateChart enrollmentRates={enrollmentRates} />
        <OpportunityBalanceChart opportunityBalance={opportunityBalance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AdmissionInsights insights={insights} />
        <AdmissionTable tablePreview={tablePreview} />
      </div>
    </div>
  );
}