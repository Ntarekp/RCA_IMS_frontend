/**
 * Report Service
 * API service for generating inventory reports
 */

import { get } from '../client';
import { API_CONFIG } from '../config';
import { StockBalanceDTO } from '../types';

// Report types
export type ReportType = 'balance' | 'low-stock' | 'stock-in' | 'stock-out' | 'damaged' | 'transactions';

/**
 * Get complete stock balance report
 */
export const getBalanceReport = async (): Promise<StockBalanceDTO[]> => {
  return get<StockBalanceDTO[]>(API_CONFIG.ENDPOINTS.REPORTS.BALANCE);
};

/**
 * Get low stock report
 */
export const getLowStockReport = async (): Promise<StockBalanceDTO[]> => {
  return get<StockBalanceDTO[]>(API_CONFIG.ENDPOINTS.REPORTS.LOW_STOCK);
};

/**
 * Trigger a file download from a blob response
 */
const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate and download PDF report from backend
 */
export const generatePdfReport = async (
  reportType: ReportType,
  itemId?: number,
  dateRange?: { startDate: string; endDate: string }
): Promise<void> => {
  try {
    // Construct URL with query params
    let url = `${API_CONFIG.BASE_URL}/api/reports/export/pdf`;
    const params = new URLSearchParams();
    
    if (reportType === 'transactions' || reportType === 'stock-in' || reportType === 'stock-out') {
        // For transaction-based reports, we might want to pass date range if backend supports it
        // Currently backend exports ALL transactions for 'transactions' type
        // But let's prepare the params structure for future filtering
        if (dateRange) {
            // Note: Backend currently doesn't filter by date for the main export endpoint
            // but we can add it if needed. For now, it exports full history as requested.
        }
    }
    
    // Fetch as blob
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to generate PDF');

    const blob = await response.blob();
    downloadFile(blob, `transaction_report_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error downloading PDF report:', error);
    throw error;
  }
};

/**
 * Generate and download Excel report from backend
 */
export const generateCsvReport = async (
  reportType: ReportType,
  itemId?: number,
  dateRange?: { startDate: string; endDate: string }
): Promise<void> => {
  try {
    // Note: We are now using the Excel endpoint for "CSV" requests to provide a better format
    const url = `${API_CONFIG.BASE_URL}/api/reports/export/excel`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to generate Excel report');

    const blob = await response.blob();
    downloadFile(blob, `transaction_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error downloading Excel report:', error);
    throw error;
  }
};
