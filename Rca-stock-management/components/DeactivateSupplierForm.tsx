import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Supplier } from '../types';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';

interface DeactivateSupplierFormProps {
    supplier: Supplier;
    onDeactivate: (id: number, password: string) => Promise<void>;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const DeactivateSupplierForm = React.memo<DeactivateSupplierFormProps>(({
    supplier,
    onDeactivate,
    onClose,
    addToast,
    removeToast
}) => {
    const [confirmation, setConfirmation] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmation !== 'i confirm deactivate') {
            addToast('Please type the confirmation phrase exactly.', 'error');
            return;
        }
        
        if (!password) {
            addToast('Please enter your password.', 'error');
            return;
        }
        
        try {
            const toastId = addToast("Deactivating supplier...", 'loading');
            await onDeactivate(supplier.id, password);
            removeToast(toastId);
            addToast("Supplier deactivated successfully.", 'success');
            onClose();
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : 'Failed to deactivate supplier. Incorrect password?';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Confirm Deactivation</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                        Deactivating <strong>{supplier.name}</strong> will hide them from active lists. You can reactivate them later.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Type <span className="font-mono font-bold text-amber-600 dark:text-amber-400">i confirm deactivate</span> to confirm
                    </label>
                    <input 
                        type="text" 
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="i confirm deactivate"
                        required 
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Admin Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
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
                        disabled={confirmation !== 'i confirm deactivate' || !password}
                        className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Deactivate Supplier
                    </button>
                </div>
            </form>
        </div>
    );
});
