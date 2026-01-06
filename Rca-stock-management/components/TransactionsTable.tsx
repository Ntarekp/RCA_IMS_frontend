import React from 'react';
import { StockTransactionDTO } from '../api/types';

interface TransactionsTableProps {
  items: StockTransactionDTO[];
  showBalance?: boolean; // Kept for compatibility but ignored in this view
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
                {/* Table Header */}
                <div className="grid grid-cols-10 gap-4 px-6 py-4 text-sm font-medium text-gray-500 bg-slate-50 border-b border-slate-100">
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1">Reference</div>
                    <div className="col-span-1">Item Name</div>
                    <div className="col-span-1 text-center">Unit</div>
                    <div className="col-span-1 text-center">Type</div>
                    <div className="col-span-1 text-right">Quantity</div>
                    <div className="col-span-1 text-right">Balance After</div>
                    <div className="col-span-1">Source / Issued To</div>
                    <div className="col-span-1">Purpose / Remarks</div>
                    <div className="col-span-1 text-right">Recorded By</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                    {items.map((item) => {
                        // Placeholder logic for fields not yet in DTO
                        // In a real app, these would come from the backend or be calculated
                        const unit = 'Kg'; // Placeholder - ideally should come from item details
                        const balanceAfter = item.balanceAfter !== undefined ? item.balanceAfter : '-'; 
                        const sourceOrIssuedTo = item.transactionType === 'IN' ? 'Supplier' : 'Consumer'; // Placeholder
                        const reference = item.referenceNumber || `TXN-${item.id}`;

                        return (
                        <div key={item.id} className="grid grid-cols-10 gap-4 px-6 py-4 text-sm text-gray-800 items-center hover:bg-slate-50/50 transition-colors">
                            <div className="col-span-1 text-gray-500">{item.transactionDate}</div>
                            <div className="col-span-1 font-mono text-xs text-slate-500">{reference}</div>
                            <div className="col-span-1 font-medium">{item.itemName}</div>
                            <div className="col-span-1 text-center text-gray-500">{unit}</div>
                            <div className="col-span-1 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    item.transactionType === 'IN' 
                                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                        : 'bg-slate-50 text-slate-700 border-slate-100'
                                }`}>
                                    {item.transactionType}
                                </span>
                            </div>
                            <div className="col-span-1 text-right font-medium">{item.quantity}</div>
                            <div className="col-span-1 text-right font-bold text-slate-700">{balanceAfter}</div>
                            <div className="col-span-1 text-gray-600 truncate" title={sourceOrIssuedTo}>{sourceOrIssuedTo}</div>
                            <div className="col-span-1 text-gray-500 truncate" title={item.notes}>{item.notes || '-'}</div>
                            <div className="col-span-1 text-right text-xs text-gray-400">{item.recordedBy}</div>
                        </div>
                    )})}
                    
                    {items.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            No transactions found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
