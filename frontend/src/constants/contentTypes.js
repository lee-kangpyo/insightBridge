/**
 * contentType 별 메타 정보 상수
 * ContentsList(목록)와 ContentsCreate(생성) 양쪽에서 공통 참조
 */
export const CONTENT_TYPE_MAP = {
  chart: {
    label: '차트',
    bgColor: '#d5e3ff',
    textColor: '#004282',
    icon: 'bar_chart',
  },
  grid: {
    label: '그리드',
    bgColor: '#cae6ff',
    textColor: '#004a6d',
    icon: 'grid_on',
  },
  card: {
    label: '카드',
    bgColor: '#94f990',
    textColor: '#005313',
    icon: 'space_dashboard',
  },
  sql: {
    label: '데이터조회',
    bgColor: '#e0e3e6',
    textColor: '#424750',
    icon: 'database',
  },
};

/** contentType 배열 순서 (select 옵션 등에서 사용) */
export const CONTENT_TYPES = ['chart', 'grid', 'card', 'sql'];
