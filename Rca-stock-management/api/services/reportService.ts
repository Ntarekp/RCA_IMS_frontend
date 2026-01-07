/**
 * Report Service
 * API service for generating inventory reports
 */

import { get } from '../client';
import { API_CONFIG } from '../config';
import { StockBalanceDTO } from '../types';

// Report types
export type ReportType = 'balance' | 'low-stock' | 'stock-in' | 'stock-out' | 'damaged' | 'transactions' | 'suppliers';

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
    let url = `${API_CONFIG.BASE_URL}/api/reports/export/pdf`;
    
    // Handle different report types
    if (reportType === 'suppliers') {
        url = `${API_CONFIG.BASE_URL}/api/reports/export/suppliers/pdf`;
    } else {
        // Add query params for transaction reports
        const params = new URLSearchParams();
        if (itemId) params.append('itemId', itemId.toString());
        if (dateRange) {
            params.append('startDate', dateRange.startDate);
            params.append('endDate', dateRange.endDate);
        }
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
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
    downloadFile(blob, `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
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
    let url = `${API_CONFIG.BASE_URL}/api/reports/export/excel`;

    // Handle different report types
    if (reportType === 'suppliers') {
        url = `${API_CONFIG.BASE_URL}/api/reports/export/suppliers/excel`;
    } else {
        // Add query params for transaction reports
        const params = new URLSearchParams();
        if (itemId) params.append('itemId', itemId.toString());
        if (dateRange) {
            params.append('startDate', dateRange.startDate);
            params.append('endDate', dateRange.endDate);
        }
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to generate Excel report');

    const blob = await response.blob();
    downloadFile(blob, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error downloading Excel report:', error);
    throw error;
  }
};
