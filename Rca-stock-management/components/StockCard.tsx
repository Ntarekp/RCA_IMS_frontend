import React, { useState, useEffect, useRef } from 'react';
import { StockItem } from '../types';
import { Package, MoreHorizontal, ArrowRight, MapPin, AlertCircle, Trash2, Edit, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface StockCardProps {
  item: StockItem;
  onManage: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ item, onManage, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (status: StockItem['status']) => {
    switch (status) {
        case 'Birahagije': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
        case 'Mucye': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
        case 'Byashize': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
        default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-blue-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
      
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
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <MoreHorizontal className="w-5 h-5" />
                </button>
                {/* Dropdown Menu */}
                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-150">
                        <button 
                            onClick={() => { onManage(item); setMenuOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                        >
                            <Edit className="w-3.5 h-3.5" /> Edit Details
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                            onClick={() => { onDelete(item); setMenuOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Item
                        </button>
                    </div>
                )}
            </div>
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
        {/* New Total In/Out Stats */}
        <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-emerald-50/50 rounded-lg p-2 flex flex-col items-center justify-center border border-emerald-100/50">
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mb-0.5">
                    <ArrowDownToLine className="w-3 h-3" /> Total In
                </div>
                <span className="text-xs font-bold text-emerald-700">{item.totalIn || 0}</span>
            </div>
            <div className="bg-rose-50/50 rounded-lg p-2 flex flex-col items-center justify-center border border-rose-100/50">
                <div className="flex items-center gap-1 text-[10px] text-rose-600 font-medium mb-0.5">
                    <ArrowUpFromLine className="w-3 h-3" /> Total Out
                </div>
                <span className="text-xs font-bold text-rose-700">{item.totalOut || 0}</span>
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
