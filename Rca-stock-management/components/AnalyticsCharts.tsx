import React, { useEffect, useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { getAnalyticsSummary, AnalyticsSummary } from '../api/services/analyticsService';
import { Loader2, ChevronDown, MoreHorizontal } from 'lucide-react';

export const AnalyticsCharts: React.FC = React.memo(() => {
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await getAnalyticsSummary();
                setData(result);
            } catch (err) {
                if (import.meta.env.DEV) console.error('Failed to load analytics charts', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#9CA3AF] dark:text-slate-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-2 text-sm text-red-600 dark:text-red-300 underline">Refresh Page</button>
            </div>
        );
    }

    if (!data) return null;

    // Prepare Pie Chart Data (Stock Out Reasons)
    const pieData = React.useMemo(() => {
        return Object.entries(data.stockOutReasons).map(([name, value]) => ({ name, value }));
    }, [data.stockOutReasons]);
    
    // Colors: Consumed (Slate), Damaged (Red), Expired (Orange), Other (Blue), Transferred (Purple)
    const PIE_COLORS = React.useMemo(() => isDark 
        ? ['#94a3b8', '#f87171', '#fb923c', '#3b82f6', '#a78bfa'] 
        : ['#64748b', '#ef4444', '#f97316', '#1E293B', '#8b5cf6'], [isDark]);

    // Prepare Bar Chart Data (Top Consumed Items)
    const barData = React.useMemo(() => {
        return Object.entries(data.topConsumedItems).map(([name, value]) => ({ name, value }));
    }, [data.topConsumedItems]);

    // Chart Colors
    const gridColor = isDark ? '#334155' : '#f1f5f9';
    const textColor = isDark ? '#94a3b8' : '#9CA3AF';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : '#E5E7EB';
    const tooltipText = isDark ? '#f8fafc' : '#1E293B';

    return (
        <div className="space-y-6">
            {/* Row 1: Trends & Reasons */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stock Flow Trends (Bar Chart) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">Stock Flow Trends</h3>
                            <p className="text-xs text-[#9CA3AF] dark:text-slate-400 font-medium mt-1">Inflow vs Consumption vs Loss (Last 6 Months)</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 text-xs font-medium text-[#9CA3AF] dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B] dark:bg-blue-500"></span> In
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#64748b] dark:bg-slate-400"></span> Consumed
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] dark:bg-red-400"></span> Loss
                                </div>
                            </div>
                            <button className="flex items-center gap-1.5 text-xs font-medium bg-[#F7F8FD] dark:bg-slate-700 border border-[#E5E7EB] dark:border-slate-600 rounded-lg px-3 py-1.5 text-[#1E293B] dark:text-white hover:bg-[#EDEEF3] dark:hover:bg-slate-600 transition-colors">
                                Last 6 Months <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <BarChart data={data.monthlyTrends} barGap={8}>
                                <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: textColor, fontSize: 11, fontWeight: 500}} 
                                    dy={12}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: textColor, fontSize: 11, fontWeight: 500}} 
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
                                <Bar dataKey="stockIn" name="Stock In" fill={isDark ? '#3b82f6' : '#1E293B'} radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: isDark ? '#60a5fa' : '#334155' }} />
                                <Bar dataKey="consumed" name="Consumed" fill={isDark ? '#94a3b8' : '#64748b'} radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: isDark ? '#cbd5e1' : '#475569' }} />
                                <Bar dataKey="loss" name="Loss/Damaged" fill={isDark ? '#f87171' : '#ef4444'} radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: isDark ? '#fca5a5' : '#dc2626' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Out Reasons Pie Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">Outflow Reasons</h3>
                            <p className="text-xs text-[#9CA3AF] dark:text-slate-400 font-medium mt-1">Why stock is leaving</p>
                        </div>
                        <button className="text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                     </div>
             
                     <div className="h-[250px] w-full flex items-center justify-center relative min-w-0">
                            <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            cornerRadius={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: tooltipBg,
                                                borderRadius: '12px', 
                                                border: `1px solid ${tooltipBorder}`, 
                                                color: tooltipText
                                            }}
                                            itemStyle={{ color: tooltipText }}
                                        />
                                    </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-semibold text-[#9CA3AF] dark:text-slate-400 uppercase tracking-wider">Total Out</span>
                                <span className="text-2xl font-bold text-[#1E293B] dark:text-white tracking-tight">
                                    {pieData.reduce((acc, curr) => acc + curr.value, 0)}
                                </span>
                            </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mt-2">
                         {pieData.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full" style={{backgroundColor: PIE_COLORS[idx % PIE_COLORS.length]}}></span>
                                 <span className="text-xs font-medium text-[#1E293B] dark:text-slate-200">{item.name}</span>
                             </div>
                         ))}
                     </div>
                </div>
            </div>

            {/* Row 2: Top Items (Horizontal Bar Chart) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">Top 5 Most Consumed Items</h3>
                    <p className="text-xs text-[#9CA3AF] dark:text-slate-400 font-medium mt-1">High velocity inventory</p>
                </div>
                <div className="h-[250px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={100} 
                                tick={{fill: textColor, fontSize: 12, fontWeight: 500}} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                cursor={{fill: isDark ? '#334155' : '#F7F8FD'}}
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
                            />
                            <Bar dataKey="value" fill={isDark ? '#3b82f6' : '#1E293B'} radius={[0, 4, 4, 0]} barSize={20} activeBar={{ fill: isDark ? '#60a5fa' : '#334155' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
});
