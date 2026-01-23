/**
 * Custom hook for managing reports
 */

import { useEffect, useState } from 'react';
import { getBalanceReport, getLowStockReport } from '../api/services/reportService';
import { StockBalanceDTO } from '../api/types';
import { DashboardItem, SystemReport } from '../types';
import { mapStockBalanceToDashboardItem } from '../utils/mappers';

export const useReports = () => {
  const [balanceReport, setBalanceReport] = useState<StockBalanceDTO[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockBalanceDTO[]>([]);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize report history from localStorage
  const [reportHistory, setReportHistory] = useState<SystemReport[]>(() => {
    const saved = localStorage.getItem('reportHistory');
    const parsed: SystemReport[] = saved ? JSON.parse(saved) : [];
    
    // Clean up stuck reports on load
    return parsed.map(report => {
        if (report.status === 'PROCESSING') {
            return { ...report, status: 'FAILED' };
        }
        return report;
    });
  });

  // Save report history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('reportHistory', JSON.stringify(reportHistory));
  }, [reportHistory]);

  const addReportToHistory = (report: SystemReport) => {
    setReportHistory(prev => [report, ...prev]);
  };

  const clearReportHistory = () => {
    setReportHistory([]);
    localStorage.removeItem('reportHistory');
  };

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
    reportHistory,
    addReportToHistory,
    clearReportHistory,
    loading,
    error,
    refetch: fetchReports,
  };
};
