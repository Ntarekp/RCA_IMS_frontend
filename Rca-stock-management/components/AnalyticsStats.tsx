import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export const AnalyticsStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Stock Value */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Est. Total Value</span>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full">
                <DollarSign className="w-4 h-4" />
            </div>
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-800">2.4M RWF</div>
            <div className="flex items-center text-xs text-emerald-500 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+12% vs last month</span>
            </div>
        </div>
      </div>

      {/* Consumption Rate */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Consumption Rate</span>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-full">
                <Activity className="w-4 h-4" />
            </div>
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-800">85%</div>
            <div className="flex items-center text-xs text-blue-500 mt-1">
                <span>Stable workflow</span>
            </div>
        </div>
      </div>

      {/* Waste Analysis */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Waste Ratio</span>
            <div className="bg-rose-50 text-rose-600 p-2 rounded-full">
                <TrendingDown className="w-4 h-4" />
            </div>
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-800">4.2%</div>
            <div className="flex items-center text-xs text-rose-500 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+1.2% increase</span>
            </div>
        </div>
      </div>

       {/* Monthly Restock */}
       <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Avg Restock Cycle</span>
            <div className="bg-purple-50 text-purple-600 p-2 rounded-full">
                <Activity className="w-4 h-4" />
            </div>
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-800">14 Days</div>
            <div className="flex items-center text-xs text-gray-400 mt-1">
                <span>Next: 3 days remaining</span>
            </div>
        </div>
      </div>
    </div>
  );
};
