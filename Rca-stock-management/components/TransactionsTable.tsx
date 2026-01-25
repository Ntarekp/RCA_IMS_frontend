import React, { useState } from 'react';
import { StockTransactionDTO } from '../api/types';
import { Edit, RotateCcw, AlertTriangle, Undo2 } from 'lucide-react';

interface TransactionsTableProps {
  items: StockTransactionDTO[];
  showBalance?: boolean; // Kept for compatibility but ignored in this view
  onEdit?: (transaction: StockTransactionDTO) => void;
  onReverse?: (transaction: StockTransactionDTO) => void;
  onUndoReverse?: (transaction: StockTransactionDTO) => void;
  userPermissions?: {
    canEdit: boolean;
    canReverse: boolean;
  };
}

export const TransactionsTable: React.FC<TransactionsTableProps> = React.memo(({ 
  items, 
  onEdit, 
  onReverse,
  onUndoReverse,
  userPermissions = { canEdit: true, canReverse: true } 
}) => {
  const isEditable = (dateStr: string) => {
      const txnDate = new Date(dateStr);
      const now = new Date();
      const msPerDay = 1000 * 60 * 60 * 24;
      const diffDays = (now.getTime() - txnDate.getTime()) / msPerDay;
      return diffDays <= 5;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
            {items.map((item) => {
                const unit = 'Kg'; 
                const balanceAfter = item.balanceAfter !== undefined ? item.balanceAfter : '-'; 
                const sourceOrIssuedTo = item.supplierName || (item.transactionType === 'IN' ? 'Supplier' : 'Consumer');
                const reference = item.referenceNumber || `TXN-${item.id}`;
                const isReversed = item.reversed;

                return (
                    <div key={item.id} className={`bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 ${isReversed ? 'opacity-60 bg-slate-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                <span className="text-xs text-slate-500 dark:text-slate-400">{item.transactionDate}</span>
                                <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{item.itemName}</span>
                                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{reference}</span>
                                </div>
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
                        
                        <div className="grid grid-cols-2 gap-y-2 text-sm mt-3">
                            <div className="text-slate-500 dark:text-slate-400">Qty:</div>
                            <div className={`text-right font-medium ${isReversed ? 'line-through text-gray-400' : ''}`}>{item.quantity} {unit}</div>
                            
                            <div className="text-slate-500 dark:text-slate-400">Balance:</div>
                            <div className="text-right font-medium">{balanceAfter}</div>

                            <div className="text-slate-500 dark:text-slate-400">Source/Dest:</div>
                            <div className="text-right truncate max-w-[120px]" title={sourceOrIssuedTo}>{sourceOrIssuedTo}</div>
                        </div>

                        {item.notes && (
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400 italic">
                                {item.notes}
                            </div>
                        )}

                        {!isReversed && (userPermissions.canEdit || userPermissions.canReverse) && (
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-600 flex justify-end gap-3">
                                {userPermissions.canEdit && (
                                    <button 
                                        onClick={() => onEdit && onEdit(item)}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        <Edit className="w-3 h-3" /> Edit
                                    </button>
                                )}
                                {userPermissions.canReverse && (
                                    <button 
                                        onClick={() => onReverse && onReverse(item)}
                                        className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Reverse
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
             {items.length === 0 && (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No transactions found.
                </div>
            )}
        </div>

        <div className="hidden md:block overflow-x-auto">
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
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xs text-gray-400 italic" title="This transaction has been reversed">Reversed</span>
                                        {userPermissions.canReverse && onUndoReverse && (
                                            <button 
                                                onClick={() => onUndoReverse(item)}
                                                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                                title="Undo Reversal (Restore)"
                                            >
                                                <Undo2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
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
});

TransactionsTable.displayName = 'TransactionsTable';
