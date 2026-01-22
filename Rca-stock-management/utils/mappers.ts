/**
 * Data Mappers
 * Convert between backend DTOs and frontend types
 */

import { ItemDTO, StockTransactionDTO, StockBalanceDTO } from '../api/types';
import { StockItem, DashboardItem } from '../types';

/**
 * Map backend ItemDTO to frontend StockItem
 */
export const mapItemDTOToStockItem = (dto: ItemDTO): StockItem => {
  // Map status based on currentBalance and minimumStock
  let status: 'Birahagije' | 'Mucye' | 'Byashize';
  
  if (!dto.currentBalance || dto.currentBalance <= 0) {
    status = 'Byashize'; // Out of stock
  } else if (dto.isLowStock || (dto.currentBalance < dto.minimumStock)) {
    status = 'Mucye'; // Low stock
  } else {
    status = 'Birahagije'; // Adequate stock
  }

  return {
    id: dto.id?.toString() || '',
    name: dto.name,
    category: dto.description || 'Uncategorized',
    status,
    currentQuantity: dto.currentBalance || 0,
    minimumQuantity: dto.minimumStock,
    unit: dto.unit,
    lastUpdated: dto.updatedAt 
      ? formatRelativeTime(dto.updatedAt) 
      : 'Unknown',
    description: dto.description,
    supplierId: undefined, // Not available in backend yet
    totalIn: dto.totalIn || 0,
    totalOut: dto.totalOut || 0,
    quantityDamaged: dto.damagedQuantity || 0,
  };
};

/**
 * Map backend StockBalanceDTO to frontend DashboardItem
 */
export const mapStockBalanceToDashboardItem = (dto: StockBalanceDTO): DashboardItem => {
  // Map status
  let status: 'Birahagije' | 'Hafi gushira' | 'Byashize';
  
  if (dto.status === 'CRITICAL' || dto.currentBalance <= 0) {
    status = 'Byashize';
  } else if (dto.status === 'LOW') {
    status = 'Hafi gushira';
  } else {
    status = 'Birahagije';
  }

  return {
    id: dto.itemId.toString(),
    name: dto.itemName,
    unit: dto.unit,
    quantityIn: dto.totalIn,
    quantityRemaining: dto.currentBalance,
    quantityDamaged: 0, // This will be updated when we have damaged items API
    quantityThreshold: dto.minimumStock,
    status,
    date: 'Recent', // Could be enhanced with actual date
  };
};

/**
 * Map backend StockTransactionDTO to frontend format
 */
export const mapTransactionDTO = (dto: StockTransactionDTO) => {
  return {
    id: dto.id?.toString() || '',
    itemId: dto.itemId.toString(),
    itemName: dto.itemName || 'Unknown',
    type: dto.transactionType,
    quantity: dto.quantity,
    date: dto.transactionDate,
    referenceNumber: dto.referenceNumber,
    notes: dto.notes,
    recordedBy: dto.recordedBy,
    createdAt: dto.createdAt,
    balanceAfter: dto.balanceAfter,
    reversed: dto.reversed,
    originalTransactionId: dto.originalTransactionId,
    supplierId: dto.supplierId,
    supplierName: dto.supplierName
  };
};

/**
 * Format ISO date string to relative time
 */
function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  } catch {
    return 'Unknown';
  }
}
