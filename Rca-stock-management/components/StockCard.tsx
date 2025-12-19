import React from 'react';
import { StockItem } from '../types';
import { Package, MoreHorizontal, ArrowRight, MapPin, AlertCircle } from 'lucide-react';

interface StockCardProps {
  item: StockItem;
  onManage: (item: StockItem) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ item, onManage }) => {
  const getStatusColor = (status: StockItem['status']) => {
    switch (status) {
        case 'Birahagije': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
        case 'Mucye': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
        case 'Byashize': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
        default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-blue-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
      
      {/* Decorative background blur for low stock */}
      {item.status === 'Byashize' && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 opacity-50 z-0"></div>
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
         <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors border border-slate-100 group-hover:border-blue-100">
            <Package className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
         </div>
         <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ring-1 ${getStatusColor(item.status)}`}>
                {item.status}
            </span>
            <button 
                onClick={() => onManage(item)}
                className="text-slate-300 hover:text-slate-500 p-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <MoreHorizontal className="w-5 h-5" />
            </button>
         </div>
      </div>

      <div className="mb-6 flex-1 relative z-10">
        <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1" title={item.name}>{item.name}</h3>
        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            {item.category}
            {item.location && (
                <>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <MapPin className="w-3 h-3" /> {item.location}
                </>
            )}
        </p>
      </div>

      <div className="space-y-3 mb-6 relative z-10">
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-xs text-slate-500 font-medium">Available</span>
            <span className={`text-sm font-bold ${item.currentQuantity <= item.minimumQuantity ? 'text-rose-600' : 'text-slate-700'}`}>
                {item.currentQuantity} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
            </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-xs text-slate-500 font-medium">Min. Level</span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">{item.minimumQuantity} <span className="text-xs text-slate-400 font-normal">{item.unit}</span></span>
                {item.currentQuantity <= item.minimumQuantity && (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
            </div>
        </div>
      </div>

      <button 
        onClick={() => onManage(item)}
        className="relative z-10 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-900 hover:text-white transition-all duration-200 group/btn shadow-sm"
      >
        Manage Item
        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
      </button>
    </div>
  );
};