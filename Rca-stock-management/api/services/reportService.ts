/**
 * Report Service
 * API service for generating inventory reports
 */

import { get } from '../client';
import { API_CONFIG } from '../config';
import { StockBalanceDTO } from '../types';

// Report types with more granular options
export type ReportType =
    | 'balance'
    | 'low-stock'
    | 'transactions'
    | 'stock-in'
    | 'stock-out'
    | 'supplier-summary'
    | 'monthly-summary'
    | 'item-history';

export interface ReportFilters {
  itemId?: number;
  startDate?: string;
  endDate?: string;
  supplierId?: number;
  transactionType?: 'IN' | 'OUT';
  minQuantity?: number;
  maxQuantity?: number;
}

export interface ReportMetadata {
  type: ReportType;
  format: 'PDF' | 'EXCEL';
  generatedAt: string;
  filters?: ReportFilters;
  recordCount?: number;
}

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
 * Build query string from filters
 */
const buildQueryString = (filters?: ReportFilters): string => {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.itemId) params.append('itemId', filters.itemId.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.supplierId) params.append('supplierId', filters.supplierId.toString());
  if (filters.transactionType) params.append('transactionType', filters.transactionType);
  if (filters.minQuantity) params.append('minQuantity', filters.minQuantity.toString());
  if (filters.maxQuantity) params.append('maxQuantity', filters.maxQuantity.toString());

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Generate filename based on report type and date
 */
const generateFilename = (reportType: ReportType, format: 'PDF' | 'EXCEL'): string => {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const extension = format === 'PDF' ? 'pdf' : 'xlsx';

  const typeMap: Record<ReportType, string> = {
    'balance': 'Stock_Balance',
    'low-stock': 'Low_Stock_Alert',
    'transactions': 'Transaction_History',
    'stock-in': 'Stock_In_Report',
    'stock-out': 'Stock_Out_Report',
    'supplier-summary': 'Supplier_Summary',
    'monthly-summary': 'Monthly_Summary',
    'item-history': 'Item_History'
  };

  return `${typeMap[reportType]}_${date}_${time}.${extension}`;
};

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Generate and download PDF report from backend
 */
export const generatePdfReport = async (
    reportType: ReportType,
    filters?: ReportFilters
): Promise<void> => {
  try {
    const token = getAuthToken();

    // Map report types to backend endpoints
    let endpoint = '';

    switch (reportType) {
      case 'transactions':
        endpoint = '/api/reports/export/pdf';
        break;
      case 'balance':
        endpoint = '/api/reports/export/balance/pdf';
        break;
      case 'low-stock':
        endpoint = '/api/reports/export/low-stock/pdf';
        break;
      case 'stock-in':
        endpoint = '/api/reports/export/stock-in/pdf';
        break;
      case 'stock-out':
        endpoint = '/api/reports/export/stock-out/pdf';
        break;
      case 'supplier-summary':
        endpoint = '/api/reports/export/supplier-summary/pdf';
        break;
      case 'monthly-summary':
        endpoint = '/api/reports/export/monthly-summary/pdf';
        break;
      case 'item-history':
        endpoint = '/api/reports/export/item-history/pdf';
        break;
      default:
        endpoint = '/api/reports/export/pdf';
    }

    const queryString = buildQueryString(filters);
    const url = `${API_CONFIG.BASE_URL}${endpoint}${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate PDF: ${errorText}`);
    }

    const blob = await response.blob();
    const filename = generateFilename(reportType, 'PDF');
    downloadFile(blob, filename);
  } catch (error) {
    console.error('Error downloading PDF report:', error);
    throw error;
  }
};

/**
 * Generate and download Excel report from backend
 */
export const generateExcelReport = async (
    reportType: ReportType,
    filters?: ReportFilters
): Promise<void> => {
  try {
    const token = getAuthToken();

    // Map report types to backend endpoints
    let endpoint = '';

    switch (reportType) {
      case 'transactions':
        endpoint = '/api/reports/export/excel';
        break;
      case 'balance':
        endpoint = '/api/reports/export/balance/excel';
        break;
      case 'low-stock':
        endpoint = '/api/reports/export/low-stock/excel';
        break;
      case 'stock-in':
        endpoint = '/api/reports/export/stock-in/excel';
        break;
      case 'stock-out':
        endpoint = '/api/reports/export/stock-out/excel';
        break;
      case 'supplier-summary':
        endpoint = '/api/reports/export/supplier-summary/excel';
        break;
      case 'monthly-summary':
        endpoint = '/api/reports/export/monthly-summary/excel';
        break;
      case 'item-history':
        endpoint = '/api/reports/export/item-history/excel';
        break;
      default:
        endpoint = '/api/reports/export/excel';
    }

    const queryString = buildQueryString(filters);
    const url = `${API_CONFIG.BASE_URL}${endpoint}${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate Excel report: ${errorText}`);
    }

    const blob = await response.blob();
    const filename = generateFilename(reportType, 'EXCEL');
    downloadFile(blob, filename);
  } catch (error) {
    console.error('Error downloading Excel report:', error);
    throw error;
  }
};

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generateExcelReport instead
 */
export const generateCsvReport = generateExcelReport;

/**
 * Preview report data before generating (for UI display)
 */
export const previewReportData = async (
    reportType: ReportType,
    filters?: ReportFilters
): Promise<any> => {
  try {
    const token = getAuthToken();
    const queryString = buildQueryString(filters);

    let endpoint = '';
    switch (reportType) {
      case 'balance':
        endpoint = '/api/reports/balance';
        break;
      case 'low-stock':
        endpoint = '/api/reports/low-stock';
        break;
      case 'transactions':
        endpoint = '/api/transactions';
        break;
      default:
        endpoint = '/api/reports/balance';
    }

    const url = `${API_CONFIG.BASE_URL}${endpoint}${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) throw new Error('Failed to fetch preview data');

    return await response.json();
  } catch (error) {
    console.error('Error fetching preview data:', error);
    throw error;
  }
};