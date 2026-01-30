import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { StockItem } from '../types';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';

interface DeleteItemFormProps {
    item: StockItem;
    onDelete: (id: number, password: string) => Promise<void>;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const DeleteItemForm = React.memo<DeleteItemFormProps>(({
    item,
    onDelete,
    onClose,
    addToast,
    removeToast
}) => {
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deleteConfirmation !== 'i confirm delete') {
            addToast('Please type the confirmation phrase exactly.', 'error');
            return;
        }
        
        if (!deletePassword) {
            addToast('Please enter your password.', 'error');
            return;
        }
        
        try {
            const toastId = addToast("Deleting item...", 'loading');
            await onDelete(Number(item.id), deletePassword);
            removeToast(toastId);
            addToast("Item deleted successfully.", 'success');
            onClose();
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : 'Failed to delete item. Incorrect password?';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 flex gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                    <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Warning: Irreversible Action</h3>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                        Deleting <strong>{item.name}</strong> will remove all associated data, including transaction history. This cannot be undone.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Type <span className="font-mono font-bold text-red-600 dark:text-red-400">i confirm delete</span> to confirm
                    </label>
                    <input 
                        type="text" 
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="i confirm delete"
                        required 
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Admin Password</label>
                    <input 
                        type="password" 
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="Enter your password"
                        required 
                    />
                </div>

                <div className="pt-2 flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={deleteConfirmation !== 'i confirm delete' || !deletePassword}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Delete Item
                    </button>
                </div>
            </form>
        </div>
    );
});
