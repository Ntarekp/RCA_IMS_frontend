import React, { useState, useEffect } from 'react';
import { 
    FileSpreadsheet, 
    FileText, 
    Calendar as CalendarIcon, 
    Download, 
    Filter, 
    Loader2, 
    Clock, 
    ArrowRight, 
    Eye,
    ChevronDown,
    Check,
    CalendarDays,
    BarChart,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle
} from 'lucide-react';
import { generateCsvReport, generatePdfReport, ReportType } from '../api/services/reportService';
import { useItems } from '../hooks/useItems';
import { useReports } from '../hooks/useReports';
import { SystemReport } from '../types';

interface ReportsViewProps {
  onGenerateReport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onGenerateReport }) => {
  const [reportType, setReportType] = useState<ReportType>('transactions');
  const [format, setFormat] = useState<'PDF' | 'CSV'>('CSV');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { items } = useItems();
  const { reportHistory, addReportToHistory } = useReports();

  const handleGenerate = async (overrideType?: ReportType, overrideRange?: {startDate: string, endDate: string}) => {
    setIsGenerating(true);
    const typeToUse = overrideType || reportType;
    const rangeToUse = overrideRange || dateRange;
    
    // Create a pending report entry
    const reportId = Math.random().toString(36).substr(2, 9);
    const newReport: SystemReport = {
        id: reportId,
        title: `${typeToUse.charAt(0).toUpperCase() + typeToUse.slice(1).replace('-', ' ')} Report`,
        generatedDate: new Date().toLocaleDateString(),
        type: typeToUse.toUpperCase() as any,
        format: format,
        status: 'PROCESSING',
        size: '0 KB'
    };
    addReportToHistory(newReport);

    try {
      const itemId = selectedItemId ? parseInt(selectedItemId) : undefined;
      const range = (typeToUse === 'stock-in' || typeToUse === 'stock-out' || typeToUse === 'transactions') 
        ? rangeToUse 
        : undefined;

      let blob: Blob;
      if (format === 'CSV') {
        blob = await generateCsvReport(typeToUse, itemId, range, false); // Pass false to prevent auto-download
      } else {
        blob = await generatePdfReport(typeToUse, itemId, range, false); // Pass false to prevent auto-download
      }

      // Calculate size
      const sizeInBytes = blob.size;
      const size = sizeInBytes > 1024 * 1024 
        ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB` 
        : `${(sizeInBytes / 1024).toFixed(2)} KB`;

      const updatedReport: SystemReport & { blob?: Blob } = { 
          ...newReport, 
          status: 'READY', 
          size,
          // @ts-ignore
          blob: blob 
      };
      
      addReportToHistory(updatedReport);

      // Auto download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'CSV' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `${typeToUse}_report_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate report:', error);
      const failedReport: SystemReport = { ...newReport, status: 'FAILED' }; 
      addReportToHistory(failedReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuickReport = (type: 'monthly' | 'weekly' | 'stock-in' | 'stock-out') => {
      const end = new Date();
      const start = new Date();
      
      if (type === 'monthly') {
          start.setMonth(start.getMonth() - 1);
          handleGenerate('transactions', { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
      } else if (type === 'weekly') {
          start.setDate(start.getDate() - 7);
          handleGenerate('transactions', { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
      } else if (type === 'stock-in') {
          handleGenerate('stock-in');
      } else if (type === 'stock-out') {
          handleGenerate('stock-out');
      }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2 pb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Stock Report</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Generate and export detailed inventory reports</p>
        </div>
        
        {/* Global Date Display */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <CalendarIcon className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick Reports Section */}
      <div>
          <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Quick Reports
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                  onClick={() => generateQuickReport('monthly')}
                  className="flex items-center p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all group text-left gap-4"
              >
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors shrink-0">
                      <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">Monthly Report</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Last 30 days</span>
                  </div>
              </button>

              <button 
                  onClick={() => generateQuickReport('weekly')}
                  className="flex items-center p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group text-left gap-4"
              >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors shrink-0">
                      <BarChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">Weekly Report</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Last 7 days</span>
                  </div>
              </button>

              <button 
                  onClick={() => generateQuickReport('stock-in')}
                  className="flex items-center p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all group text-left gap-4"
              >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors shrink-0">
                      <ArrowDownRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">Stock In</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Incoming Items</span>
                  </div>
              </button>

              <button 
                  onClick={() => generateQuickReport('stock-out')}
                  className="flex items-center p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500 hover:shadow-md transition-all group text-left gap-4"
              >
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors shrink-0">
                      <ArrowUpRight className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">Stock Out</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Outgoing Items</span>
                  </div>
              </button>
          </div>
      </div>

      {/* Generate Report Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 flex flex-col">
          <div className="mb-8">
              <h2 className="font-bold text-slate-800 dark:text-white text-xl">
                  Generate Report
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create custom report based on your needs</p>
          </div>

          <div className="flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Report Type & Filter */}
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Report Type</label>
                          <div className="relative">
                              <select 
                                  value={reportType}
                                  onChange={(e) => setReportType(e.target.value as ReportType)}
                                  className="w-full appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-700 border border-[#E5E7EB] dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700 dark:text-slate-200"
                              >
                                  <option value="transactions">Detailed Transactions</option>
                                  <option value="balance">Current Stock Balance</option>
                                  <option value="low-stock">Low Stock Alert</option>
                                  <option value="suppliers">Active Suppliers</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Filter Items</label>
                          <div className="relative">
                              <select 
                                  value={selectedItemId}
                                  onChange={(e) => setSelectedItemId(e.target.value)}
                                  className="w-full appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-700 border border-[#E5E7EB] dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700 dark:text-slate-200 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
                                  disabled={reportType !== 'transactions'}
                              >
                                  <option value="">All Items</option>
                                  {items.map((item) => (
                                      <option key={item.id} value={item.id}>{item.name}</option>
                                  ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                      </div>
                  </div>

                  {/* Report Format */}
                  <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Report Format</label>
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                              onClick={() => setFormat('CSV')}
                              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border h-full ${
                              format === 'CSV' 
                                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500/20' 
                                  : 'bg-white dark:bg-slate-700 border-[#E5E7EB] dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                              }`}
                          >
                              <FileSpreadsheet className="w-6 h-6" />
                              <span className="font-bold">Excel</span>
                          </button>
                          <button 
                              onClick={() => setFormat('PDF')}
                              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border h-full ${
                              format === 'PDF' 
                                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 ring-2 ring-red-500/20' 
                                  : 'bg-white dark:bg-slate-700 border-[#E5E7EB] dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                              }`}
                          >
                              <FileText className="w-6 h-6" />
                              <span className="font-bold">PDF</span>
                          </button>
                      </div>
                  </div>
              </div>

              {/* Date Range - Horizontal Layout */}
              <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Select Date Range</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="space-y-1 flex-1 sm:flex-initial">
                          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">From</label>
                          <div className="relative group">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 pointer-events-none">
                                  <CalendarIcon className="w-4 h-4" />
                              </div>
                              <input 
                                  type="date" 
                                  value={dateRange.startDate}
                                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                  className="w-full sm:w-auto pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
                              />
                          </div>
                      </div>
                      <div className="hidden sm:flex pb-3 text-slate-300 items-center justify-center px-2">
                          <ArrowRight className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 flex-1 sm:flex-initial">
                          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To</label>
                          <div className="relative group">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 pointer-events-none">
                                  <CalendarIcon className="w-4 h-4" />
                              </div>
                              <input 
                                  type="date" 
                                  value={dateRange.endDate}
                                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                  className="w-full sm:w-auto pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="pt-6 flex justify-center">
              <button 
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="bg-[#1e293b] text-white rounded-xl py-4 px-12 font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed text-sm flex items-center gap-3"
              >
                  {isGenerating ? (
                      <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                      </>
                  ) : (
                      <>
                          <Download className="w-5 h-5" />
                          Generate Report
                      </>
                  )}
              </button>
          </div>
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">Generated Reports History</h2>
              <button className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  View All
              </button>
          </div>
          
          {reportHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No reports generated yet</p>
                  <p className="text-sm mt-1">Your generated reports will appear here</p>
              </div>
          ) : (
              <div className="bg-white dark:bg-slate-800">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">Report Title</th>
                            <th className="px-6 py-4">Generated Date</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Format</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {reportHistory.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{report.title}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{report.generatedDate}</td>
                                <td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-300">{report.type.toString().replace('-', ' ').toLowerCase()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        report.format === 'PDF' 
                                            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800' 
                                            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                                    }`}>
                                        {report.format}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {report.status === 'PROCESSING' && (
                                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Processing
                                        </span>
                                    )}
                                    {report.status === 'READY' && (
                                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                            <Check className="w-3 h-3" />
                                            Ready
                                        </span>
                                    )}
                                    {report.status === 'FAILED' && (
                                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-medium">
                                            <AlertCircle className="w-3 h-3" />
                                            Failed
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    {/* Since we can't persist blobs, we can't easily view/download old reports without regenerating. 
                                        For now, we'll just show the status. Ideally, we'd have a backend endpoint to fetch old reports by ID. */}
                                    <span className="text-xs text-slate-400 italic">
                                        {report.size}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
          )}
      </div>
    </div>
  );
};
