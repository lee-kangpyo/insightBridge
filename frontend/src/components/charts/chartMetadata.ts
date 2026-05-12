export type ChartCategory = 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'special';

export interface ChartMetadata {
  type: string;
  name: string;
  icon: string;
  description: string;
  category: ChartCategory;
}

export const chartMetadata: ChartMetadata[] = [
  { type: 'column', name: '세로 막대형', icon: 'bar_chart', description: '카테고리별 수치를 세로 막대로 표현하는 기본 차트', category: 'bar' },
  { type: 'stacked_bar', name: '누적 가로 막대형', icon: 'stacked_bar_chart', description: '여러 데이터 계열의 누적된 가로 막대 차트', category: 'bar' },
  { type: 'horizontal_bar', name: '가로 막대형', icon: 'horizontal_bar_chart', description: '카테고리별 수치를 가로 막대로 표현하는 차트', category: 'bar' },
  { type: 'line_multi', name: '다중 선형', icon: 'show_chart', description: '여러 데이터 계열을 선으로 표현하는 차트', category: 'line' },
  { type: 'stacked_column', name: '누적 세로 막대형', icon: 'view_column', description: '여러 데이터 계열의 누적된 세로 막대 차트', category: 'bar' },
  { type: 'line_dots', name: '점 표시 선형', icon: 'timeline', description: '데이터 포인트에 점이 표시된 선 차트', category: 'line' },
  { type: 'area', name: '영역형', icon: 'area_chart', description: '선 아래 영역이 채워진 면적 차트', category: 'line' },
  { type: 'area_stacked', name: '누적 영역형', icon: 'stacked_area_chart', description: '누적된 영역으로 표현되는 차트', category: 'line' },
  { type: 'streamgraph', name: '스트림 그래프', icon: 'stream', description: '중앙을 중심으로 유동적으로 표현되는 영역 차트', category: 'line' },
  { type: 'scatter', name: '산점도', icon: 'scatter_plot', description: '두 변수 간의 관계를 점으로 표현하는 차트', category: 'scatter' },
  { type: 'heatmap_grid', name: '히트맵 그리드', icon: 'grid_on', description: '값의 크기에 따라 색상으로 표현하는 그리드 차트', category: 'heatmap' },
  { type: 'treemap', name: '트리맵', icon: 'treemap', description: '계층적 데이터를 사각형 크기로 표현하는 차트', category: 'special' },
  { type: 'waterfall', name: '워터폴', icon: 'waterfall_chart', description: '변화의 증감을 순차적으로 표현하는 차트', category: 'bar' },
  { type: 'calendar_heatmap', name: '캘린더 히트맵', icon: 'calendar_month', description: '날짜별 데이터를 캘린더 형태로 표현하는 히트맵', category: 'heatmap' },
  { type: 'population_pyramid', name: '인구 피라미드', icon: 'demography', description: '인구 분포를 연령대별로 좌우 대칭으로 표현하는 차트', category: 'bar' },
  { type: 'pie', name: '원형', icon: 'pie_chart', description: '전체 대비 각 항목의 비율을 원형으로 표현하는 차트', category: 'pie' },
  { type: 'donut', name: '도넛형', icon: 'donut_large', description: '중앙이 빈 원형으로 비율을 표현하는 차트', category: 'pie' },
  { type: 'nightingale_rose', name: '나이팅게일 로즈', icon: 'radar_chart', description: '극좌표 방식으로 항목별 크기를 표현하는 차트', category: 'pie' },
  { type: 'radar', name: '레이더', icon: 'radar', description: '여러 축을 중심으로 데이터를 방사형으로 표현하는 차트', category: 'special' },
  { type: 'histogram', name: '히스토그램', icon: 'histogram', description: '데이터의 빈도분포를 구간별로 표현하는 차트', category: 'bar' },
  { type: 'bubble', name: '버블 차트', icon: 'bubble_chart', description: '세 개의 변수(X, Y, 크기)를 점의 위치와 크기로 표현하는 차트', category: 'scatter' },
];

export const getChartMetadataByType = (type: string): ChartMetadata | undefined => {
  return chartMetadata.find(chart => chart.type === type);
};

export const getChartsByCategory = (category: ChartCategory): ChartMetadata[] => {
  return chartMetadata.filter(chart => chart.category === category);
};
