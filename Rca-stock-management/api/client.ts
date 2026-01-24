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

    // Check content type to determine how to parse response
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))) {
        // If it's a file (PDF or Excel), return the Blob directly
        data = await response.blob();
    } else {
        // Otherwise, try to parse as JSON
        const text = await response.text();
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
             // If parsing fails, use the raw text if it's an error to aid debugging
             if (!response.ok) {
                 console.warn('Non-JSON error response:', text.substring(0, 500));
             }
             data = null;
        }
    }

    // Check if response is successful
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Unauthorized access.');
        
        // Prevent infinite loops:
        // 1. If we didn't have a token to begin with, don't reload - we are already "logged out"
        // 2. Check if we are already at the login page (or preventing loops via session storage)
        
        if (!token) {
           console.warn('Received 401 but no token was present. Ignoring reload.');
           throw new ApiError(401, 'Unauthorized', null, 'Unauthorized request (no token)');
        }

        // Clear session data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');

        // Dispatch auth-error event so App can handle it (e.g., show login screen)
        // We do NOT reload the page to avoid infinite loops if the error persists
        window.dispatchEvent(new Event('auth-error'));
        
        console.warn('Session expired. Redirecting to login...');
        
        throw new ApiError(401, 'Unauthorized', null, 'Session expired. Please login again.');
      }

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
export async function del<T>(endpoint: string, body?: any): Promise<T> {
  const options: RequestInit = { method: 'DELETE' };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  return apiRequest<T>(endpoint, options);
}
