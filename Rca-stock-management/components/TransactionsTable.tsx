import React, { useState } from 'react';
import { StockTransactionDTO } from '../api/types';
import { Edit, RotateCcw, AlertTriangle } from 'lucide-react';

interface TransactionsTableProps {
  items: StockTransactionDTO[];
  showBalance?: boolean; // Kept for compatibility but ignored in this view
  onEdit?: (transaction: StockTransactionDTO) => void;
  onReverse?: (transaction: StockTransactionDTO) => void;
  userPermissions?: {
    canEdit: boolean;
    canReverse: boolean;
  };
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ 
  items, 
  onEdit, 
  onReverse,
  userPermissions = { canEdit: true, canReverse: true } 
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1">Reference</div>
                    <div className="col-span-2">Item Name</div>
                    <div className="col-span-1 text-center">Unit</div>
                    <div className="col-span-1 text-center">Type</div>
                    <div className="col-span-1 text-right">Quantity</div>
                    <div className="col-span-1 text-right">Balance</div>
                    <div className="col-span-1">Source / Issued To</div>
                    <div className="col-span-2">Purpose / Remarks</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {items.map((item) => {
                        // Placeholder logic for fields not yet in DTO
                        // In a real app, these would come from the backend or be calculated
                        const unit = 'Kg'; // Placeholder - ideally should come from item details
                        const balanceAfter = item.balanceAfter !== undefined ? item.balanceAfter : '-'; 
                        const sourceOrIssuedTo = item.supplierName || (item.transactionType === 'IN' ? 'Supplier' : 'Consumer');
                        const reference = item.referenceNumber || `TXN-${item.id}`;
                        const isReversed = item.reversed;

                        return (
                        <div key={item.id} className={`grid grid-cols-12 gap-4 px-6 py-4 text-sm text-gray-800 dark:text-slate-200 items-center hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors ${isReversed ? 'opacity-60 bg-slate-50/30' : ''}`}>
                            <div className="col-span-1 text-gray-500 dark:text-slate-400">{item.transactionDate}</div>
                            <div className="col-span-1 font-mono text-xs text-slate-500 dark:text-slate-400 truncate" title={reference}>{reference}</div>
                            <div className="col-span-2 font-medium truncate" title={item.itemName}>{item.itemName}</div>
                            <div className="col-span-1 text-center text-gray-500 dark:text-slate-400">{unit}</div>
                            <div className="col-span-1 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    isReversed 
                                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                                        : item.transactionType === 'IN' 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800' 
                                            : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-600'
                                }`}>
                                    {isReversed ? 'REVERSED' : item.transactionType}
                                </span>
                            </div>
                            <div className={`col-span-1 text-right font-medium ${isReversed ? 'line-through text-gray-400' : ''}`}>{item.quantity}</div>
                            <div className="col-span-1 text-right font-bold text-slate-700 dark:text-slate-300">{balanceAfter}</div>
                            <div className="col-span-1 text-gray-600 dark:text-slate-400 truncate" title={sourceOrIssuedTo}>{sourceOrIssuedTo}</div>
                            <div className="col-span-2 text-gray-500 dark:text-slate-500 truncate" title={item.notes}>{item.notes || '-'}</div>
                            <div className="col-span-1 flex justify-center gap-2">
                                {!isReversed && (
                                    <>
                                        {userPermissions.canEdit && (
                                            <button 
                                                onClick={() => onEdit && onEdit(item)}
                                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit Details"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                        {userPermissions.canReverse && (
                                            <button 
                                                onClick={() => onReverse && onReverse(item)}
                                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                title="Reverse Transaction"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        )}
                                    </>
                                )}
                                {isReversed && (
                                    <span className="text-xs text-gray-400 italic" title="This transaction has been reversed">Reversed</span>
                                )}
                            </div>
                        </div>
                    )})}
                    
                    {items.length === 0 && (
                        <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                            No transactions found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
