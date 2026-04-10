import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
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

export const getOverviewProgressMetrics = async (params) => {
  const response = await api.get('/api/overview/progress-metrics', { params });
  return response.data;
};

export const getOverviewInsights = async (params) => {
  // NOTE: backend의 신규 endpoint로 완전 교체
  const response = await api.get('/api/insights/core', { params });
  return response.data;
};

export const getGovernanceKpis = async (params) => {
  const response = await api.get('/api/governance/kpis', { params });
  return response.data;
};

export const getGovernanceComplianceTable = async (params) => {
  const response = await api.get('/api/governance/compliance-table', { params });
  return response.data;
};

export const getGovernanceInsights = async (params) => {
  const response = await api.get('/api/governance/insights', { params });
  return response.data;
};
