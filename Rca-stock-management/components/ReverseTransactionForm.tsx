import React, { useState } from 'react';
import { StockTransactionDTO } from '../api/types';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';
import { AlertTriangle } from 'lucide-react';

interface ReverseTransactionFormProps {
    transaction: StockTransactionDTO;
    onReverseTransaction: (id: number, notes: string) => Promise<void>;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const ReverseTransactionForm = React.memo<ReverseTransactionFormProps>(({
    transaction,
    onReverseTransaction,
    onClose,
    addToast,
    removeToast
}) => {
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const toastId = addToast("Reversing transaction...", 'loading');
            await onReverseTransaction(Number(transaction.id), notes);
            removeToast(toastId);
            addToast("Transaction reversed successfully.", 'success');
            onClose();
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : 'Failed to reverse transaction.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Confirm Reversal</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                        This action will create a counter-transaction to reverse the original entry. 
                        The original transaction will remain unchanged for audit purposes.
                    </p>
                </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">#{transaction.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Item:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{transaction.itemName}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Type:</span>
                    <span className={`font-bold ${transaction.transactionType === 'IN' ? 'text-blue-600' : 'text-slate-600'}`}>
                        {transaction.transactionType}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Quantity:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{transaction.quantity}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason for Reversal</label>
                <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Why is this transaction being reversed? (Required)" 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 h-24"
                    required
                ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow-sm shadow-amber-500/20 transition-all"
                >
                    Reverse Transaction
                </button>
            </div>
        </form>
    );
});
