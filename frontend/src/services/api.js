import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Attach stored token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const query = async (question) => {
  const response = await api.post('/api/query', { question });
  return response.data;
};

export const getOverviewMatrixPoints = async (params) => {
  const response = await api.get('/api/overview/matrix-points', { params });
  return response.data;
};

export const getOverviewRiskTable = async (params) => {
  const response = await api.get('/api/overview/risk-table', { params });
  return response.data;
};

export const getOverviewKpis = async (params) => {
  const response = await api.get('/api/overview/kpis', { params });
  return response.data;
};

export const getOverviewDetailGrid = async (params) => {
  const response = await api.get('/api/overview/detail-grid', { params });
  return response.data;
};

export const getThemeDetailGrid = async (params) => {
  const response = await api.get('/api/theme/detail-grid', { params });
  return response.data;
};

export const getThemeKpiCards = async (params) => {
  const response = await api.get('/api/theme/kpi-cards', { params });
  return response.data;
};

export const getThemeChartBlocks = async (params) => {
  const response = await api.get('/api/theme/chart-blocks', { params });
  return response.data;
};

export const getThemeTextBlocks = async (params) => {
  const response = await api.get('/api/theme/text-blocks', { params });
  return response.data;
};

export const getThemeSourceRefs = async (params) => {
  const response = await api.get('/api/theme/source-refs', { params });
  return response.data;
};

// Admission(입시/충원) 화면 전용 차트 API들.
// 공통 파라미터: { screen_code: 'admission', screen_ver: 'v0.1', screen_base_year, schl_nm, block_code }
// - block_code는 tq_screen_chart_block/tq_screen_chart_item의 블록을 특정한다. (예: CHART_LEFT/CHART_RIGHT)
// - 응답은 각 차트 컴포넌트가 바로 소비 가능한 shape로 내려온다.
export const getAdmissionEnrollmentRates = async (params) => {
  const response = await api.get('/api/admission/enrollment-rates', { params });
  return response.data;
};

// 전형별 최종등록률 / 동일 막대 차트용 (EnrollmentRateChart, student-career 등)
// - items: [{ type, bar_ratio_num(표시%), bar_ratio_display_text(막대 렌더) }]
export const getAdmissionOpportunityBalance = async (params) => {
  const response = await api.get('/api/admission/opportunity-balance', { params });
  return response.data;
};

// 입시/충원 "샘플 인사이트" 문구용
// - items: [{ text }]
export const getAdmissionInsights = async (params) => {
  const response = await api.get('/api/admission/insights', { params });
  return response.data;
};

// 기회균형 선발 구성 차트용 (OpportunityBalanceChart)
// - items: [{ category, bar_ratio_num(표시%), bar_ratio_display_text(막대 렌더) }]
export const getOverviewProgressMetrics = async (params) => {
  const response = await api.get('/api/overview/progress-metrics', { params });
  return response.data;
};

export const getOverviewInsights = async (params) => {
  // NOTE: backend의 신규 endpoint로 완전 교체
  const response = await api.get('/api/insights/core', { params });
  return response.data;
};

export const getOverviewTextBlocks = async (params) => {
  const response = await api.get('/api/overview/text-blocks', { params });
  return response.data;
};

export default api;
