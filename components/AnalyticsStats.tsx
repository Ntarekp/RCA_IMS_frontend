import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, RefreshCw, Package, XCircle } from 'lucide-react';
import { getAnalyticsSummary, AnalyticsSummary } from '../api/services/analyticsService';
import { getDashboardMetrics } from '../api/services/dashboardService';
import { StockMetricsDTO } from '../api/types';

export const AnalyticsStats: React.FC = () => {
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [dashboardMetrics, setDashboardMetrics] = useState<StockMetricsDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [analyticsData, dashboardData] = await Promise.all([
                    getAnalyticsSummary(),
                    getDashboardMetrics()
                ]);
                setAnalytics(analyticsData);
                setDashboardMetrics(dashboardData);
            } catch (err) {
                if (import.meta.env.DEV) console.error('Failed to load analytics stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-32 bg-gray-50 dark:bg-slate-800 rounded-xl animate-pulse"></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Stock Items (from Dashboard) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Inventory</span>
                        <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-full">
                                <Package className="w-4 h-4" />
                        </div>
                </div>
                <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{dashboardMetrics?.total || 0}</div>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span>Active items in stock</span>
                        </div>
                </div>
            </div>

            {/* Consumption Rate */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Avg. Consumption</span>
                        <div className="bg-slate-100 dark:bg-[#155DFC]/20 text-[#1E293B] dark:text-[#155DFC] p-2 rounded-full">
                                <Activity className="w-4 h-4" />
                        </div>
                </div>
                <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{analytics?.consumptionRate || 0} <span className="text-sm font-normal text-gray-400 dark:text-slate-500">units/mo</span></div>
                        <div className="flex items-center text-xs text-[#1E293B] dark:text-[#155DFC] mt-1">
                                <span>Based on last 6 months</span>
                        </div>
                </div>
            </div>

            {/* Waste Ratio */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Wastage Ratio</span>
                        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-2 rounded-full">
                                <XCircle className="w-4 h-4" />
                        </div>
                </div>
                <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{analytics?.wastageRatio || 0}%</div>
                        <div className="flex items-center text-xs text-rose-500 dark:text-rose-400 mt-1">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                <span>Loss vs Total Out</span>
                        </div>
                </div>
            </div>

            {/* Restock Frequency */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Restock Frequency</span>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-full">
                                <RefreshCw className="w-4 h-4" />
                        </div>
                </div>
                <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">Every {analytics?.restockFrequency || 0} Days</div>
                        <div className="flex items-center text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                                <span>Average cycle</span>
                        </div>
                </div>
            </div>
        </div>
    );
};
