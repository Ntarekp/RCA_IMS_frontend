import React, { useState, useEffect } from 'react';
import { StockTransactionDTO } from '../api/types';
import { StockItem } from '../types';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';

interface EditTransactionFormProps {
    transaction: StockTransactionDTO;
    stockItems: StockItem[];
    onUpdateTransaction: (id: number, data: any) => Promise<void>;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const EditTransactionForm = React.memo<EditTransactionFormProps>(({
    transaction,
    stockItems,
    onUpdateTransaction,
    onClose,
    addToast,
    removeToast
}) => {
    const [itemId, setItemId] = useState(transaction.itemId.toString());
    const [transactionType, setTransactionType] = useState<'IN' | 'OUT'>(transaction.transactionType);
    const [quantity, setQuantity] = useState(transaction.quantity.toString());
    const [referenceNumber, setReferenceNumber] = useState(transaction.referenceNumber || '');
    const [notes, setNotes] = useState(transaction.notes || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!transaction.id) {
                addToast("Invalid transaction ID", 'error');
                return;
            }
            const toastId = addToast("Updating transaction...", 'loading');
            await onUpdateTransaction(Number(transaction.id), {
                ...transaction,
                itemId: Number(itemId),
                transactionType,
                quantity: Number(quantity),
                notes,
                referenceNumber
            });
            removeToast(toastId);
            addToast("Transaction updated successfully.", 'success');
            onClose();
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : 'Failed to update transaction.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    You are editing transaction <strong>#{transaction.id}</strong>. 
                    Changing critical fields (Item, Quantity, Type) will affect stock levels.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Item</label>
                <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                >
                    {stockItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                    <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value as 'IN' | 'OUT')}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        required
                    >
                        <option value="IN">IN</option>
                        <option value="OUT">OUT</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reference Number</label>
                <input 
                    type="text" 
                    value={referenceNumber} 
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. PO-12345" 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" 
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
                <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Add any relevant details" 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 h-24"
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
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm shadow-blue-500/20 transition-all"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
});
