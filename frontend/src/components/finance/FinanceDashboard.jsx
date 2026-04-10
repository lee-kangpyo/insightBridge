import financeData from '../../data/finance-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import { FinanceKPICards } from './index';

/** docs/6tap/code.html 계열별 막대(bg-primary, bg-secondary, …)와 동일 — JIT 누락 방지용 hex */
const BAR_FILL = {
  primary: '#002c5a',
  secondary: '#006492',
  'secondary-container': '#58bcfd',
  'on-primary-container': '#84b0f7',
  'primary-fixed-dim': '#a8c8ff',
};

const REVENUE_BORDER = {
  'border-primary': BAR_FILL.primary,
  'border-secondary': BAR_FILL.secondary,
  'border-secondary-container': BAR_FILL['secondary-container'],
  'border-on-primary-container': BAR_FILL['on-primary-container'],
  'border-primary-fixed-dim': BAR_FILL['primary-fixed-dim'],
};

const STATUS_BADGE_COLORS = {
  'tertiary-fixed': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'secondary-fixed': 'bg-secondary-fixed text-on-secondary-fixed',
};

export default function FinanceDashboard() {
  const { meta, filters, kpis, tuitionByField, revenueStructure, insights, referenceTable } = financeData;

  return (
    <div className="max-w-[1920px] mx-auto px-8 py-8 space-y-8">
      <PageTitleSection 
        title={meta.dashboardTitle} 
        subtitle={meta.institutionalDashboardLabel}
        baseYear={meta.baseYear}
      />

      <StatusChips filters={filters} />
      <FinanceKPICards kpis={kpis} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-low rounded-lg p-8">
          <h3 className="text-lg font-bold text-primary mb-6 font-headline">계열별 등록금 수준</h3>
          <div className="space-y-6">
            {tuitionByField.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                  <span>{item.field}</span>
                  <span>{item.amount.toLocaleString()}원</span>
                </div>
                <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
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

        <div className="bg-surface-container-low rounded-lg p-8">
          <h3 className="text-lg font-bold text-primary mb-6 font-headline">세입 구조 상위 항목</h3>
          <div className="space-y-4">
            {revenueStructure.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border-l-4 border-solid"
                style={{
                  borderLeftColor: REVENUE_BORDER[item.borderColor] || REVENUE_BORDER['border-primary'],
                }}
              >
                <span className="text-sm font-medium">{item.item}</span>
                <span className="text-sm font-extrabold text-secondary">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg p-8 border-l-8 border-primary shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6 font-headline flex items-center gap-2">
          <span className="material-symbols-outlined">lightbulb</span>
          샘플 인사이트
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {insights.map((insight, index) => (
            <div key={index} className="flex gap-4">
              <span className="text-xl font-extrabold text-primary opacity-30 font-headline">
                {insight.number}
              </span>
              <p className="text-sm text-on-surface-variant leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary font-headline">참조 테이블 프리뷰</h3>
          <button className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline transition-all">
            전체보기
          </button>
        </div>
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest">
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Table ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">설명</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">상태</th>
                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">최종 업데이트</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {referenceTable.map((row, index) => (
                <tr key={index} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold font-headline">{row.tableId}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.description}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${STATUS_BADGE_COLORS[row.statusColor] || 'bg-surface-container text-on-surface'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}