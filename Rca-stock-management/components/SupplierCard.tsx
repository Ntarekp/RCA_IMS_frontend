import React from 'react';
import { Supplier } from '../types';
import { Phone, Mail, Box, MoreVertical, ExternalLink } from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  onViewDetails: (supplier: Supplier) => void;
  onOrder: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onViewDetails, onOrder }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                 {supplier.name.charAt(0)}
             </div>
             <div>
                 <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{supplier.name}</h3>
                 <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Active Partner</span>
             </div>
        </div>
        <button 
          onClick={() => onViewDetails(supplier)}
          className="text-slate-300 hover:text-slate-500 p-1 hover:bg-slate-50 rounded-lg transition-colors"
        >
            <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-600 p-2.5 rounded-lg bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
          <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <span className="font-medium">{supplier.contact}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 p-2.5 rounded-lg bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
           <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-400">
            <Mail className="w-4 h-4" />
           </div>
          <span className="font-medium truncate">{supplier.email}</span>
        </div>
        <div className="flex items-start gap-3 text-sm text-slate-600 p-2.5 rounded-lg bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
           <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-400">
            <Box className="w-4 h-4" />
           </div>
          <div className="flex flex-wrap gap-1">
             {supplier.itemsSupplied.slice(0, 3).map((item, i) => (
                 <span key={i} className="text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{item}</span>
             ))}
             {supplier.itemsSupplied.length > 3 && (
                <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">+{supplier.itemsSupplied.length - 3}</span>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onViewDetails(supplier)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          View Details
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => onOrder(supplier)}
          className="flex items-center justify-center py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-95"
        >
          Order Now
        </button>
      </div>
    </div>
  );
};