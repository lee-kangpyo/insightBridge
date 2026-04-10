import { useEffect, useMemo, useState } from 'react';
import studentCareerData from '../../data/student-career-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import { AdmissionKPICards, EnrollmentRateChart } from '../admission';
import { StudentCareerInsights, StudentCareerTable } from './index';
import {
  getAdmissionEnrollmentRates,
  getThemeDetailGrid,
} from '../../services/api';
import { useThemeInsights } from '../../hooks/useThemeInsights';
import { useThemeSourceRefs } from '../../hooks/useThemeSourceRefs';
import { useThemeChartBlockMeta } from '../../hooks/useThemeChartBlockMeta';

export default function StudentCareerDashboard() {
  const { pageTitle, pageSubtitle, baseYear, filters, insights } = studentCareerData;

  const sourceRefParams = useMemo(
    () => ({
      screen_code: 'student',
      screen_ver: 'v0.1',
      screen_base_year: 2025,
      schl_nm: '충남대학교',
    }),
    [],
  );

  const [kpiCards, setKpiCards] = useState([]);
  const [chartLeftItems, setChartLeftItems] = useState([]);
  const [chartLeftMeta, setChartLeftMeta] = useState({ title: '', subtitle: '' });
  const [chartRightItems, setChartRightItems] = useState([]);
  const [chartRightMeta, setChartRightMeta] = useState({ title: '', subtitle: '' });

  const { items: dbInsights } = useThemeInsights({
    screenCode: sourceRefParams.screen_code,
    screenVer: sourceRefParams.screen_ver,
    screenBaseYear: sourceRefParams.screen_base_year,
    schlNm: sourceRefParams.schl_nm,
    lineRole: 'INSIGHT',
  });

  const { refs: sourceRefs } = useThemeSourceRefs({
    screenCode: sourceRefParams.screen_code,
    screenVer: sourceRefParams.screen_ver,
    screenBaseYear: sourceRefParams.screen_base_year,
    schlNm: sourceRefParams.schl_nm,
  });

  const { chartLeft: chartBlockLeft, chartRight: chartBlockRight } = useThemeChartBlockMeta({
    screenCode: sourceRefParams.screen_code,
    screenVer: sourceRefParams.screen_ver,
    screenBaseYear: sourceRefParams.screen_base_year,
    schlNm: sourceRefParams.schl_nm,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getThemeDetailGrid(sourceRefParams);
        const items = Array.isArray(data?.items) ? data.items : [];
        const mapped = items.map((row) => ({
          id: row.metricCode,
          label: row.metricName,
          value: row.myValueDisplay,
          unit: '',
          regionalAvg: row.regionAvgDisplay,
          nationalAvg: row.nationalAvgDisplay,
          accentColorHex: row.accentColorHex,
        }));
        setKpiCards(mapped);
      } catch {
        setKpiCards([]);
      }
    };
    load();
  }, [sourceRefParams]);


  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdmissionEnrollmentRates({
          ...sourceRefParams,
          block_code: 'CHART_LEFT',
        });
        setChartLeftItems(Array.isArray(data?.items) ? data.items : []);
        setChartLeftMeta({
          title: typeof data?.title === 'string' ? data.title : '',
          subtitle: typeof data?.subtitle === 'string' ? data.subtitle : '',
        });
      } catch {
        setChartLeftItems([]);
        setChartLeftMeta({ title: '', subtitle: '' });
      }
    };
    load();
  }, [sourceRefParams]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdmissionEnrollmentRates({
          ...sourceRefParams,
          block_code: 'CHART_RIGHT',
        });
        setChartRightItems(Array.isArray(data?.items) ? data.items : []);
        setChartRightMeta({
          title: typeof data?.title === 'string' ? data.title : '',
          subtitle: typeof data?.subtitle === 'string' ? data.subtitle : '',
        });
      } catch {
        setChartRightItems([]);
        setChartRightMeta({ title: '', subtitle: '' });
      }
    };
    load();
  }, [sourceRefParams]);

  const insightsToRender = dbInsights?.length ? dbInsights : insights;

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection title={pageTitle} subtitle={pageSubtitle} baseYear={baseYear} />

      <StatusChips filters={filters} />
      <AdmissionKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnrollmentRateChart
          title={chartLeftMeta.title || chartBlockLeft.title}
          subtitle={chartLeftMeta.subtitle || chartBlockLeft.subtitle}
          enrollmentRates={chartLeftItems}
        />
        <EnrollmentRateChart
          title={chartRightMeta.title || chartBlockRight.title}
          subtitle={chartRightMeta.subtitle || chartBlockRight.subtitle}
          enrollmentRates={chartRightItems}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <StudentCareerInsights insights={insightsToRender} />
        <div className="lg:col-span-2">
          <StudentCareerTable refs={sourceRefs} />
        </div>
      </div>
    </div>
  );
}
