/**
 * Custom hook for managing transactions
 */

import { useEffect, useState, useCallback } from 'react';
import { getAllTransactions, recordTransaction, updateTransaction, reverseTransaction, undoReverseTransaction } from '../api/services/transactionService';
import { getBalanceReport } from '../api/services/reportService';
import { StockTransactionDTO, CreateTransactionRequest, StockBalanceDTO } from '../api/types';
import { DashboardItem } from '../types';
import { mapStockBalanceToDashboardItem } from '../utils/mappers';

export const useTransactions = (itemId?: number) => {
  const [transactions, setTransactions] = useState<StockTransactionDTO[]>([]);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [transactionsData, balanceData] = await Promise.all([
        getAllTransactions(itemId),
        getBalanceReport(), // Use balance report for dashboard items
      ]);
      setTransactions(transactionsData);
      
      // Convert balance report to dashboard items format
      const dashboardData = balanceData.map(mapStockBalanceToDashboardItem);
      setDashboardItems(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const addTransaction = useCallback(async (transactionData: CreateTransactionRequest) => {
    try {
      const newTransaction = await recordTransaction(transactionData);
      await fetchTransactions(); // Refresh list
      return newTransaction;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create transaction');
    }
  }, [fetchTransactions]);

  const updateTransactionData = useCallback(async (id: number, transactionData: StockTransactionDTO) => {
    try {
      const updatedTransaction = await updateTransaction(id, transactionData);
      await fetchTransactions(); // Refresh list
      return updatedTransaction;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update transaction');
    }
  }, [fetchTransactions]);

  const reverseTransactionData = useCallback(async (id: number, reason: string) => {
    try {
      const reversedTransaction = await reverseTransaction(id, reason);
      await fetchTransactions(); // Refresh list
      return reversedTransaction;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to reverse transaction');
    }
  }, [fetchTransactions]);

  const undoReverseTransactionData = useCallback(async (id: number) => {
    try {
      const restoredTransaction = await undoReverseTransaction(id);
      await fetchTransactions(); // Refresh list
      return restoredTransaction;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to undo reversal');
    }
  }, [fetchTransactions]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchTransactions();
    }
  }, [fetchTransactions]);

  return {
    transactions,
    dashboardItems,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    updateTransaction: updateTransactionData,
    reverseTransaction: reverseTransactionData,
    undoReverseTransaction: undoReverseTransactionData,
  };
};
