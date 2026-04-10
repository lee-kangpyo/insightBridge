/**
 * `GET /api/theme/detail-grid` 행 → `LargeKpiCard` / `GovernanceKPICards` 계약.
 * - comparison: `regionAvgDisplay`·`nationalAvgDisplay`의 ▲/▼와 `comparisonDirectionCode`로 TrendBadge status 추정
 * - `accentColorHex`가 있으면 카드에서 테두리·값 색에 사용
 */

function trendStatusFromDisplay(text, comparisonDirectionCode) {
  if (text == null || typeof text !== 'string') return 'neutral';
  const t = text.trim();
  const higherBetter = String(comparisonDirectionCode || '').toUpperCase() !== 'LOWER_BETTER';
  if (t.includes('▲')) return higherBetter ? 'positive' : 'negative';
  if (t.includes('▼')) return higherBetter ? 'negative' : 'positive';
  return 'neutral';
}

/** @param {object} row — theme detail-grid item */
export function mapDetailGridRowToGovernanceKpiCard(row) {
  return {
    id: row.metricCode,
    label: row.metricName,
    value: row.myValueDisplay,
    year: row.metricYear,
    accentColor: 'primary',
    accentColorHex: row.accentColorHex || undefined,
    regionalComparison: {
      value: row.regionAvgDisplay,
      status: trendStatusFromDisplay(row.regionAvgDisplay, row.comparisonDirectionCode),
    },
    nationalComparison: {
      value: row.nationalAvgDisplay,
      status: trendStatusFromDisplay(row.nationalAvgDisplay, row.comparisonDirectionCode),
    },
  };
}
