import React from 'react';
import { Supplier } from '../types';
import { Phone, Mail, Box, MoreVertical, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  isActive?: boolean;
  onViewDetails: (supplier: Supplier) => void;
  onOrder?: (supplier: Supplier) => void;
  onReactivate?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ 
  supplier, 
  isActive = true, 
  onViewDetails, 
  onOrder,
  onReactivate,
  onDelete
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border ${isActive ? 'border-slate-100 dark:border-slate-700' : 'border-slate-200 dark:border-slate-600 opacity-75'} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-lg dark:hover:shadow-slate-900/30 hover:-translate-y-1 transition-all duration-300 group`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${isActive ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                 {supplier.name.charAt(0)}
             </div>
             <div>
                 <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{supplier.name}</h3>
                 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700'}`}>
                    {isActive ? 'Active Partner' : 'Inactive'}
                 </span>
             </div>
        </div>
        <button 
          onClick={() => onViewDetails(supplier)}
          className="text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 p-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
            <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="p-1.5 bg-white dark:bg-slate-600 rounded-md shadow-sm text-slate-400 dark:text-slate-300">
            <Phone className="w-4 h-4" />
          </div>
          <span className="font-medium">{supplier.contact}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
           <div className="p-1.5 bg-white dark:bg-slate-600 rounded-md shadow-sm text-slate-400 dark:text-slate-300">
            <Mail className="w-4 h-4" />
           </div>
          <span className="font-medium truncate">{supplier.email}</span>
        </div>
        <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
           <div className="p-1.5 bg-white dark:bg-slate-600 rounded-md shadow-sm text-slate-400 dark:text-slate-300">
            <Box className="w-4 h-4" />
           </div>
          <div className="flex flex-wrap gap-1">
             {supplier.itemsSupplied.slice(0, 3).map((item, i) => (
                 <span key={i} className="text-xs bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300">{item}</span>
             ))}
             {supplier.itemsSupplied.length > 3 && (
                <span className="text-xs bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300">+{supplier.itemsSupplied.length - 3}</span>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onViewDetails(supplier)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          View Details
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        
        {isActive && onOrder ? (
            <button 
              onClick={() => onOrder(supplier)}
              className="flex items-center justify-center py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-lg shadow-slate-900/10 active:scale-95"
            >
              Order Now
            </button>
        ) : !isActive && onReactivate ? (
            <button 
              onClick={() => onReactivate(supplier)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reactivate
            </button>
        ) : !isActive && onDelete ? (
             <button 
              onClick={() => onDelete(supplier)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-900/10 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
        ) : (
            <div />
        )}
      </div>
    </div>
  );
};
