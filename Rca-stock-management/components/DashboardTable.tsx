import React from 'react';
import { DashboardItem } from '../types';

interface DashboardTableProps {
  items: DashboardItem[];
}

export const DashboardTable: React.FC<DashboardTableProps> = ({ items }) => {
  const getStatusBadge = (status: DashboardItem['status']) => {
    switch (status) {
      case 'Birahagije':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#8b92a1] text-white">Birahagije</span>;
      case 'Hafi gushira':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#fde68a] text-yellow-800">Hafi gushira</span>;
      case 'Byashize':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-600">Byashize</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#f3f6f9] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Table Header Row */}
                <div className="grid grid-cols-7 gap-4 px-6 py-4 text-sm font-medium text-gray-600">
                    <div className="col-span-1">Izina</div>
                    <div className="col-span-1 text-center">Igipimo fatizo</div>
                    <div className="col-span-1 text-center">Ingano y'ibijiye</div>
                    <div className="col-span-1 text-center">Ingano y'ibisigaye</div>
                    <div className="col-span-1 text-center">Ingano ntarengwa</div>
                    <div className="col-span-1 text-center">Imitere</div>
                    <div className="col-span-1 text-right">Gusohoka biheruka</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <div key={item.id} className="grid grid-cols-7 gap-4 px-6 py-4 bg-[#eff4fa] text-sm text-gray-800 items-center hover:bg-gray-100 transition-colors mb-1 last:mb-0">
                            <div className="col-span-1 font-medium">{item.name}</div>
                            <div className="col-span-1 text-center text-gray-600">{item.unit}</div>
                            <div className="col-span-1 text-center">{item.quantityIn}</div>
                            <div className="col-span-1 text-center">{item.quantityRemaining}</div>
                            <div className="col-span-1 text-center">{item.quantityThreshold}</div>
                            <div className="col-span-1 text-center flex justify-center">
                                {getStatusBadge(item.status)}
                            </div>
                            <div className="col-span-1 text-right text-gray-500">{item.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};