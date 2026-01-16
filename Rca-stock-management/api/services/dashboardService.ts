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

/**
 * Get notifications
 */
export const getNotifications = async (): Promise<NotificationDTO[]> => {
    // For now, we'll return mock data since the backend doesn't have a notifications endpoint yet
    // In a real implementation, this would call an API endpoint
    return [
        { id: '1', title: 'Low Stock Alert: Rice', message: 'Rice inventory has dropped below the minimum threshold of 250kg. Current stock: 200kg.', type: 'ALERT', timestamp: '10 mins ago', read: false },
        { id: '2', title: 'Stock In Successful', message: 'Successfully recorded 500kg of Beans from Kigali Grains Ltd.', type: 'SUCCESS', timestamp: '2 hours ago', read: false },
        { id: '3', title: 'System Maintenance', message: 'Scheduled maintenance will occur on Saturday at 2:00 AM. Expected downtime: 30 mins.', type: 'INFO', timestamp: '1 day ago', read: true },
        { id: '4', title: 'Pending Supplier Approval', message: 'New supplier "Rwanda Foods" is awaiting your approval.', type: 'WARNING', timestamp: '2 days ago', read: true },
    ];
};
