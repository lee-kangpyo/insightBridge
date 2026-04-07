import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const query = async (question) => {
  const response = await api.post('/api/query', { question });
  return response.data;
};
