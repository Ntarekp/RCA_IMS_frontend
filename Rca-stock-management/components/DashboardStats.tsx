import React from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Package, AlertTriangle, XCircle, Calendar } from 'lucide-react';
import { ViewState } from '../types';

interface DashboardStatsProps {
  onNavigate: (view: ViewState) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onNavigate }) => {
  const StatCard = ({ title, value, trend, trendUp, icon: Icon, dark = false, colorClass = "text-blue-500", targetView }: any) => (
      <div 
        className={`p-6 rounded-2xl flex flex-col justify-between h-44 relative group transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
          dark 
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/20' 
            : 'bg-white border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg'
      }`}
        onClick={() => onNavigate(targetView)}
      >
        <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-xl ${dark ? 'bg-white/10' : 'bg-slate-50'}`}>
                <Icon className={`w-5 h-5 ${dark ? 'text-white' : colorClass}`} />
            </div>
            <button className={`flex items-center text-[10px] border rounded-full px-2.5 py-1 transition-colors ${
                dark ? 'border-white/20 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}>
                Details <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
        </div>
        
        <div className="space-y-1">
            <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{title}</span>
            <div className="flex items-baseline gap-2">
                <h3 className={`text-3xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-800'}`}>{value}</h3>
            </div>
            <div className={`flex items-center text-xs font-medium ${
                trendUp 
                    ? 'text-emerald-500' 
                    : (dark ? 'text-rose-400' : 'text-rose-500')
            }`}>
                {trendUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                <span>{trend}</span>
                <span className={`ml-1.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>vs last month</span>
            </div>
        </div>
      </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Stock Items" 
        value="23,450" 
        trend="12.5%" 
        trendUp={true} 
        icon={Package} 
        dark={true}
        targetView="STOCK"
      />
      <StatCard 
        title="Low Stock Items" 
        value="142" 
        trend="4.2%" 
        trendUp={false} 
        icon={AlertTriangle} 
        colorClass="text-amber-500"
        targetView="STOCK"
      />
      <StatCard 
        title="Damaged Items" 
        value="24" 
        trend="0.8%" 
        trendUp={false} 
        icon={XCircle} 
        colorClass="text-rose-500"
        targetView="DASHBOARD"
      />
       <StatCard 
        title="Monthly Inflow" 
        value="1,240" 
        trend="8.2%" 
        trendUp={true} 
        icon={Calendar} 
        colorClass="text-indigo-500"
        targetView="ANALYTICS"
      />
    </div>
  );
};