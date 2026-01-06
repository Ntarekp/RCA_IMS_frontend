/**
 * API Client
 * Centralized HTTP client for making API requests
 */

import { API_CONFIG, getApiUrl } from './config';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Generic API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  // Get auth token if available
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token && !endpoint.includes('/auth/login')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };

  console.log(`Sending API request: ${config.method} ${url}`, { headers: config.headers });

  try {
    const response = await fetch(url, config);
    console.log(`Received API response: ${response.status} ${response.statusText}`);
    
    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    // Parse JSON response
    const data = await response.json().catch(() => null);

    // Check if response is successful
    if (!response.ok) {
      throw new ApiError(
        response.status,
        response.statusText,
        data,
        data?.message || `Request failed: ${response.statusText}`
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      0,
      'Network Error',
      undefined,
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * GET request
 */
export async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function post<T>(endpoint: string, body: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 */
export async function put<T>(endpoint: string, body: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * PATCH request
 */
export async function patch<T>(endpoint: string, body: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

