import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronDown, MoreHorizontal, Loader2 } from 'lucide-react';
import { getChartData } from '../api/services/dashboardService';
import { useReports } from '../hooks/useReports';

export const DashboardCharts: React.FC = React.memo(() => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { balanceReport, refetch: refetchReports } = useReports();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const data = await getChartData(currentYear);
      setChartData(data);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error loading chart data:', err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    const interval = setInterval(() => {
      fetchChartData();
      refetchReports();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const calculateDonutData = React.useCallback(() => {
    if (!balanceReport || balanceReport.length === 0) {
      return [
        { name: 'Stock In', value: 0, color: isDark ? '#3b82f6' : '#1E293B' }, // Blue in dark, Dark Slate in light
        { name: 'Stock Out', value: 0, color: isDark ? '#94a3b8' : '#64748b' }, // Slate 400/500
        { name: 'Damaged', value: 0, color: isDark ? '#f87171' : '#ef4444' }, // Red 400/500
        { name: 'Low Stock', value: 0, color: isDark ? '#475569' : '#cbd5e1' }, // Slate 600/300
      ];
    }

    const totalIn = balanceReport.reduce((sum, item) => sum + item.totalIn, 0);
    const totalOut = balanceReport.reduce((sum, item) => sum + item.totalOut, 0);
    const damaged = 0; 
    const lowStock = balanceReport.filter(item => item.isLowStock).length;

    return [
      { name: 'Stock In', value: totalIn, color: isDark ? '#3b82f6' : '#1E293B' },
      { name: 'Stock Out', value: totalOut, color: isDark ? '#94a3b8' : '#64748b' },
      { name: 'Damaged', value: damaged, color: isDark ? '#f87171' : '#ef4444' },
      { name: 'Low Stock', value: lowStock, color: isDark ? '#475569' : '#cbd5e1' },
    ];
  }, [balanceReport, isDark]);

  const DONUT_DATA = React.useMemo(() => calculateDonutData(), [calculateDonutData]);
  const totalDonutValue = DONUT_DATA.reduce((sum, item) => sum + item.value, 0);
  const donutPercentage = totalDonutValue > 0 
    ? Math.round((DONUT_DATA[0].value / totalDonutValue) * 100) 
    : 0;

  // Chart Colors
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#9CA3AF';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#E5E7EB';
  const tooltipText = isDark ? '#f8fafc' : '#1E293B';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">Flow Analytics</h3>
                <p className="text-xs text-[#9CA3AF] dark:text-slate-400 font-medium mt-1">Movement of goods over time</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs font-medium text-[#9CA3AF] dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B] dark:bg-blue-500"></span> In
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#64748b] dark:bg-slate-400"></span> Out
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] dark:bg-red-400"></span> Damaged
                    </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-medium bg-[#F7F8FD] dark:bg-slate-700 border border-[#E5E7EB] dark:border-slate-600 rounded-lg px-3 py-1.5 text-[#1E293B] dark:text-white hover:bg-[#EDEEF3] dark:hover:bg-slate-600 transition-colors">
                    This Year <ChevronDown className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
        <div className="h-[280px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF] dark:text-slate-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                <BarChart data={chartData.length > 0 ? chartData : []} barGap={8}>
                    <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: textColor, fontSize: 11, fontWeight: 500}} 
                        dy={12}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: textColor, fontSize: 11, fontWeight: 500}} 
                        domain={[0, 'auto']}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: tooltipBg,
                            borderRadius: '12px', 
                            border: `1px solid ${tooltipBorder}`, 
                            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)',
                            fontFamily: 'Inter',
                            fontSize: '12px',
                            color: tooltipText
                        }}
                        itemStyle={{ color: tooltipText }}
                        cursor={{fill: isDark ? '#334155' : '#F7F8FD'}}
                    />
                    <Bar dataKey="in" fill={isDark ? '#3b82f6' : '#1E293B'} radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: isDark ? '#60a5fa' : '#334155' }} />
                    <Bar dataKey="out" fill={isDark ? '#94a3b8' : '#64748b'} radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: isDark ? '#cbd5e1' : '#475569' }} />
                    <Bar dataKey="damaged" fill={isDark ? '#f87171' : '#ef4444'} radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: isDark ? '#fca5a5' : '#dc2626' }} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col">
         <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">Stock Distribution</h3>
                <p className="text-xs text-[#9CA3AF] dark:text-slate-400 font-medium mt-1">Current inventory status</p>
            </div>
            <button className="text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
            </button>
         </div>
         
         <div className="h-[250px] w-full flex items-center justify-center relative min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                <PieChart>
                    <Pie
                        data={DONUT_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                    >
                        {DONUT_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-semibold text-[#9CA3AF] dark:text-slate-400 uppercase tracking-wider">Inflow</span>
                <span className="text-3xl font-bold text-[#1E293B] dark:text-white tracking-tight">{donutPercentage}%</span>
            </div>
         </div>
         
         <div className="grid grid-cols-2 gap-4 mt-2">
             {DONUT_DATA.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                     <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">{item.name}</span>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
});
