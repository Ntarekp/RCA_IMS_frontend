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
  dateRange?: { startDate: string; endDate: string },
  autoDownload: boolean = true
): Promise<Blob> => {
  try {
    // Use API_CONFIG.BASE_URL which now includes /api if configured
    // But we need to be careful not to double up /api if it's already in BASE_URL
    // The safest way is to use relative paths if our client handles base URL, 
    // but here we are using fetch directly so we need the full URL.
    
    // Let's construct the base path for reports
    // If BASE_URL is http://localhost:8081/api, we want http://localhost:8081/api/reports/export/...
    const reportsBaseUrl = `${API_CONFIG.BASE_URL}/reports/export`;
    
    let url = `${reportsBaseUrl}/pdf`;
    
    // Handle different report types
    if (reportType === 'suppliers') {
        url = `${reportsBaseUrl}/suppliers/pdf`;
    } else if (reportType === 'balance') {
        url = `${reportsBaseUrl}/balance/pdf`;
    } else if (reportType === 'low-stock') {
        url = `${reportsBaseUrl}/low-stock/pdf`;
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
    if (autoDownload) {
        downloadFile(blob, `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    return blob;
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
  dateRange?: { startDate: string; endDate: string },
  autoDownload: boolean = true
): Promise<Blob> => {
  try {
    const reportsBaseUrl = `${API_CONFIG.BASE_URL}/reports/export`;
    let url = `${reportsBaseUrl}/excel`;

    // Handle different report types
    if (reportType === 'suppliers') {
        url = `${reportsBaseUrl}/suppliers/excel`;
    } else if (reportType === 'balance') {
        url = `${reportsBaseUrl}/balance/excel`;
    } else if (reportType === 'low-stock') {
        url = `${reportsBaseUrl}/low-stock/excel`;
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
    if (autoDownload) {
        downloadFile(blob, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
    return blob;
  } catch (error) {
    console.error('Error downloading Excel report:', error);
    throw error;
  }
};
