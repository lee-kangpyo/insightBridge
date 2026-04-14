import { useMemo } from 'react';
import { normalizeResearchFundSources } from '../../utils/normalizeResearchFundSources';
import ThemeBarRatioFill from '../common/ThemeBarRatioFill';
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
 * @param {Array} props.overrideSources — DB/API 행만 (빈 배열이면 미공시)
 * @param {string|number} [props.bannerYear]
 * @param {string} [props.bannerTotalText]
 */
export default function ResearchFundStructureChart({
  title,
  subtitle,
  overrideSources,
  bannerYear,
  bannerTotalText,
}) {
  const heading = title?.trim() ? title : '연구비 재원 구조';
  const sub = subtitle?.trim() ? subtitle : '';

  const rows = useMemo(() => {
    if (!Array.isArray(overrideSources)) return [];
    return normalizeResearchFundSources(overrideSources);
  }, [overrideSources]);

  const hasRows = rows.length > 0;

  const banner =
    bannerYear != null
      ? { year: String(bannerYear), total: bannerTotalText ?? '' }
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
                </div>
                <ThemeBarRatioFill
                  percent={pct}
                  barRatioDisplayText={item.bar_ratio_display_text}
                  fillClassName={barClass}
                />
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
