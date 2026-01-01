import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Sparkles, 
  Plus, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Download,
  Search,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronDown,
  Eye,
  X
} from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useItems } from '../hooks/useItems';
import { generateCsvReport, generatePdfReport } from '../api/services/reportService';

interface ReportsViewProps {
  onGenerateReport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onGenerateReport }) => {
  const { balanceReport, loading, error, refetch } = useReports();
  const { items } = useItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Date range state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Selected item state
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showItemSelector, setShowItemSelector] = useState(false);

  // Report type state
  const [reportType, setReportType] = useState<'balance' | 'low-stock'>('balance');

  // Data section state
  const [dataSection, setDataSection] = useState<'all' | 'items' | 'categories'>('all');

  // Dropdown menu state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Modal state for viewing reports
  const [viewingReport, setViewingReport] = useState<any | null>(null);
  const [reportContent, setReportContent] = useState<string>('');

  // Initialize dates to current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Convert balance report to report format
  const reports = balanceReport.map((item, index) => ({
    id: item.itemId.toString(),
    title: `${item.itemName} Stock Report`,
    type: item.isLowStock ? 'LOW_STOCK' : 'STOCK',
    generatedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    size: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 9) + 1} MB`,
    status: 'READY',
    format: index % 2 === 0 ? 'PDF' : 'CSV'
  }));

  // Filter reports by search term
  const filteredReports = searchTerm 
    ? reports.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : reports;

  // Handle report generation
  const handleGenerateReport = async (format: 'pdf' | 'csv') => {
    try {
      setGeneratingReport(format);

      // Prepare date range if both dates are set
      const dateRange = startDate && endDate 
        ? { startDate, endDate } 
        : undefined;

      // Call the appropriate report generation function
      if (format === 'pdf') {
        await generatePdfReport(reportType, selectedItemId || undefined, dateRange);
      } else {
        await generateCsvReport(reportType, selectedItemId || undefined, dateRange);
      }

      // Refresh the reports list
      await refetch();

      // Call the parent component's onGenerateReport function
      onGenerateReport();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingReport(null);
    }
  };

  // Handle quick report generation
  const handleQuickReport = async (type: 'stock-summary' | 'audit-logs' | 'ai-insights', format: 'pdf' | 'csv' = 'pdf') => {
    try {
      setGeneratingReport(format);

      // Set appropriate report type based on quick report selection
      let quickReportType: 'balance' | 'low-stock' = 'balance';

      switch (type) {
        case 'stock-summary':
          quickReportType = 'balance';
          break;
        case 'audit-logs':
          quickReportType = 'balance'; // Could be a different type in the future
          break;
        case 'ai-insights':
          quickReportType = 'low-stock';
          break;
      }

      // Generate the report
      if (format === 'pdf') {
        await generatePdfReport(quickReportType);
      } else {
        await generateCsvReport(quickReportType);
      }

      // Refresh and notify
      await refetch();
      onGenerateReport();
    } catch (error) {
      console.error('Failed to generate quick report:', error);
    } finally {
      setGeneratingReport(null);
    }
  };

  // Calculate summary metrics
  const totalReports = reports.length;
  const pdfReports = reports.filter(r => r.format === 'PDF').length;
  const csvReports = reports.filter(r => r.format === 'CSV').length;
  const lowStockReports = reports.filter(r => r.type === 'LOW_STOCK').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports Center</h1>
          <p className="text-xs text-gray-400 mt-1">Generate, manage and analyze system reports</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => handleGenerateReport('pdf')}
              disabled={generatingReport !== null}
              className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingReport === 'pdf' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate PDF</span>
                </>
              )}
            </button>
            <button 
              onClick={() => handleGenerateReport('csv')}
              disabled={generatingReport !== null}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingReport === 'csv' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating CSV...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Generate CSV</span>
                </>
              )}
            </button>
          </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Reports', value: totalReports, color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { title: 'PDF Reports', value: pdfReports, color: 'bg-red-50 text-red-600 border-red-100' },
          { title: 'CSV Reports', value: csvReports, color: 'bg-green-50 text-green-600 border-green-100' },
          { title: 'Low Stock Reports', value: lowStockReports, color: 'bg-amber-50 text-amber-600 border-amber-100' },
        ].map((card, idx) => (
          <div key={idx} className={`${card.color} rounded-xl border p-4 text-center`}>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs font-medium mt-1">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Report Generation Options */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Report Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Item</label>
            <div className="relative">
              <select
                value={selectedItemId || ''}
                onChange={(e) => setSelectedItemId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
              >
                <option value="">All Items</option>
                {items && items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedItemId ? 'Generating report for selected item' : 'Generating report for all items'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Report Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'balance' | 'low-stock')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
              >
                <option value="balance">Balance Report</option>
                <option value="low-stock">Low Stock Report</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {reportType === 'balance' ? 'Complete inventory status report' : 'Items that need restocking'}
            </p>
          </div>

          {/* Data Section Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Section</label>
            <div className="relative">
              <select
                value={dataSection}
                onChange={(e) => setDataSection(e.target.value as 'all' | 'items' | 'categories')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
              >
                <option value="all">All Data</option>
                <option value="items">Items Only</option>
                <option value="categories">Categories Only</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select which data sections to include in the report
            </p>
          </div>
        </div>
      </div>

      {/* Quick Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            icon: FileSpreadsheet, 
            title: 'Stock Summary', 
            desc: 'Monthly inventory status', 
            color: 'text-blue-600', 
            bg: 'bg-blue-50', 
            hover: 'group-hover:bg-blue-600',
            type: 'stock-summary' as const,
            format: 'pdf' as const
          },
          { 
            icon: FileText, 
            title: 'Audit Logs', 
            desc: 'System activity tracking', 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50', 
            hover: 'group-hover:bg-emerald-600',
            type: 'audit-logs' as const,
            format: 'csv' as const
          },
          { 
            icon: Sparkles, 
            title: 'AI Insights', 
            desc: 'Predictive analysis', 
            color: 'text-purple-600', 
            bg: 'bg-purple-50', 
            hover: 'group-hover:bg-purple-600',
            type: 'ai-insights' as const,
            format: 'pdf' as const
          },
        ].map((card, idx) => (
          <div 
            key={idx} 
            onClick={() => handleQuickReport(card.type, card.format)} 
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className={`${card.bg} ${card.color} p-4 rounded-xl ${card.hover} group-hover:text-white transition-colors`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{card.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              card.format === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {card.format.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <h3 className="font-semibold text-gray-700 whitespace-nowrap">Report History</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <button className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg text-gray-500 transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Report Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date Generated</th>
                <th className="px-6 py-4 font-medium">Size</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-gray-50/30">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 opacity-50 animate-spin" />
                      <p>Loading reports...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-400 bg-red-50/30">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <p>Error loading reports. Please try again.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="bg-white hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${report.format === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {report.format === 'PDF' ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{report.title}</p>
                          <p className="text-xs text-gray-400 uppercase">{report.format}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 py-1 px-2.5 rounded-md text-xs font-medium border border-gray-200">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {report.generatedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{report.size}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium bg-emerald-50 py-1 px-2.5 rounded-full w-fit border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 
                        Ready
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            const format = report.format.toLowerCase() as 'pdf' | 'csv';
                            const reportType = report.type === 'LOW_STOCK' ? 'low-stock' : 'balance';
                            if (format === 'pdf') {
                              generatePdfReport(reportType, parseInt(report.id));
                            } else {
                              generateCsvReport(reportType, parseInt(report.id));
                            }
                          }}
                          className={`${
                            report.format === 'PDF' 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          } px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium`}
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-xs">Download {report.format}</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-gray-50/30">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <p>No reports found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
            <span>Showing {filteredReports.length} results</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};
