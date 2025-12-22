/**
 * Report Service
 * API service for generating reports
 */

import { get } from '../client';
import { API_CONFIG } from '../config';
import { StockBalanceDTO } from '../types';

const ENDPOINT = API_CONFIG.ENDPOINTS.REPORTS;

/**
 * Get complete stock balance report
 */
export const getBalanceReport = async (): Promise<StockBalanceDTO[]> => {
  return get<StockBalanceDTO[]>(ENDPOINT.BALANCE);
};

/**
 * Get low stock items report
 */
export const getLowStockReport = async (): Promise<StockBalanceDTO[]> => {
  return get<StockBalanceDTO[]>(ENDPOINT.LOW_STOCK);
};

