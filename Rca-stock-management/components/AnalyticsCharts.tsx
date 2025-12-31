import React, { useEffect, useState } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { getChartData } from '../api/services/dashboardService';

export const AnalyticsCharts: React.FC = () => {
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const year = new Date().getFullYear();
                const data = await getChartData(year);
                setTrendData(data);
            } catch (err) {
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Example: Radar chart data could be derived from trendData or fetched from another endpoint
    // For now, just map trendData to a radar format for demo
    const radarData = trendData.map((item: any) => ({
        subject: item.month || item.name,
        A: item.consumption || item.in || 0,
        fullMark: 150
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Consumption Trend Area Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Consumption vs Restock</h3>
                        <p className="text-sm text-gray-400">6 Month historical analysis</p>
                </div>
                <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#1e293b" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorRestock" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                                        <Tooltip 
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="consumption" stroke="#1e293b" fillOpacity={1} fill="url(#colorConsumption)" />
                                        <Area type="monotone" dataKey="restock" stroke="#10b981" fillOpacity={1} fill="url(#colorRestock)" />
                                </AreaChart>
                        </ResponsiveContainer>
                </div>
            </div>

            {/* Category Radar Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Category Balance</h3>
                        <p className="text-sm text-gray-400">Stock distribution analysis</p>
                 </div>
         
                 <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                        <Radar
                                                name="Stock Level"
                                                dataKey="A"
                                                stroke="#2563eb"
                                                fill="#2563eb"
                                                fillOpacity={0.6}
                                        />
                                        <Legend />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </RadarChart>
                        </ResponsiveContainer>
                 </div>
            </div>
        </div>
    );
};
