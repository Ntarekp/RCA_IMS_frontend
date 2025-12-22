/**
 * Transaction Service
 * API service for stock transaction operations
 */

import { get, post } from '../client';
import { API_CONFIG } from '../config';
import {
  StockTransactionDTO,
  CreateTransactionRequest,
} from '../types';

const ENDPOINT = API_CONFIG.ENDPOINTS.TRANSACTIONS;

/**
 * Get all transactions
 * @param itemId Optional filter by item ID
 */
export const getAllTransactions = async (
  itemId?: number
): Promise<StockTransactionDTO[]> => {
  const url = itemId ? `${ENDPOINT}?itemId=${itemId}` : ENDPOINT;
  return get<StockTransactionDTO[]>(url);
};

/**
 * Get transactions by date range
 */
export const getTransactionsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<StockTransactionDTO[]> => {
  const url = `${ENDPOINT}/date-range?startDate=${startDate}&endDate=${endDate}`;
  return get<StockTransactionDTO[]>(url);
};

/**
 * Record a new transaction (IN or OUT)
 */
export const recordTransaction = async (
  transaction: CreateTransactionRequest
): Promise<StockTransactionDTO> => {
  return post<StockTransactionDTO>(ENDPOINT, transaction);
};

