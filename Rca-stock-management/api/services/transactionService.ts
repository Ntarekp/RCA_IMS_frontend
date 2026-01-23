/**
 * Transaction Service
 * API service for stock transaction operations
 */

import { get, post, put, del } from '../client';
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
  try {
    return await get<StockTransactionDTO[]>(url);
  } catch (error) {
    console.warn('Using mock data for transactions');
    return [
      { id: 1, itemId: 1, itemName: 'Laptop Dell XPS', transactionType: 'IN', quantity: 10, transactionDate: '2024-01-15', recordedBy: 'Admin', balanceAfter: 50 },
      { id: 2, itemId: 1, itemName: 'Laptop Dell XPS', transactionType: 'OUT', quantity: 2, transactionDate: '2024-01-16', recordedBy: 'User', balanceAfter: 48, notes: 'Assigned to HR' },
      { id: 3, itemId: 2, itemName: 'Office Chair', transactionType: 'IN', quantity: 20, transactionDate: '2024-01-18', recordedBy: 'Admin', balanceAfter: 20 },
    ];
  }
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

/**
 * Update transaction metadata
 */
export const updateTransaction = async (
  id: number,
  transaction: StockTransactionDTO
): Promise<StockTransactionDTO> => {
  return put<StockTransactionDTO>(`${ENDPOINT}/${id}`, transaction);
};

/**
 * Reverse a transaction
 */
export const reverseTransaction = async (
  id: number,
  reason: string
): Promise<StockTransactionDTO> => {
  const url = `${ENDPOINT}/${id}?reason=${encodeURIComponent(reason)}`;
  return del<StockTransactionDTO>(url);
};

/**
 * Undo a reversed transaction
 */
export const undoReverseTransaction = async (
  id: number
): Promise<StockTransactionDTO> => {
  return post<StockTransactionDTO>(`${ENDPOINT}/${id}/undo-reverse`, {});
};
