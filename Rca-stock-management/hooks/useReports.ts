/**
 * Custom hook for managing reports
 */

import { useEffect, useState } from 'react';
import { getBalanceReport, getLowStockReport } from '../api/services/reportService';
import { StockBalanceDTO } from '../api/types';
import { DashboardItem } from '../types';
import { mapStockBalanceToDashboardItem } from '../utils/mappers';

export const useReports = () => {
  const [balanceReport, setBalanceReport] = useState<StockBalanceDTO[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockBalanceDTO[]>([]);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const [balance, lowStock] = await Promise.all([
        getBalanceReport(),
        getLowStockReport(),
      ]);
      
      setBalanceReport(balance);
      setLowStockItems(lowStock);
      
      // Convert to dashboard items format
      const dashboardData = balance.map(mapStockBalanceToDashboardItem);
      setDashboardItems(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reports'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    balanceReport,
    lowStockItems,
    dashboardItems,
    loading,
    error,
    refetch: fetchReports,
  };
};

