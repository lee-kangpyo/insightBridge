import campusData from '../../data/campus-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import { CampusKPICards } from './index';

const BAR_FILL = {
  primary: '#002c5a',
  secondary: '#006492',
  'secondary-container': '#58bcfd',
  error: '#ba1a1a',
  tertiary: '#61c462',
};

const STATUS_BADGE_COLORS = {
  'tertiary-fixed': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'secondary-fixed': 'bg-secondary-fixed text-on-secondary-fixed',
  'surface-container-high': 'bg-surface-container-high text-on-surface-variant',
};

const SAFETY_BORDER_COLORS = {
  'tertiary-fixed': 'border-b-tertiary-fixed/15',
  'secondary-fixed': 'border-b-secondary-fixed/15',
  'surface-container-high': 'border-b-outline-variant/15',
};

export default function CampusDashboard() {
  const { meta, filters, kpis, campusConfiguration, safetyStatus, insights, referenceTable } = campusData;

  return (
    <div className="max-w-[1920px] mx-auto px-8 py-8 space-y-8">
      <PageTitleSection
        title={meta.dashboardTitle}
        subtitle={meta.institutionalDashboardLabel}
        baseYear={meta.baseYear}
      />

      <StatusChips filters={filters} />
      <CampusKPICards kpis={kpis} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-low rounded-lg p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-headline font-bold text-primary">교지 구성 및 이용 현황</h2>
            <span className="text-xs font-label text-outline-variant">단위: 제곱미터(㎡)</span>
          </div>
          <div className="space-y-10">
            {campusConfiguration.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface">{item.item}</span>
                  <span className="text-primary">{item.value.toLocaleString()} {item.unit}</span>
                </div>
                <div className="w-full h-8 bg-surface-container-highest rounded-full overflow-hidden flex">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: BAR_FILL[item.color] || BAR_FILL.primary,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
          <h2 className="text-xl font-headline font-bold text-primary mb-8">안전·보호 운영 상태</h2>
          <div className="space-y-6">
            {safetyStatus.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between py-3 border-b ${SAFETY_BORDER_COLORS[item.statusColor] || 'border-b-outline-variant/15'}`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface-variant">{item.label}</span>
                  {item.description && (
                    <span className="text-[10px] text-outline">{item.description}</span>
                  )}
                </div>
                {item.statusColor ? (
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${STATUS_BADGE_COLORS[item.statusColor] || 'bg-surface-container text-on-surface'}`}>
                    {item.value}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-primary">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <h2 className="text-lg font-headline font-bold text-primary">인사이트 분석</h2>
          </div>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex gap-3 p-4 bg-surface-container-low/50 rounded-xl">
                <span className="text-xl font-extrabold text-primary opacity-30 font-headline shrink-0">
                  {insight.number}
                </span>
                <p className="text-sm text-on-surface leading-relaxed">
                  <span className="font-bold text-secondary">{insight.title}:</span> {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
            <h2 className="text-lg font-headline font-bold text-primary">참조 데이터 테이블 프리뷰</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-outline-variant/20">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase">
                <tr>
                  <th className="px-4 py-3 border-b border-outline-variant/15 w-40">TABLE_NAME</th>
                  <th className="px-4 py-3 border-b border-outline-variant/15">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody className="text-on-surface-variant">
                {referenceTable.map((row, index) => (
                  <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-4 py-3 border-b border-outline-variant/10 font-bold">{row.tableId}</td>
                    <td className="px-4 py-3 border-b border-outline-variant/10">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
