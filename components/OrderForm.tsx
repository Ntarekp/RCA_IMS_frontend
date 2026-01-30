import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Supplier } from '../types';
import { ToastMessage } from './Toast';

interface OrderFormProps {
    supplier: Supplier;
    onOrder: (data: { item: string; quantity: number; instructions: string }) => Promise<void>;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const OrderForm = React.memo<OrderFormProps>(({
    supplier,
    onOrder,
    onClose,
    addToast,
    removeToast
}) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const orderData = {
            item: (form.elements.namedItem('item') as HTMLSelectElement).value,
            quantity: Number((form.elements.namedItem('quantity') as HTMLInputElement).value),
            instructions: (form.elements.namedItem('instructions') as HTMLTextAreaElement).value
        };

        try {
            const toastId = addToast(`Sending order to ${supplier.name}...`, 'loading');
            await onOrder(orderData);
            removeToast(toastId);
            addToast(`Order request sent to ${supplier.name}`, 'success');
            onClose();
        } catch (error) {
            addToast('Failed to send order request', 'error');
        }
    };

    return (
        <form id="order-form" className="space-y-5" onSubmit={handleSubmit}>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-blue-800 dark:text-blue-300 text-sm flex gap-3">
                <div className="bg-white dark:bg-slate-800 p-1 rounded-full h-fit">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                You are placing an order request to <strong>{supplier.name}</strong>.
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Item</label>
                <select name="item" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                    {supplier.itemsSupplied.map((item, i) => <option key={i} value={item}>{item}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quantity</label>
                <input name="quantity" type="number" placeholder="Amount" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Delivery Instructions</label>
                <textarea name="instructions" placeholder="Any specific requirements..." className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 h-24"></textarea>
            </div>
        </form>
    );
});
