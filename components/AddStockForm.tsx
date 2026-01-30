import React from 'react';
import { CreateItemRequest, CreateTransactionRequest } from '../api/types';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';
import { StockItem } from '../types';

interface AddStockFormProps {
    onAddItem: (data: CreateItemRequest) => Promise<StockItem>;
    onAddTransaction: (data: CreateTransactionRequest) => Promise<void>;
    onSuccess: () => Promise<void>;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const AddStockForm = React.memo<AddStockFormProps>(({
    onAddItem,
    onAddTransaction,
    onSuccess,
    onClose,
    addToast,
    removeToast
}) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const itemData: CreateItemRequest = {
            name: formData.get('name') as string,
            unit: formData.get('unit') as string,
            minimumStock: parseInt(formData.get('minimumStock') as string),
            description: formData.get('description') as string || undefined,
        };

        const initialQuantity = parseInt(formData.get('initialQuantity') as string) || 0;

        try {
            const toastId = addToast("Creating item...", 'loading');
            const newItem = await onAddItem(itemData);
            removeToast(toastId);
            
            // If initial quantity is provided, create an IN transaction
            if (initialQuantity > 0 && newItem.id) {
                const transactionData: CreateTransactionRequest = {
                    itemId: Number(newItem.id),
                    transactionType: 'IN',
                    quantity: initialQuantity,
                    transactionDate: new Date().toISOString().split('T')[0],
                    notes: 'Initial stock',
                    recordedBy: 'System',
                };
                await onAddTransaction(transactionData);
            }
            
            addToast("Stock item added successfully.", 'success');
            onClose();
            await onSuccess();
        } catch (error) {
            const errorMessage = error instanceof ApiError 
                ? error.message 
                : 'Failed to create item. Please try again.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <form id="add-stock-form" className="space-y-5" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Item Name</label>
                <input name="name" type="text" placeholder="e.g. Rice (Gikongoro)" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <input name="description" type="text" placeholder="Category or description" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Unit</label>
                    <select name="unit" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
                        <option value="">Select unit...</option>
                        <option>Kg</option>
                        <option>Liters</option>
                        <option>Pieces</option>
                        <option>Bags</option>
                        <option>Sacks</option>
                        <option>Boxes</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Initial Quantity (Optional)</label>
                    <input name="initialQuantity" type="number" min="0" placeholder="0" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Min Threshold</label>
                    <input name="minimumStock" type="number" min="1" placeholder="10" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
                </div>
            </div>
        </form>
    );
});
