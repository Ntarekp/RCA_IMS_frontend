/**
 * Report Service
 * API service for generating inventory reports
 */

import { get } from '../client';
import { API_CONFIG } from '../config';
import { StockBalanceDTO, StockTransactionDTO } from '../types';

// Report types
export type ReportType = 'balance' | 'low-stock' | 'stock-in' | 'stock-out' | 'damaged' | 'transactions';

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
  reportType: ReportType,
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
  reportType: ReportType,
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

    // Fetch data based on report type
    let reportData: any[] = [];
    
    if (reportType === 'transactions') {
        // For transaction reports, we need transaction data, not balance data
        let url = API_CONFIG.ENDPOINTS.TRANSACTIONS;
        if (dateRange) {
            url += `/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
        } else if (itemId) {
            url += `?itemId=${itemId}`;
        }
        reportData = await get<StockTransactionDTO[]>(url);
    } else {
        // Default to balance report for other types
        reportData = await get<StockBalanceDTO[]>(API_CONFIG.ENDPOINTS.REPORTS.BALANCE);
    }

    // Create CSV content
    let content = '';
    
    if (reportType === 'transactions') {
        // Detailed Transaction Report Format
        content = 'Date,Reference,Item Name,Unit,Transaction Type,Quantity,Balance After,Source / Issued To,Purpose / Remarks,Recorded By\n';
        
        // Sort by date
        reportData.sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());

        // Calculate running balances per item
        const itemBalances: Record<string, number> = {};

        reportData.forEach((tx: StockTransactionDTO) => {
            // Initialize balance if not exists
            if (itemBalances[tx.itemName || 'unknown'] === undefined) {
                itemBalances[tx.itemName || 'unknown'] = 0;
            }

            // Update balance
            if (tx.transactionType === 'IN') {
                itemBalances[tx.itemName || 'unknown'] += tx.quantity;
            } else {
                itemBalances[tx.itemName || 'unknown'] -= tx.quantity;
            }

            const balanceAfter = itemBalances[tx.itemName || 'unknown'];
            
            // Format fields
            const date = tx.transactionDate;
            const reference = tx.referenceNumber || `TXN-${tx.id}`;
            const itemName = tx.itemName || 'Unknown';
            const unit = 'Unit'; // We might need to fetch unit from item details if not in transaction DTO
            const type = tx.transactionType;
            const quantity = tx.quantity;
            const sourceOrIssuedTo = type === 'IN' ? 'Supplier' : 'Consumer'; // Placeholder logic
            const remarks = tx.notes ? `"${tx.notes.replace(/"/g, '""')}"` : '';
            const recordedBy = tx.recordedBy || 'System';

            content += `${date},${reference},"${itemName}",${unit},${type},${quantity},${balanceAfter},"${sourceOrIssuedTo}",${remarks},"${recordedBy}"\n`;
        });

    } else {
        // Standard Balance Report Format
        content = 'Item Name,Current Balance,Unit,Minimum Stock,Status\n';
        reportData.forEach((item: StockBalanceDTO) => {
            if (!itemId || item.itemId === itemId) {
                content += `"${item.itemName}",${item.currentBalance},"${item.unit}",${item.minimumStock},"${item.status}"\n`;
            }
        });
    }

    // Create a blob and trigger download
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Create a more descriptive filename
    let filename = `${reportType.toUpperCase()}`;

    // Add item name if specific item is selected
    if (itemId && reportType !== 'transactions') {
      const item = reportData.find((i: any) => i.itemId === itemId);
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
