/**
 * Custom hook for managing transactions
 */

import { useEffect, useState } from 'react';
import { getAllTransactions, recordTransaction } from '../api/services/transactionService';
import { StockTransactionDTO, CreateTransactionRequest } from '../api/types';
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
      const data = await getAllTransactions(itemId);
      setTransactions(data);
      
      // Convert to dashboard items format
      // Note: This is a simplified conversion. You might want to use the balance report instead
      const dashboardData = data.map((tx, idx) => ({
        id: tx.id?.toString() || idx.toString(),
        name: tx.itemName || 'Unknown',
        unit: 'unit', // Would need to get from item
        quantityIn: tx.transactionType === 'IN' ? tx.quantity : 0,
        quantityRemaining: 0, // Would need to calculate
        quantityDamaged: 0,
        quantityThreshold: 0,
        status: 'Birahagije' as const,
        date: tx.transactionDate,
      }));
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

