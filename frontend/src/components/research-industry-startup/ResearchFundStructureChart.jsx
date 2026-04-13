import { useMemo } from 'react';
import { normalizeResearchFundSources } from '../../utils/normalizeResearchFundSources';
import { AnimatedPercentBarFill } from '../common/AnimatedPercentBarFill';
import EmptyState from "../common/EmptyState";

const BAR_COLORS = {
  '교내 연구비': 'bg-primary',
  교내: 'bg-primary',
  중앙정부: 'bg-secondary',
  지자체: 'bg-secondary-container',
  민간: 'bg-tertiary',
  외국: 'bg-outline',
};

/**
 * @param {object} props
 * @param {Array} [props.overrideSources] — undefined: 샘플 fundStructure 사용. 배열(빈 배열 포함): API/DB 행만 사용(빈 배열이면 차트 없음).
 * @param {string|number} [props.bannerYear] — override 사용 시 상단 연도(샘플 JSON 연도와 섞이지 않게)
 * @param {string} [props.bannerTotalText] — override 사용 시 상단 합계 문구
 */
export default function ResearchFundStructureChart({
  fundStructure,
  title,
  subtitle,
  overrideSources,
  bannerYear,
  bannerTotalText,
}) {
  const heading = title?.trim() ? title : '연구비 재원 구조';
  const sub = subtitle?.trim() ? subtitle : '';

  const latest = useMemo(() => {
    if (!Array.isArray(fundStructure) || fundStructure.length === 0) return null;
    return [...fundStructure].sort((a, b) => Number(b.year) - Number(a.year))[0];
  }, [fundStructure]);

  const rows = useMemo(() => {
    if (overrideSources !== undefined) {
      return normalizeResearchFundSources(overrideSources);
    }
    return normalizeResearchFundSources(latest?.sources);
  }, [latest, overrideSources]);

  const hasRows = rows.length > 0;

  const showDbBanner = overrideSources !== undefined && bannerYear != null;
  const banner = showDbBanner
    ? { year: String(bannerYear), total: bannerTotalText ?? '' }
    : latest
      ? { year: String(latest.year), total: latest.total }
      : null;

  return (
    <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm border border-outline-variant/10">
      <div className="mb-8">
        <h3 className="text-xl font-bold font-headline text-primary">{heading}</h3>
        {sub ? <p className="mt-1 text-xs text-on-surface-variant">{sub}</p> : null}
        {banner ? (
          <p className="mt-2 text-sm text-on-surface-variant">
            <span className="font-semibold text-primary">{banner.year}년</span>
            {banner.total ? (
              <>
                <span className="mx-2 text-outline">·</span>
                <span>{banner.total}</span>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
      {hasRows ? (
        <div className="space-y-6">
          {rows.map((item) => {
            const pct = Math.min(100, Math.max(0, Number(item.percentage) || 0));
            const barClass = BAR_COLORS[item.name] || 'bg-secondary';
            return (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-on-surface-variant">{item.name}</span>
                  <span className="font-bold text-secondary">
                    {pct}
                    <span className="text-xs font-normal text-outline">%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                  <AnimatedPercentBarFill
                    percent={pct}
                    className={`h-full shrink-0 rounded-full ${barClass}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="미공시"
          description="연구비 재원 구조 데이터가 미공시입니다."
          minHeight={240}
          icon="donut_small"
        />
      )}
    </div>
  );
}
