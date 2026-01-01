/**
 * Report Service
 * API service for generating inventory reports
 */

import { get } from '../client';
import { API_CONFIG } from '../config';
import { StockBalanceDTO } from '../types';

// Report types
export type ReportType = 'balance' | 'low-stock' | 'stock-in' | 'stock-out' | 'damaged';

/**
 * Get complete stock balance report
 * Shows all items with their current stock levels
 * 
 * @returns Promise<StockBalanceDTO[]> - List of all items with stock balance information
 */
export const getBalanceReport = async (): Promise<StockBalanceDTO[]> => {
  return get<StockBalanceDTO[]>(API_CONFIG.ENDPOINTS.REPORTS.BALANCE);
};

/**
 * Get low stock report
 * Shows only items that need restocking (where currentBalance < minimumStock)
 * 
 * @returns Promise<StockBalanceDTO[]> - List of items that need restocking
 */
export const getLowStockReport = async (): Promise<StockBalanceDTO[]> => {
  return get<StockBalanceDTO[]>(API_CONFIG.ENDPOINTS.REPORTS.LOW_STOCK);
};

/**
 * Generate PDF report
 * This function generates and downloads a PDF report
 * 
 * @param reportType - Type of report to generate
 * @param itemId - Optional item ID to filter report for a specific item
 * @param dateRange - Optional date range for the report
 * @returns Promise<void> - Triggers file download
 */
export const generatePdfReport = async (
  reportType: 'balance' | 'low-stock',
  itemId?: number,
  dateRange?: { startDate: string; endDate: string }
): Promise<void> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (itemId) params.append('itemId', itemId.toString());
    if (dateRange) {
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
    }

    // In a real implementation, this would call a backend endpoint
    // For demo purposes, we'll create a simple PDF-like blob
    const reportData = await get<StockBalanceDTO[]>(API_CONFIG.ENDPOINTS.REPORTS.BALANCE);

    // Create a simple text representation of the data
    let content = `${reportType.toUpperCase()} REPORT\n`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;

    if (dateRange) {
      content += `Period: ${dateRange.startDate} to ${dateRange.endDate}\n\n`;
    }

    content += "ITEM NAME | CURRENT BALANCE | MINIMUM STOCK | STATUS\n";
    content += "----------------------------------------------------\n";

    reportData.forEach(item => {
      if (!itemId || item.itemId === itemId) {
        content += `${item.itemName} | ${item.currentBalance} ${item.unit} | ${item.minimumStock} ${item.unit} | ${item.status}\n`;
      }
    });

    // Create a blob and trigger download
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Create a more descriptive filename
    let filename = `${reportType.toUpperCase()}`;

    // Add item name if specific item is selected
    if (itemId) {
      const item = reportData.find(i => i.itemId === itemId);
      if (item) {
        filename += `_${item.itemName.replace(/\s+/g, '_')}`;
      }
    }

    // Add date range if provided
    if (dateRange) {
      filename += `_${dateRange.startDate}_to_${dateRange.endDate}`;
    } else {
      filename += `_${new Date().toISOString().split('T')[0]}`;
    }

    // Add timestamp for uniqueness
    filename += `_${new Date().getTime()}.pdf`;

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};

/**
 * Generate CSV report
 * This function generates and downloads a CSV report
 * 
 * @param reportType - Type of report to generate
 * @param itemId - Optional item ID to filter report for a specific item
 * @param dateRange - Optional date range for the report
 * @returns Promise<void> - Triggers file download
 */
export const generateCsvReport = async (
  reportType: 'balance' | 'low-stock',
  itemId?: number,
  dateRange?: { startDate: string; endDate: string }
): Promise<void> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (itemId) params.append('itemId', itemId.toString());
    if (dateRange) {
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
    }

    // In a real implementation, this would call a backend endpoint
    // For demo purposes, we'll create a simple CSV-like blob
    const reportData = await get<StockBalanceDTO[]>(API_CONFIG.ENDPOINTS.REPORTS.BALANCE);

    // Create CSV content
    let content = 'Item Name,Current Balance,Unit,Minimum Stock,Status\n';

    reportData.forEach(item => {
      if (!itemId || item.itemId === itemId) {
        content += `"${item.itemName}",${item.currentBalance},"${item.unit}",${item.minimumStock},"${item.status}"\n`;
      }
    });

    // Create a blob and trigger download
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Create a more descriptive filename
    let filename = `${reportType.toUpperCase()}`;

    // Add item name if specific item is selected
    if (itemId) {
      const item = reportData.find(i => i.itemId === itemId);
      if (item) {
        filename += `_${item.itemName.replace(/\s+/g, '_')}`;
      }
    }

    // Add date range if provided
    if (dateRange) {
      filename += `_${dateRange.startDate}_to_${dateRange.endDate}`;
    } else {
      filename += `_${new Date().toISOString().split('T')[0]}`;
    }

    // Add timestamp for uniqueness
    filename += `_${new Date().getTime()}.csv`;

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating CSV report:', error);
    throw error;
  }
};
