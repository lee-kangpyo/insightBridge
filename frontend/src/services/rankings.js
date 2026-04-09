import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

/**
 * Searches for universities by name.
 * @param {string} query - The search query.
 * @returns {Promise<Array>} List of schools {school_name, school_code}.
 */
export const searchSchools = async (query) => {
  if (!query || !query.trim()) return [];
  const response = await api.get(`/api/rankings/search-schools?q=${encodeURIComponent(query)}`);
  return response.data;
};

/**
 * Fetches all available ranking indicators.
 * @returns {Promise<Array>} List of indicators {id, label}.
 */
export const getIndicators = async () => {
  const response = await api.get('/api/rankings/indicators');
  return response.data;
};

/**
 * Fetches ranking comparison data for a specific school and indicators.
 * @param {string} schoolCode - The university code.
 * @param {Array<string>} indicatorIds - List of indicator column names.
 * @returns {Promise<Object>} Comparison data.
 */
export const getComparison = async (schoolCode, indicatorIds) => {
  if (!schoolCode || !indicatorIds || indicatorIds.length === 0) return null;
  const indicatorsParam = indicatorIds.join(',');
  const response = await api.get(
    `/api/rankings/comparison?school_code=${schoolCode}&indicators=${indicatorsParam}`
  );
  return response.data;
};

export default {
  searchSchools,
  getIndicators,
  getComparison,
};
