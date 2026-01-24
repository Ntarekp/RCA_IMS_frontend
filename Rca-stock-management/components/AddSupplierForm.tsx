import React from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { CreateSupplierRequest } from '../api/types';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';

interface AddSupplierFormProps {
    onAddSupplier: (data: CreateSupplierRequest) => Promise<void>;
    onSuccess: () => Promise<void>;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const AddSupplierForm = React.memo<AddSupplierFormProps>(({
    onAddSupplier,
    onSuccess,
    onClose,
    addToast,
    removeToast
}) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const supplierData: CreateSupplierRequest = {
            name: formData.get('name') as string,
            contact: formData.get('phone') as string, // Mapping phone to contact for now
            email: formData.get('email') as string,
            itemsSupplied: (formData.get('itemsSupplied') as string).split(',').map(s => s.trim()),
        };

        try {
            const toastId = addToast("Adding supplier...", 'loading');
            await onAddSupplier(supplierData);
            removeToast(toastId);
            addToast("Supplier added successfully.", 'success');
            onClose();
            await onSuccess();
        } catch (error) {
            const errorMessage = error instanceof ApiError 
                ? error.message 
                : 'Failed to add supplier. Please try again.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <form id="add-supplier-form" className="space-y-5" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                <input name="name" type="text" placeholder="e.g. Kigali Grains Ltd" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact Person</label>
                <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="contactPerson" type="text" placeholder="Full Name" className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="phone" type="tel" placeholder="+250 7..." className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="email" type="email" placeholder="contact@supplier.com" className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Items Supplied</label>
                <textarea name="itemsSupplied" placeholder="List main items supplied (comma separated)..." className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 h-24"></textarea>
            </div>
        </form>
    );
});
