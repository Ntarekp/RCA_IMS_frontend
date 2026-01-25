import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Package, AlertTriangle, XCircle, Calendar, Loader2, Minus } from 'lucide-react';
import { ViewState } from '../types';
import { getDashboardMetrics } from '../api/services/dashboardService';
import { StockMetricsDTO } from '../api/types';

interface DashboardStatsProps {
  onNavigate: (view: ViewState) => void;
}

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  icon: any;
  dark?: boolean;
  colorClass?: string;
  targetView: string;
  onNavigate: (view: ViewState) => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon: Icon, dark = false, colorClass = "text-[#1E293B]", targetView, onNavigate }) => {
  // Determine trend display
  let TrendIcon = Minus;
  let trendColor = dark ? 'text-slate-400' : 'text-slate-500';
  
  if (trend > 0) {
      TrendIcon = ArrowUpRight;
      // For "bad" metrics like damaged/low stock, increase is bad (red)
      // For "good" metrics like total stock/inflow, increase is good (green)
      if (title.includes('Damaged') || title.includes('Low Stock')) {
          trendColor = dark ? 'text-rose-400' : 'text-rose-500';
      } else {
          trendColor = 'text-emerald-500';
      }
  } else if (trend < 0) {
      TrendIcon = ArrowDownRight;
       // For "bad" metrics, decrease is good (green)
       // For "good" metrics, decrease is bad (red)
       if (title.includes('Damaged') || title.includes('Low Stock')) {
          trendColor = 'text-emerald-500';
      } else {
          trendColor = dark ? 'text-rose-400' : 'text-rose-500';
      }
  }

  return (
  <div 
    className={`p-6 rounded-2xl flex flex-col justify-between h-44 relative group transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
      dark 
        ? 'bg-[#1E293B] dark:bg-blue-600 text-white shadow-xl shadow-slate-900/20' 
        : 'bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg'
    }`}
    onClick={() => onNavigate(targetView as ViewState)}
  >
    <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl ${dark ? 'bg-white/10' : 'bg-[#F7F8FD] dark:bg-slate-700'}`}>
            <Icon className={`w-5 h-5 ${dark ? 'text-white' : `${colorClass} dark:text-white`}`} />
        </div>
        <button className={`flex items-center text-[10px] border rounded-full px-2.5 py-1 transition-colors ${
            dark 
                ? 'border-white/20 text-slate-300 hover:bg-white/10' 
                : 'border-[#E5E7EB] dark:border-slate-600 text-[#9CA3AF] dark:text-slate-400 hover:bg-[#F7F8FD] dark:hover:bg-slate-700 hover:text-[#1E293B] dark:hover:text-white'
        }`}>
            Details <ChevronRight className="w-3 h-3 ml-0.5" />
        </button>
    </div>
    
    <div className="space-y-1">
        <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-[#9CA3AF] dark:text-slate-400'}`}>{title}</span>
        <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-bold tracking-tight ${dark ? 'text-white' : 'text-[#1E293B] dark:text-white'}`}>{value}</h3>
        </div>
        <div className={`flex items-center text-xs font-medium ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5 mr-1" />
            <span>{Math.abs(trend)}%</span>
            <span className={`ml-1.5 ${dark ? 'text-slate-400' : 'text-[#9CA3AF] dark:text-slate-500'}`}>vs last month</span>
        </div>
    </div>
  </div>
)};

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<StockMetricsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Stock Items" 
        value={formatNumber(metrics?.total || 0)} 
        trend={metrics?.totalChange || 0} 
        icon={Package} 
        dark={true}
        targetView="STOCK"
        onNavigate={onNavigate}
      />
      <StatCard 
        title="Low Stock Items" 
        value={formatNumber(metrics?.lowStock || 0)} 
        trend={metrics?.lowStockChange || 0} 
        icon={AlertTriangle} 
        colorClass="text-amber-500"
        targetView="STOCK"
        onNavigate={onNavigate}
      />
      <StatCard 
        title="Damaged Items" 
        value={formatNumber(metrics?.damaged || 0)} 
        trend={metrics?.damagedChange || 0} 
        icon={XCircle} 
        colorClass="text-rose-500"
        targetView="ANALYTICS"
        onNavigate={onNavigate}
      />
       <StatCard 
        title="Monthly Inflow" 
        value={formatNumber(metrics?.thisMonth || 0)} 
        trend={metrics?.thisMonthChange || 0} 
        icon={Calendar} 
        colorClass="text-[#1E293B]"
        targetView="ANALYTICS"
        onNavigate={onNavigate}
      />
    </div>
  );
};

// Helper function moved outside component
const formatNumber = (num: number) => {
  return num.toLocaleString();
};
