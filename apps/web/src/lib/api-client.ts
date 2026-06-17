import axios from 'axios';

/**
 * Single configured axios instance. Response data is unwrapped from the
 * API's `{ data, timestamp }` envelope so callers work with payloads directly.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => Promise.reject(error),
);
