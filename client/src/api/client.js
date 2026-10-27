/**
 * API Client for 7 Sports
 * Configured with credentials: 'include' for secure HttpOnly cookie authentication
 */

// If running in development with Vite proxy, use relative '/api'
// In case direct backend URL is needed, default to '/api' or 'http://localhost:5000/api'
const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Send and receive HttpOnly cookies
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    let data;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { raw: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      const networkError = new Error('Cannot connect to 7 Sports backend server. Please verify the server is running on port 5000.');
      networkError.status = 503;
      throw networkError;
    }
    throw err;
  }
}
