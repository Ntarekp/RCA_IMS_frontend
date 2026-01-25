import React, { useState, useEffect } from 'react';
import { StockItem, Supplier } from '../../types';
import { Loader2 } from 'lucide-react';

export interface StockInData {
    itemId: number;
    quantity: number;
    supplierId?: number;
    date: string;
    notes?: string;
}

export interface StockOutData {
    itemId: number;
    quantity: number;
    reason: string;
    date: string;
    notes?: string;
}

interface StockInFormProps {
    items: StockItem[];
    suppliers: Supplier[];
    onSubmit: (data: StockInData) => Promise<void>;
    onCancel: () => void;
    initialItemId?: string;
}

export const StockInForm: React.FC<StockInFormProps> = ({ 
    items, 
    suppliers, 
    onSubmit, 
    onCancel, 
    initialItemId 
}) => {
    const [itemId, setItemId] = useState(initialItemId || '');
    const [quantity, setQuantity] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemId || !quantity) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit({
                itemId: Number(itemId),
                quantity: Number(quantity),
                supplierId: supplierId ? Number(supplierId) : undefined,
                date,
                notes
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Item</label>
                <select 
                    value={itemId} 
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    required
                >
                    <option value="">Choose an item...</option>
                    {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
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
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
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
            <div className="flex gap-3 pt-2">
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Stock In'}
                </button>
            </div>
        </form>
    );
};

interface StockOutFormProps {
    items: StockItem[];
    onSubmit: (data: StockOutData) => Promise<void>;
    onCancel: () => void;
    initialItemId?: string;
}

export const StockOutForm: React.FC<StockOutFormProps> = ({ 
    items, 
    onSubmit, 
    onCancel, 
    initialItemId 
}) => {
    const [itemId, setItemId] = useState(initialItemId || '');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('Consumed');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemId || !quantity) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit({
                itemId: Number(itemId),
                quantity: Number(quantity),
                reason,
                date,
                notes
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Item</label>
                <select 
                    value={itemId} 
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    required
                >
                    <option value="">Choose an item...</option>
                    {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason for Stock Out</label>
                <select 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                    required
                >
                    <option>Consumed</option>
                    <option>Damaged</option>
                    <option>Expired</option>
                    <option>Transferred</option>
                    <option>Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Transaction Date</label>
                <input 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
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
            <div className="flex gap-3 pt-2">
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Stock Out'}
                </button>
            </div>
        </form>
    );
};
