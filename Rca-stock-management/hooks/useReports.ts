/**
 * Custom hook for managing reports
 */

import { useEffect, useState, useCallback } from 'react';
import { getBalanceReport, getLowStockReport, getReportHistory } from '../api/services/reportService';
import { StockBalanceDTO } from '../api/types';
import { DashboardItem, SystemReport } from '../types';
import { mapStockBalanceToDashboardItem } from '../utils/mappers';

export const useReports = () => {
  const [balanceReport, setBalanceReport] = useState<StockBalanceDTO[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockBalanceDTO[]>([]);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize report history
  const [reportHistory, setReportHistory] = useState<SystemReport[]>([]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [balance, lowStock, history] = await Promise.all([
        getBalanceReport(),
        getLowStockReport(),
        getReportHistory(),
      ]);
      
      setBalanceReport(balance);
      setLowStockItems(lowStock);
      setReportHistory(history);
      
      // Convert to dashboard items format
      const dashboardData = balance.map(mapStockBalanceToDashboardItem);
      setDashboardItems(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reports'));
    } finally {
      setLoading(false);
    }
  }, []);

  const addReportToHistory = useCallback((report: SystemReport) => {
    // Optimistic update
    setReportHistory(prev => [report, ...prev]);
    // Then fetch actual history to ensure we have IDs and correct data
    fetchReports();
  }, [fetchReports]);

  const clearReportHistory = useCallback(() => {
    // In a real backend, we might want an endpoint to clear history
    setReportHistory([]);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchReports();
    }
  }, [fetchReports]);

  return {
    balanceReport,
    lowStockItems,
    dashboardItems,
    reportHistory,
    addReportToHistory,
    clearReportHistory,
    loading,
    error,
    refetch: fetchReports,
  };
};
