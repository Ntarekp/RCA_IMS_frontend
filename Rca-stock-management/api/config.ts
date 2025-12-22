/**
 * API Configuration
 * Centralized configuration for backend API communication
 */

export const API_CONFIG = {
  // Backend base URL - update this to match your backend server
  BASE_URL: 'http://localhost:8081',
  
  // API endpoints
  ENDPOINTS: {
    ITEMS: '/api/items',
    TRANSACTIONS: '/api/transactions',
    REPORTS: {
      BALANCE: '/api/reports/balance',
      LOW_STOCK: '/api/reports/low-stock',
    },
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
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

