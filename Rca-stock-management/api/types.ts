/**
 * TypeScript types matching backend DTOs
 * These types correspond to the Java DTOs in the backend
 */

/**
 * TransactionType - matches backend enum
 */
export type TransactionType = 'IN' | 'OUT';

/**
 * ItemDTO - matches backend ItemDTO
 */
export interface ItemDTO {
  id?: number;
  name: string;
  unit: string;
  minimumStock: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  currentBalance?: number;
  isLowStock?: boolean;
  damagedQuantity?: number;
  totalIn?: number;
  totalOut?: number;
}

/**
 * StockTransactionDTO - matches backend StockTransactionDTO
 */
export interface StockTransactionDTO {
  id?: number;
  itemId: number;
  itemName?: string;
  transactionType: TransactionType;
  quantity: number;
  transactionDate: string; // ISO date string: "2024-12-01"
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
  createdAt?: string;
  balanceAfter?: number; // New field for running balance
  reversed?: boolean;
  originalTransactionId?: number;
  supplierId?: number;
  supplierName?: string;
}

/**
 * StockBalanceDTO - matches backend StockBalanceDTO
 */
export interface StockBalanceDTO {
  itemId: number;
  itemName: string;
  unit: string;
  totalIn: number;
  totalOut: number;
  currentBalance: number;
  minimumStock: number;
  isLowStock: boolean;
  status: 'CRITICAL' | 'LOW' | 'ADEQUATE';
}

/**
 * StockMetricsDTO - matches backend StockMetricsDTO
 */
export interface StockMetricsDTO {
  total: number;
  lowStock: number;
  damaged: number;
  thisMonth: number;
  
  // Comparison metrics (vs last month)
  totalChange?: number;
  lowStockChange?: number;
  damagedChange?: number;
  thisMonthChange?: number;
}

/**
 * Request DTOs for creating/updating items
 */
export interface CreateItemRequest {
  name: string;
  unit: string;
  minimumStock: number;
  description?: string;
}

export interface UpdateItemRequest {
  name?: string;
  unit?: string;
  minimumStock?: number;
  description?: string;
}

/**
 * Request DTO for recording damaged quantity
 */
export interface DamagedQuantityRequest {
  damagedQuantity: number;
}

/**
 * Request DTO for creating transactions
 */
export interface CreateTransactionRequest {
  itemId: number;
  transactionType: TransactionType;
  quantity: number;
  transactionDate: string;
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
  supplierId?: number;
}

/**
 * Notification DTO
 */
export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  timestamp: string;
  read: boolean;
}

/**
 * ScheduledReportConfig - matches backend ScheduledReportConfig
 */
export interface ScheduledReportConfig {
  id?: number;
  email: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  reportType: 'ALL_REPORTS_ZIP' | 'TRANSACTION_HISTORY' | 'STOCK_BALANCE' | 'LOW_STOCK';
  active: boolean;
  scheduledTime?: string;
  lastSent?: string;
}

export interface SystemReport {
  id: string;
  title: string;
  type: 'STOCK' | 'FINANCIAL' | 'AUDIT' | 'TRANSACTIONS' | 'BALANCE' | 'LOW-STOCK' | 'SUPPLIERS' | 'STOCK-IN' | 'STOCK-OUT';
  generatedDate: string;
  size: string;
  status: 'READY' | 'PROCESSING';
  format: 'PDF' | 'CSV';
  params?: {
      reportType: string;
      dateRange?: { startDate: string, endDate: string };
      itemId?: string;
  };
}
