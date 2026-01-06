import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronDown, MoreHorizontal, Loader2 } from 'lucide-react';
import { getChartData } from '../api/services/dashboardService';
import { useReports } from '../hooks/useReports';

export const DashboardCharts: React.FC = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { balanceReport, refetch: refetchReports } = useReports();

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const data = await getChartData(currentYear);
      setChartData(data);
    } catch (err) {
      console.error('Error loading chart data:', err);
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

  const calculateDonutData = () => {
    if (!balanceReport || balanceReport.length === 0) {
      return [
        { name: 'Stock In', value: 0, color: '#0f172a' }, // Dark Slate (Brand)
        { name: 'Stock Out', value: 0, color: '#64748b' }, // Slate
        { name: 'Damaged', value: 0, color: '#ef4444' }, // Red
        { name: 'Low Stock', value: 0, color: '#cbd5e1' }, // Light Slate
      ];
    }

    const totalIn = balanceReport.reduce((sum, item) => sum + item.totalIn, 0);
    const totalOut = balanceReport.reduce((sum, item) => sum + item.totalOut, 0);
    // Placeholder for damaged until backend supports it in balance report
    const damaged = 0; 
    const lowStock = balanceReport.filter(item => item.isLowStock).length;

    return [
      { name: 'Stock In', value: totalIn, color: '#0f172a' }, // Dark Slate (Brand)
      { name: 'Stock Out', value: totalOut, color: '#64748b' }, // Slate
      { name: 'Damaged', value: damaged, color: '#ef4444' }, // Red
      { name: 'Low Stock', value: lowStock, color: '#cbd5e1' }, // Light Slate
    ];
  };

  const DONUT_DATA = calculateDonutData();
  const totalDonutValue = DONUT_DATA.reduce((sum, item) => sum + item.value, 0);
  const donutPercentage = totalDonutValue > 0 
    ? Math.round((DONUT_DATA[0].value / totalDonutValue) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-lg font-bold text-slate-800">Flow Analytics</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Movement of goods over time</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a]"></span> In
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]"></span> Out
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> Damaged
                    </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors">
                    This Year <ChevronDown className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
        <div className="h-[280px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.length > 0 ? chartData : []} barGap={8}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                        dy={12}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                        domain={[0, 'auto']}
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
                    <Bar dataKey="in" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: '#1e293b' }} />
                    <Bar dataKey="out" fill="#64748b" radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: '#475569' }} />
                    <Bar dataKey="damaged" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} activeBar={{ fill: '#dc2626' }} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col">
         <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-lg font-bold text-slate-800">Stock Distribution</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Current inventory status</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
            </button>
         </div>
         
         <div className="flex-1 min-h-[250px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
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
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Inflow</span>
                <span className="text-3xl font-bold text-slate-800 tracking-tight">{donutPercentage}%</span>
            </div>
         </div>
         
         <div className="grid grid-cols-2 gap-4 mt-2">
             {DONUT_DATA.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                     <span className="text-xs font-medium text-slate-600">{item.name}</span>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};
