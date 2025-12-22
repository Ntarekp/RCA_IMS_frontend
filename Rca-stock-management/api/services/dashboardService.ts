/**
 * Dashboard Service
 * API service for dashboard data
 */

import { get } from '../client';
import { StockMetricsDTO } from '../types';
import { StockTransactionDTO } from '../types';

const ENDPOINT = '/api/dashboard';

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

