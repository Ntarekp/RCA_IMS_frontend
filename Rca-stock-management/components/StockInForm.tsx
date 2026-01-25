import React, { useState, useEffect } from 'react';
import { StockItem, Supplier } from '../types';
import { CreateTransactionRequest } from '../api/types';
import { ApiError } from '../api/client';
import { Loader2 } from 'lucide-react';

interface StockInFormProps {
    stockItems: StockItem[];
    suppliers: Supplier[];
    onStockIn: (data: CreateTransactionRequest) => Promise<void>;
    onClose: () => void;
    initialItem?: StockItem | null;
    userProfileName?: string;
    addToast: (message: string, type: 'success' | 'error' | 'loading' | 'info' | 'warning') => string;
    removeToast: (id: string) => void;
}

export const StockInForm = React.memo<StockInFormProps>(({ 
    stockItems, 
    suppliers, 
    onStockIn, 
    onClose, 
    initialItem, 
    userProfileName,
    addToast,
    removeToast
}) => {
    const [selectedItemId, setSelectedItemId] = useState(initialItem?.id || '');
    const [quantity, setQuantity] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialItem) {
            setSelectedItemId(initialItem.id);
        }
    }, [initialItem]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedItemId) {
            addToast('Please select an item.', 'error');
            return;
        }

        const item = stockItems.find(i => i.id === selectedItemId);
        if (!item) {
            addToast('Invalid item selected.', 'error');
            return;
        }

        const qty = parseInt(quantity);
        if (qty <= 0) {
            addToast('Please enter a valid quantity.', 'error');
            return;
        }

        const transactionData: CreateTransactionRequest = {
            itemId: Number(selectedItemId),
            transactionType: 'IN',
            quantity: qty,
            transactionDate,
            notes,
            recordedBy: userProfileName || 'User',
            supplierId: supplierId ? Number(supplierId) : undefined
        };

        setIsSubmitting(true);
        const toastId = addToast('Recording stock in...', 'loading');

        try {
            await onStockIn(transactionData);
            removeToast(toastId);
            addToast('Stock in recorded successfully.', 'success');
            onClose();
        } catch (error) {
            removeToast(toastId);
            const errorMessage = error instanceof ApiError ? error.message : 'Failed to record stock in.';
            addToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form id="transaction-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Item</label>
                <select 
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    required
                >
                    <option value="">Choose an item...</option>
                    {stockItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quantity</label>
                <input 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    type="number" 
                    min="1" 
                    placeholder="Enter quantity" 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" 
                    required 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Supplier (Optional)</label>
                <select 
                    value={supplierId} 
                    onChange={(e) => setSupplierId(e.target.value)} 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                    <option value="">Select Supplier...</option>
                    {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction Date</label>
                <input 
                    value={transactionDate} 
                    onChange={(e) => setTransactionDate(e.target.value)} 
                    type="date" 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    required 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (Optional)</label>
                <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Add any relevant details" 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 h-24"
                ></textarea>
            </div>
            
            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSubmitting ? 'Recording...' : 'Record Stock In'}
                </button>
            </div>
        </form>
    );
});
