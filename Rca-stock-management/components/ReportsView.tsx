import React, { useState, useEffect } from 'react';
import {
    FileSpreadsheet,
    FileText,
    Download,
    Filter,
    Loader2,
    TrendingDown,
    Package,
    History,
    ArrowDownCircle,
    ArrowUpCircle,
    Users,
    Calendar,
    BarChart3,
    AlertTriangle
} from 'lucide-react';
import { generateExcelReport, generatePdfReport, ReportType, ReportFilters, previewReportData } from '../api/services/reportService';
import { useItems } from '../hooks/useItems';

interface ReportsViewProps {
    onGenerateReport: () => void;
}

interface ReportTypeConfig {
    value: ReportType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    requiresDateRange: boolean;
    requiresItemSelection: boolean;
    features: string[];
}

const REPORT_TYPES: ReportTypeConfig[] = [
    {
        value: 'transactions',
        label: 'Complete Transaction History',
        description: 'Full chronological log of all stock movements with running balances',
        icon: <History className="w-5 h-5" />,
        color: 'blue',
        requiresDateRange: true,
        requiresItemSelection: false,
        features: ['All IN/OUT transactions', 'Running balance', 'Supplier details', 'Date range filtering']
    },
    {
        value: 'balance',
        label: 'Current Stock Balance',
        description: 'Real-time overview of all items and their current quantities',
        icon: <Package className="w-5 h-5" />,
        color: 'emerald',
        requiresDateRange: false,
        requiresItemSelection: false,
        features: ['Current stock levels', 'Item details', 'Unit information', 'Value summary']
    },
    {
        value: 'low-stock',
        label: 'Low Stock Alert',
        description: 'Items below minimum threshold requiring immediate attention',
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'amber',
        requiresDateRange: false,
        requiresItemSelection: false,
        features: ['Below minimum items', 'Reorder recommendations', 'Priority sorting', 'Action items']
    },
    {
        value: 'stock-in',
        label: 'Stock IN Report',
        description: 'All incoming stock transactions with supplier information',
        icon: <ArrowDownCircle className="w-5 h-5" />,
        color: 'green',
        requiresDateRange: true,
        requiresItemSelection: false,
        features: ['Incoming transactions', 'Supplier tracking', 'Purchase records', 'Quantity analysis']
    },
    {
        value: 'stock-out',
        label: 'Stock OUT Report',
        description: 'All outgoing stock transactions and distribution records',
        icon: <ArrowUpCircle className="w-5 h-5" />,
        color: 'red',
        requiresDateRange: true,
        requiresItemSelection: false,
        features: ['Outgoing transactions', 'Usage tracking', 'Distribution records', 'Consumption analysis']
    },
    {
        value: 'supplier-summary',
        label: 'Supplier Summary',
        description: 'Aggregate view of all transactions grouped by supplier',
        icon: <Users className="w-5 h-5" />,
        color: 'purple',
        requiresDateRange: true,
        requiresItemSelection: false,
        features: ['Supplier grouping', 'Transaction totals', 'Item breakdown', 'Performance metrics']
    },
    {
        value: 'monthly-summary',
        label: 'Monthly Summary',
        description: 'Month-by-month analysis of stock movements and trends',
        icon: <Calendar className="w-5 h-5" />,
        color: 'indigo',
        requiresDateRange: true,
        requiresItemSelection: false,
        features: ['Monthly aggregation', 'Trend analysis', 'Comparative data', 'Growth metrics']
    },
    {
        value: 'item-history',
        label: 'Item History',
        description: 'Complete transaction history for a specific item',
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'cyan',
        requiresDateRange: true,
        requiresItemSelection: true,
        features: ['Single item focus', 'Full transaction log', 'Usage patterns', 'Stock trends']
    }
];

export const ReportsView: React.FC<ReportsViewProps> = ({ onGenerateReport }) => {
    const [selectedReport, setSelectedReport] = useState<ReportTypeConfig>(REPORT_TYPES[0]);
    const [format, setFormat] = useState<'PDF' | 'EXCEL'>('EXCEL');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const { items } = useItems();

    // Load preview data when report type changes
    useEffect(() => {
        loadPreviewData();
    }, [selectedReport.value]);

    const loadPreviewData = async () => {
        setIsLoadingPreview(true);
        try {
            const data = await previewReportData(selectedReport.value);
            setPreviewData(data);
        } catch (error) {
            console.error('Failed to load preview:', error);
            setPreviewData(null);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const buildFilters = (): ReportFilters => {
        const filters: ReportFilters = {};

        if (selectedReport.requiresDateRange) {
            filters.startDate = dateRange.startDate;
            filters.endDate = dateRange.endDate;
        }

        if (selectedReport.requiresItemSelection && selectedItemId) {
            filters.itemId = parseInt(selectedItemId);
        }

        return filters;
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const filters = buildFilters();

            if (format === 'EXCEL') {
                await generateExcelReport(selectedReport.value, filters);
            } else {
                await generatePdfReport(selectedReport.value, filters);
            }

            onGenerateReport();
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const getColorClasses = (color: string) => {
        const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
            amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
            green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', hover: 'hover:bg-green-100' },
            red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', hover: 'hover:bg-red-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', hover: 'hover:bg-cyan-100' },
        };
        return colorMap[color] || colorMap.blue;
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Generate comprehensive inventory reports in multiple formats</p>
                </div>
            </div>

            {/* Report Type Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {REPORT_TYPES.map((report) => {
                    const colors = getColorClasses(report.color);
                    const isSelected = selectedReport.value === report.value;

                    return (
                        <button
                            key={report.value}
                            onClick={() => setSelectedReport(report)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                    ? `${colors.bg} ${colors.border} ring-2 ring-${report.color}-500/20 shadow-sm`
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${isSelected ? colors.bg : 'bg-slate-50'} ${isSelected ? colors.text : 'text-slate-600'}`}>
                                    {report.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-sm mb-1 ${isSelected ? colors.text : 'text-slate-800'}`}>
                                        {report.label}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {report.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-600" />
                            Report Configuration
                        </h2>

                        <div className="space-y-4">
                            {/* Format Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Export Format</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setFormat('EXCEL')}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            format === 'EXCEL'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-2 ring-emerald-500/20'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <FileSpreadsheet className="w-4 h-4" />
                                        Excel
                                    </button>
                                    <button
                                        onClick={() => setFormat('PDF')}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            format === 'PDF'
                                                ? 'bg-red-50 text-red-700 border border-red-200 ring-2 ring-red-500/20'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </button>
                                </div>
                            </div>

                            {/* Date Range - Show only if required */}
                            {selectedReport.requiresDateRange && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <label className="block text-sm font-medium text-slate-700">Date Range</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">From</label>
                                            <input
                                                type="date"
                                                value={dateRange.startDate}
                                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">To</label>
                                            <input
                                                type="date"
                                                value={dateRange.endDate}
                                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Item Selection - Show only if required */}
                            {selectedReport.requiresItemSelection && (
                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                    <label className="block text-sm font-medium text-slate-700">Select Item</label>
                                    <select
                                        value={selectedItemId}
                                        onChange={(e) => setSelectedItemId(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    >
                                        <option value="">All Items</option>
                                        {items?.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || (selectedReport.requiresItemSelection && !selectedItemId)}
                                className="w-full mt-6 bg-[#1e293b] text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating Report...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download {format}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview / Info Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 min-h-[500px]">
                        {isLoadingPreview ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Report Header */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${getColorClasses(selectedReport.color).bg}`}>
                                        <div className={getColorClasses(selectedReport.color).text}>
                                            {selectedReport.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{selectedReport.label}</h3>
                                        <p className="text-slate-600 text-sm">{selectedReport.description}</p>
                                    </div>
                                </div>

                                {/* Report Features */}
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-700 mb-3">Report Includes:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {selectedReport.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Preview Stats */}
                                {previewData && (
                                    <div className="border-t border-slate-100 pt-6">
                                        <h4 className="text-sm font-bold text-slate-700 mb-3">Preview Statistics:</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-xs font-medium text-slate-500 mb-1">Total Records</div>
                                                <div className="font-bold text-slate-800 text-lg">
                                                    {Array.isArray(previewData) ? previewData.length : '—'}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-xs font-medium text-slate-500 mb-1">Format</div>
                                                <div className="font-bold text-slate-800 text-lg">
                                                    {format}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-xs font-medium text-slate-500 mb-1">Date Range</div>
                                                <div className="font-bold text-slate-800 text-sm">
                                                    {selectedReport.requiresDateRange ? `${dateRange.startDate} to ${dateRange.endDate}` : 'Current'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Requirements Notice */}
                                {(selectedReport.requiresItemSelection && !selectedItemId) && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-amber-800">
                                                <strong className="font-semibold">Item Selection Required:</strong> Please select an item from the configuration panel to generate this report.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};