export const CHART_COLORS = [
  '#60a5fa',
  '#34d399',
  '#f472b6',
  '#fb923c',
  '#a78bfa',
  '#38bdf8',
  '#fbbf24',
  '#4ade80',
] as const;

export const AXIS_LABEL_COLOR = '#475569';
export const AXIS_NAME_COLOR = '#1e3a5f';
export const GRID_LINE_COLOR = 'rgba(219,228,240,0.55)';
export const AXIS_LINE_COLOR = '#dbe4f0';

export const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.94)',
  borderColor: 'rgba(219,228,240,0.7)',
  borderWidth: 1,
  borderRadius: 12,
  padding: [10, 14] as [number, number],
  textStyle: { color: '#0f172a', fontSize: 12 },
  extraCssText: 'box-shadow:0 12px 32px rgba(2,132,199,0.12);backdrop-filter:blur(12px);',
} as const;

export const LEGEND_STYLE = {
  icon: 'roundRect',
  textStyle: { color: '#475569', fontSize: 11 },
  itemWidth: 12,
  itemHeight: 8,
} as const;
