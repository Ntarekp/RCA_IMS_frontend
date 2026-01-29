/**
 * Analytics Service
 * API service for analytics data
 */

import { get } from '../client';
import { API_CONFIG } from '../config';

const ENDPOINT = API_CONFIG.ENDPOINTS.ANALYTICS;

export interface MonthlyTrend {
  month: string;
  stockIn: number;
  consumed: number;
  loss: number;
}

export interface AnalyticsSummary {
  consumptionRate: number;
  wastageRatio: number;
  restockFrequency: number;
  stockOutReasons: Record<string, number>;
  monthlyTrends: MonthlyTrend[];
  topConsumedItems: Record<string, number>;
}

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  return get<AnalyticsSummary>(`${ENDPOINT}/summary`);
};
