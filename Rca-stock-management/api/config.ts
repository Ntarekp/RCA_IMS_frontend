/**
 * API Configuration
 * Centralized configuration for backend API communication
 */

export const API_CONFIG = {
  // Backend base URL - uses environment variable or defaults to localhost
  // Note: The base URL should include the /api prefix if the backend expects it
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  
  // API endpoints (relative to BASE_URL)
  ENDPOINTS: {
    ITEMS: '/items',
    TRANSACTIONS: '/transactions',
    AUTH: '/auth',
    ADMIN: '/admin',
    REPORTS: {
      BALANCE: '/reports/balance',
      LOW_STOCK: '/reports/low-stock',
    },
    USERS: '/users',
    SUPPLIERS: '/suppliers',
    ANALYTICS: '/analytics',
  },
  
  // Request timeout (milliseconds)
  TIMEOUT: 30000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * Get full API URL for an endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if base url ends with slash
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
    
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${path}`;
};
