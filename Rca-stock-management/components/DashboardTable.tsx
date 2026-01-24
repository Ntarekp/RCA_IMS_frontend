import React from 'react';
import { DashboardItem } from '../types';

interface DashboardTableProps {
  items: DashboardItem[];
}

export const DashboardTable: React.FC<DashboardTableProps> = React.memo(({ items }) => {
  const getStatusBadge = (status: DashboardItem['status']) => {
    switch (status) {
      case 'Birahagije':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#8b92a1] dark:bg-slate-600 text-white">Birahagije</span>;
      case 'Hafi gushira':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#fde68a] dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">Hafi gushira</span>;
      case 'Byashize':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">Byashize</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#f3f6f9] dark:bg-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Table Header Row */}
                <div className="grid grid-cols-7 gap-4 px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-400">
                    <div className="col-span-1">Izina</div>
                    <div className="col-span-1 text-center">Igipimo fatizo</div>
                    <div className="col-span-1 text-center">Ingano y'ibijiye</div>
                    <div className="col-span-1 text-center">Ingano y'ibisigaye</div>
                    <div className="col-span-1 text-center">Ingano ntarengwa</div>
                    <div className="col-span-1 text-center">Imitere</div>
                    <div className="col-span-1 text-right">Gusohoka biheruka</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {items.map((item) => (
                        <div key={item.id} className="grid grid-cols-7 gap-4 px-6 py-4 bg-[#eff4fa] dark:bg-slate-700/50 text-sm text-gray-800 dark:text-slate-200 items-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors mb-1 last:mb-0">
                            <div className="col-span-1 font-medium">{item.name}</div>
                            <div className="col-span-1 text-center text-gray-600 dark:text-slate-400">{item.unit}</div>
                            <div className="col-span-1 text-center">{item.quantityIn}</div>
                            <div className="col-span-1 text-center">{item.quantityRemaining}</div>
                            <div className="col-span-1 text-center">{item.quantityThreshold}</div>
                            <div className="col-span-1 text-center flex justify-center">
                                {getStatusBadge(item.status)}
                            </div>
                            <div className="col-span-1 text-right text-gray-500 dark:text-slate-500">{item.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
});
