import { supabase } from './supabase';

/**
 * Make an authenticated request to the backend API
 * @param {string} endpoint - API endpoint (without leading slash)
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch response
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      throw new Error('No active session');
    }

    const accessToken = session.access_token;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const apiGet = async (endpoint) => {
  return apiRequest(endpoint, { method: 'GET' });
};

export const apiPost = async (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const apiPut = async (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const apiDelete = async (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' });
};

export const publicApiGet = async (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  try {
    const response = await fetch(`${baseUrl}/api/${endpoint}`);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    return response.json();
  } catch (error) {
    // When the backend is not running, return null to let callers handle fallback
    console.warn(`[API] Backend unavailable for ${endpoint}, falling back to local data.`);
    return null;
  }
};
