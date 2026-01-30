import React, { useMemo } from 'react';
import { Supplier, UserProfile } from '../types';
import { Phone, Mail, MapPin, Truck, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface SupplierDetailProps {
    supplier: Supplier;
    inactiveSuppliers: Supplier[];
    userProfile: UserProfile | null;
    onClose: () => void;
    onDeactivate: (supplier: Supplier) => void;
    onReactivate: (supplierId: string) => Promise<void>;
    onDelete: (supplier: Supplier) => void;
    onRefetch: () => Promise<void>;
    addToast: (message: string, type: 'success' | 'error' | 'loading' | 'info') => string;
    removeToast: (id: string) => void;
}

export const SupplierDetail = React.memo<SupplierDetailProps>(({
    supplier,
    inactiveSuppliers,
    userProfile,
    onClose,
    onDeactivate,
    onReactivate,
    onDelete,
    onRefetch,
    addToast,
    removeToast
}) => {
    // Memoize the inactive check to avoid recalculation on every render
    const isInactive = useMemo(() => {
        return inactiveSuppliers.some(s => s.id === supplier.id);
    }, [inactiveSuppliers, supplier.id]);

    const handleReactivate = async () => {
        try {
            const toastId = addToast("Reactivating supplier...", 'loading');
            await onReactivate(supplier.id);
            removeToast(toastId);
            addToast("Supplier reactivated.", 'success');
            onClose();
            onRefetch();
        } catch (e) {
            addToast("Failed to reactivate supplier.", 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-100 dark:border-slate-600 space-y-3">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{supplier.contact}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">Kigali, Nyarugenge District</span>
                </div>
            </div>

            {/* Supplies List */}
            <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    Supplied Items
                </h3>
                <div className="flex flex-wrap gap-2">
                    {supplier.itemsSupplied.map((item, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {userProfile?.role === 'ADMIN' && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                    {!isInactive ? (
                        <button
                            onClick={() => {
                                onClose();
                                setTimeout(() => onDeactivate(supplier), 300);
                            }}
                            className="w-full text-center text-amber-600 dark:text-amber-400 text-sm font-medium hover:text-amber-700 dark:hover:text-amber-300 flex items-center justify-center gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Deactivate Supplier
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleReactivate}
                                className="w-full text-center text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reactivate Supplier
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    setTimeout(() => onDelete(supplier), 300);
                                }}
                                className="w-full text-center text-rose-600 dark:text-rose-400 text-sm font-medium hover:text-rose-700 dark:hover:text-rose-300 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Permanently
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
});
