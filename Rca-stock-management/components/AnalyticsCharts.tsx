import React, { useEffect, useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { getAnalyticsSummary, AnalyticsSummary } from '../api/services/analyticsService';
import { Loader2, ChevronDown, MoreHorizontal } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await getAnalyticsSummary();
                setData(result);
            } catch (err) {
                console.error('Failed to load analytics charts', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!data) return null;

    // Prepare Pie Chart Data (Stock Out Reasons)
    // Using same color palette as Dashboard Donut where applicable
    const pieData = Object.entries(data.stockOutReasons).map(([name, value]) => ({ name, value }));
    // Colors: Consumed (Slate), Damaged (Red), Expired (Orange), Other (Blue)
    const PIE_COLORS = ['#64748b', '#ef4444', '#f97316', '#2563eb', '#8b5cf6'];

    // Prepare Bar Chart Data (Top Consumed Items)
    const barData = Object.entries(data.topConsumedItems).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            {/* Row 1: Trends & Reasons */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stock Flow Trends (Bar Chart - Matching Dashboard Style) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Stock Flow Trends</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Inflow vs Consumption vs Loss (Last 6 Months)</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a]"></span> In
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]"></span> Consumed
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> Loss
                                </div>
                            </div>
                            <button className="flex items-center gap-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors">
                                Last 6 Months <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyTrends} barGap={8}>
                                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                                    dy={12}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0', 
                                        boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)',
                                        fontFamily: 'Inter',
                                        fontSize: '12px'
                                    }}
                                    cursor={{fill: '#f8fafc'}}
                                />
                                <Bar dataKey="stockIn" name="Stock In" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: '#1e293b' }} />
                                <Bar dataKey="consumed" name="Consumed" fill="#64748b" radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: '#475569' }} />
                                <Bar dataKey="loss" name="Loss/Damaged" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: '#dc2626' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Out Reasons Pie Chart (Matching Dashboard Donut Style) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Outflow Reasons</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Why stock is leaving</p>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                     </div>
             
                     <div className="flex-1 min-h-[250px] w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
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
                                        <Tooltip />
                                    </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Out</span>
                                <span className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {pieData.reduce((acc, curr) => acc + curr.value, 0)}
                                </span>
                            </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mt-2">
                         {pieData.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full" style={{backgroundColor: PIE_COLORS[idx % PIE_COLORS.length]}}></span>
                                 <span className="text-xs font-medium text-slate-600">{item.name}</span>
                             </div>
                         ))}
                     </div>
                </div>
            </div>

            {/* Row 2: Top Items (Horizontal Bar Chart) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Top 5 Most Consumed Items</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">High velocity inventory</p>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={100} 
                                tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)',
                                    fontFamily: 'Inter',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar dataKey="value" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={20} activeBar={{ fill: '#1e293b' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
