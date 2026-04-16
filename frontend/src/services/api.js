import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send cookies with every request
});

// Interceptor for handling common authentication errors (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Could trigger a logout or redirect here if needed
      console.warn('Unauthorized request - session may have expired');
    }
    return Promise.reject(error);
  }
);

/**
 * Common wrapper for fetch requests (primarily used for streaming)
 * that includes necessary credentials/cookies.
 */
export const requestWithAuth = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include', // Ensure cookies are sent
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
};

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

export const getAdmissionEnrollmentRates = async (params) => {
  const response = await api.get('/api/admission/enrollment-rates', { params });
  return response.data;
};

export const getAdmissionOpportunityBalance = async (params) => {
  const response = await api.get('/api/admission/opportunity-balance', { params });
  return response.data;
};

export const getAdmissionInsights = async (params) => {
  const response = await api.get('/api/admission/insights', { params });
  return response.data;
};

export const getOverviewProgressMetrics = async (params) => {
  const response = await api.get('/api/overview/progress-metrics', { params });
  return response.data;
};

export const getOverviewInsights = async (params) => {
  const response = await api.get('/api/insights/core', { params });
  return response.data;
};

export const getOverviewTextBlocks = async (params) => {
  const response = await api.get('/api/overview/text-blocks', { params });
  return response.data;
};

async function parseSseStream(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop();

    for (const part of parts) {
      if (!part.trim()) continue;
      let eventType = 'message';
      let dataStr = '';

      for (const line of part.split('\n')) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          dataStr = line.slice(6).trim();
        }
      }

      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          onEvent(eventType, data);
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}

export const queryStream = async (question, onCandidate, onDone, onError) => {
  try {
    const response = await requestWithAuth('/api/query', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      onError?.(new Error(err.detail || 'Query failed'));
      return;
    }

    await parseSseStream(response, (eventType, data) => {
      if (eventType === 'candidate') onCandidate?.(data);
      else if (eventType === 'done') onDone?.(data);
      else if (eventType === 'error') onError?.(new Error(data.error || 'Stream error'));
    });
  } catch (err) {
    onError?.(err);
  }
};

export const refineQuery = async (
  originalQuestion,
  feedback,
  previousCandidates,
  onCandidate,
  onDone,
  onError
) => {
  try {
    const response = await requestWithAuth('/api/query/refine', {
      method: 'POST',
      body: JSON.stringify({
        original_question: originalQuestion,
        feedback,
        previous_candidates: previousCandidates,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      onError?.(new Error(err.detail || 'Refine failed'));
      return;
    }

    await parseSseStream(response, (eventType, data) => {
      if (eventType === 'candidate') onCandidate?.(data);
      else if (eventType === 'done') onDone?.(data);
      else if (eventType === 'error') onError?.(new Error(data.error || 'Stream error'));
    });
  } catch (err) {
    onError?.(err);
  }
};

export default api;
