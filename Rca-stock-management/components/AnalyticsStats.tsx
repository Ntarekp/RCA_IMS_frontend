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
                console.error('Failed to load analytics stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-32 bg-gray-50 rounded-xl animate-pulse"></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Stock Items (from Dashboard) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500">Total Inventory</span>
                        <div className="bg-slate-100 text-slate-600 p-2 rounded-full">
                                <Package className="w-4 h-4" />
                        </div>
                </div>
                <div>
                        <div className="text-2xl font-bold text-gray-800">{dashboardMetrics?.total || 0}</div>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                <span>Active items in stock</span>
                        </div>
                </div>
            </div>

            {/* Consumption Rate */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500">Avg. Consumption</span>
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-full">
                                <Activity className="w-4 h-4" />
                        </div>
                </div>
                <div>
                        <div className="text-2xl font-bold text-gray-800">{analytics?.consumptionRate || 0} <span className="text-sm font-normal text-gray-400">units/mo</span></div>
                        <div className="flex items-center text-xs text-blue-500 mt-1">
                                <span>Based on last 6 months</span>
                        </div>
                </div>
            </div>

            {/* Waste Ratio */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500">Wastage Ratio</span>
                        <div className="bg-rose-50 text-rose-600 p-2 rounded-full">
                                <XCircle className="w-4 h-4" />
                        </div>
                </div>
                <div>
                        <div className="text-2xl font-bold text-gray-800">{analytics?.wastageRatio || 0}%</div>
                        <div className="flex items-center text-xs text-rose-500 mt-1">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                <span>Loss vs Total Out</span>
                        </div>
                </div>
            </div>

            {/* Restock Frequency */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500">Restock Frequency</span>
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full">
                                <RefreshCw className="w-4 h-4" />
                        </div>
                </div>
                <div>
                        <div className="text-2xl font-bold text-gray-800">Every {analytics?.restockFrequency || 0} Days</div>
                        <div className="flex items-center text-xs text-emerald-500 mt-1">
                                <span>Average cycle</span>
                        </div>
                </div>
            </div>
        </div>
    );
};
