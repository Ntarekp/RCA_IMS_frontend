/**
 * Dashboard Service
 * API service for dashboard data
 */

import { get } from '../client';
import { API_CONFIG } from '../config';
import { StockMetricsDTO, NotificationDTO } from '../types';
import { StockTransactionDTO } from '../types';

// Dashboard endpoints are often custom or aggregations
// Assuming they are under /api/dashboard or similar
const ENDPOINT = '/dashboard';

/**
 * Get dashboard metrics
 */
export const getDashboardMetrics = async (): Promise<StockMetricsDTO> => {
  try {
    return await get<StockMetricsDTO>(`${ENDPOINT}/metrics`);
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Using mock data for dashboard metrics');
    return {
      total: 150,
      lowStock: 12,
      damaged: 5,
      thisMonth: 45,
      totalChange: 5,
      lowStockChange: -2,
      damagedChange: 0,
      thisMonthChange: 15
    };
  }
};

/**
 * Get chart data for monthly transactions
 */
export const getChartData = async (year?: number): Promise<any[]> => {
  const url = year ? `${ENDPOINT}/chart-data?year=${year}` : `${ENDPOINT}/chart-data`;
  try {
    return await get<any[]>(url);
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Using mock data for chart data');
    return [
      { name: 'Jan', in: 65, out: 45, damaged: 2 },
      { name: 'Feb', in: 45, out: 55, damaged: 1 },
      { name: 'Mar', in: 80, out: 60, damaged: 4 },
      { name: 'Apr', in: 55, out: 40, damaged: 0 },
      { name: 'May', in: 90, out: 75, damaged: 3 },
      { name: 'Jun', in: 70, out: 65, damaged: 1 },
      { name: 'Jul', in: 60, out: 50, damaged: 2 },
      { name: 'Aug', in: 85, out: 70, damaged: 1 },
      { name: 'Sep', in: 50, out: 45, damaged: 0 },
      { name: 'Oct', in: 75, out: 60, damaged: 2 },
      { name: 'Nov', in: 65, out: 55, damaged: 1 },
      { name: 'Dec', in: 40, out: 30, damaged: 0 },
    ];
  }
};

/**
 * Get recent transactions for activity feed
 */
export const getRecentTransactions = async (limit: number = 10): Promise<StockTransactionDTO[]> => {
  return get<StockTransactionDTO[]>(`${ENDPOINT}/recent-transactions?limit=${limit}`);
};

/**
 * Get notifications
 */
export const getNotifications = async (): Promise<NotificationDTO[]> => {
    // Return empty array for now as backend doesn't have a notifications endpoint yet
    // This removes the static mock data
    return [];
};
