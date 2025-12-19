/**
 * Custom hook for managing transactions
 */

import { useEffect, useState } from 'react';
import { getAllTransactions, recordTransaction } from '../api/services/transactionService';
import { getBalanceReport } from '../api/services/reportService';
import { StockTransactionDTO, CreateTransactionRequest, StockBalanceDTO } from '../api/types';
import { DashboardItem } from '../types';
import { mapStockBalanceToDashboardItem } from '../utils/mappers';

export const useTransactions = (itemId?: number) => {
  const [transactions, setTransactions] = useState<StockTransactionDTO[]>([]);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = async () => {
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
  };

  const addTransaction = async (transactionData: CreateTransactionRequest) => {
    try {
      const newTransaction = await recordTransaction(transactionData);
      await fetchTransactions(); // Refresh list
      return newTransaction;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create transaction');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [itemId]);

  return {
    transactions,
    dashboardItems,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
  };
};

