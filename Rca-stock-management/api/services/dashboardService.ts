/**
 * Dashboard Service
 * API service for dashboard data
 */

import { get } from '../client';
import { API_CONFIG } from '../config';
import { StockMetricsDTO } from '../types';
import { StockTransactionDTO } from '../types';

// Dashboard endpoints are often custom or aggregations
// Assuming they are under /api/dashboard or similar
const ENDPOINT = `${API_CONFIG.BASE_URL.endsWith('/') ? API_CONFIG.BASE_URL.slice(0, -1) : API_CONFIG.BASE_URL}/dashboard`;

/**
 * Get dashboard metrics
 */
export const getDashboardMetrics = async (): Promise<StockMetricsDTO> => {
  return get<StockMetricsDTO>(`${ENDPOINT}/metrics`);
};

/**
 * Get chart data for monthly transactions
 */
export const getChartData = async (year?: number): Promise<any[]> => {
  const url = year ? `${ENDPOINT}/chart-data?year=${year}` : `${ENDPOINT}/chart-data`;
  return get<any[]>(url);
};

/**
 * Get recent transactions for activity feed
 */
export const getRecentTransactions = async (limit: number = 10): Promise<StockTransactionDTO[]> => {
  return get<StockTransactionDTO[]>(`${ENDPOINT}/recent-transactions?limit=${limit}`);
};
