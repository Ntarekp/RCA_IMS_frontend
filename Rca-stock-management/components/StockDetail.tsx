import React, { useState } from 'react';
import { StockItem } from '../types';
import { UpdateItemRequest } from '../api/types';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';
import { Box, Clock, History } from 'lucide-react';

interface StockDetailProps {
    item: StockItem;
    onUpdateItem: (id: number, data: UpdateItemRequest) => Promise<void>;
    onClose: () => void;
    onViewHistory: (itemId: number) => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

const TabButton = React.memo(({ tabName, label, activeTab, onClick }: { tabName: string; label: string; activeTab: string; onClick: (tab: string) => void }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === tabName
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 border-t border-x text-slate-800 dark:text-white'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
        }`}
    >
        {label}
    </button>
));

export const StockDetail = React.memo<StockDetailProps>(({
    item,
    onUpdateItem,
    onClose,
    onViewHistory,
    addToast,
    removeToast
}) => {
    const [activeTab, setActiveTab] = useState('details');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const updateData: UpdateItemRequest = {
            name: formData.get('name') as string,
            unit: formData.get('unit') as string,
            minimumStock: parseInt(formData.get('minimumStock') as string),
            description: formData.get('description') as string,
        };

        try {
            const toastId = addToast("Updating item...", 'loading');
            await onUpdateItem(Number(item.id), updateData);
            removeToast(toastId);
            addToast("Item updated successfully.", 'success');
            onClose();
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : 'Failed to update item.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex border-b border-slate-200 dark:border-slate-600 -mx-6 px-6">
                <TabButton tabName="details" label="Details" activeTab={activeTab} onClick={setActiveTab} />
                <TabButton tabName="edit" label="Edit Item" activeTab={activeTab} onClick={setActiveTab} />
            </div>

            {activeTab === 'details' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Stock</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">{item.currentQuantity} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{item.unit}</span></div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</div>
                            <div className={`text-sm font-bold px-2 py-1 rounded-full w-fit ${
                                item.status === 'Birahagije' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                item.status === 'Mucye' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>{item.status}</div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 font-medium">Total Stocked In</div>
                            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{item.totalIn || 0} <span className="text-xs font-normal opacity-70">{item.unit}</span></div>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                            <div className="text-xs text-rose-600 dark:text-rose-400 mb-1 font-medium">Total Stocked Out</div>
                            <div className="text-lg font-bold text-rose-700 dark:text-rose-300">{item.totalOut || 0} <span className="text-xs font-normal opacity-70">{item.unit}</span></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                            <div className="p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2">
                                <Box className="w-4 h-4 text-slate-400" />
                                {item.category}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Minimum Threshold</label>
                            <div className="p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 text-sm">
                                {item.minimumQuantity} {item.unit}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Updated</label>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Clock className="w-4 h-4" />
                                {item.lastUpdated}
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => onViewHistory(Number(item.id))}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <History className="w-4 h-4" />
                                View Transaction History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'edit' && (
                <form id="edit-stock-form" className="space-y-5" onSubmit={handleUpdate}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Item Name</label>
                        <input name="name" defaultValue={item.name} type="text" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description / Category</label>
                        <input name="description" defaultValue={item.category} type="text" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Unit</label>
                            <select name="unit" defaultValue={item.unit} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
                                <option>Kg</option>
                                <option>Liters</option>
                                <option>Pieces</option>
                                <option>Bags</option>
                                <option>Sacks</option>
                                <option>Boxes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Min Threshold</label>
                            <input name="minimumStock" defaultValue={item.minimumQuantity} type="number" min="1" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
});
