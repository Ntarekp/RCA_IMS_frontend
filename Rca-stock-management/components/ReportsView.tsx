import React, { useState, useEffect } from 'react';
import { 
    FileSpreadsheet, 
    FileText, 
    Calendar as CalendarIcon, 
    Download, 
    Filter, 
    Loader2, 
    Clock, 
    CalendarClock,
    ArrowRight, 
    Eye,
    ChevronDown,
    Check,
    CalendarDays,
    BarChart,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    History,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { generateCsvReport, generatePdfReport, downloadReportById, ReportType } from '../api/services/reportService';
import { DateRangePicker } from './DateRangePicker';
import { useItems } from '../hooks/useItems';
import { useReports } from '../hooks/useReports';
import { SystemReport } from '../types';

import { ScheduledReportModal } from './ScheduledReportModal';

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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const { items } = useItems();
  const { reportHistory, addReportToHistory } = useReports();
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Reset to first page when a new report is added
  useEffect(() => {
      setCurrentPage(1);
  }, [reportHistory.length]);

  const handleGenerate = async (
    overrideType?: ReportType, 
    overrideRange?: {startDate: string, endDate: string},
    overrideFormat?: 'PDF' | 'CSV',
    overrideItemId?: string,
    action: 'download' | 'view' = 'download',
    overrideTitle?: string
  ) => {
    setIsGenerating(true);
    const typeToUse = overrideType || reportType;
    const rangeToUse = overrideRange || dateRange;
    const formatToUse = overrideFormat || format;
    const itemIdToUse = overrideItemId !== undefined ? overrideItemId : selectedItemId;
    
    let defaultTitle = `${typeToUse.charAt(0).toUpperCase() + typeToUse.slice(1).replace('-', ' ')} Report`;
    if (typeToUse === 'transactions' && !overrideRange) {
        defaultTitle = "Complete Transaction History";
    }

    const titleToUse = overrideTitle || defaultTitle;
    
    // Create a pending report entry
    const reportId = Math.random().toString(36).substr(2, 9);
    const newReport: SystemReport = {
        id: reportId,
        title: titleToUse,
        generatedDate: new Date().toLocaleDateString(),
        type: typeToUse.toUpperCase() as any,
        format: formatToUse,
        status: 'PROCESSING',
        size: '0 KB',
        params: {
            reportType: typeToUse,
            dateRange: rangeToUse,
            itemId: itemIdToUse
        }
    };
    addReportToHistory(newReport);

    try {
      const itemId = itemIdToUse ? parseInt(itemIdToUse) : undefined;
      const range = (typeToUse === 'stock-in' || typeToUse === 'stock-out' || typeToUse === 'transactions') 
        ? rangeToUse 
        : undefined;

      let blob: Blob;
      if (formatToUse === 'CSV') {
        blob = await generateCsvReport(typeToUse, itemId, range, false, titleToUse); // Pass false to prevent auto-download
      } else {
        blob = await generatePdfReport(typeToUse, itemId, range, false, titleToUse); // Pass false to prevent auto-download
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

      // Handle action
      const url = window.URL.createObjectURL(blob);
      if (action === 'view') {
          window.open(url, '_blank');
      } else {
          const link = document.createElement('a');
          link.href = url;
          const extension = formatToUse === 'CSV' ? 'xlsx' : 'pdf';
          
          const now = new Date();
          const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
          
          let filename = `${typeToUse}_report_${timestamp}.${extension}`;
          
          if (itemId) {
              const itemName = items.find(i => i.id === itemIdToUse)?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
              if (itemName) {
                  filename = `${typeToUse}_${itemName}_${timestamp}.${extension}`;
              }
          }
          
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
      }
      
      // Cleanup after a delay to ensure view/download works
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    } catch (error) {
      console.error('Failed to generate report:', error);
      const failedReport: SystemReport = { ...newReport, status: 'FAILED' }; 
      addReportToHistory(failedReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleViewReport = async (report: SystemReport) => {
    if (!report.params) return;
    
    // For view, we open in new tab (browser handles PDF/CSV view/download)
    await handleGenerate(
        report.params.reportType as ReportType,
        report.params.dateRange,
        report.format,
        report.params.itemId,
        'view'
    );
  };

  const handleDownloadReport = async (report: SystemReport) => {
    try {
        if (report.status === 'READY') {
             if (report.params && Object.keys(report.params).length > 0 && report.params.reportType) {
                 // Re-generate using stored params
                 const { reportType, dateRange, itemId } = report.params;
                 // We need to cast reportType string to ReportType
                 const type = (reportType.toLowerCase()) as ReportType;
                 
                 if (report.format === 'PDF') {
                     await generatePdfReport(type, itemId ? parseInt(itemId) : undefined, dateRange, true, report.title);
                 } else {
                     await generateCsvReport(type, itemId ? parseInt(itemId) : undefined, dateRange, true, report.title);
                 }
             } else if (report.id) {
                 // Download by ID from backend
                 const extension = report.format === 'PDF' ? 'pdf' : 'xlsx';
                 // Clean filename
                 const filename = `${report.title.replace(/\s+/g, '_')}.${extension}`;
                 await downloadReportById(report.id, filename);
             } else {
                 alert("Cannot re-download this report. Please generate a new one.");
             }
        }
    } catch (error) {
        console.error("Failed to download report", error);
        alert("Failed to download report. The file may have been deleted.");
    }
  };

  const generateQuickReport = (type: 'monthly' | 'weekly' | 'stock-in' | 'stock-out') => {
      const end = new Date();
      const start = new Date();
      
      if (type === 'monthly') {
          start.setMonth(start.getMonth() - 1);
          handleGenerate(
              'transactions', 
              { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }, 
              undefined, 
              undefined, 
              'download', 
              'Monthly Stock Report'
          );
      } else if (type === 'weekly') {
          start.setDate(start.getDate() - 7);
          handleGenerate(
              'transactions', 
              { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }, 
              undefined, 
              undefined, 
              'download', 
              'Weekly Stock Report'
          );
      } else if (type === 'stock-in') {
          handleGenerate('stock-in', undefined, undefined, undefined, 'download', 'Stock In Report');
      } else if (type === 'stock-out') {
          handleGenerate('stock-out', undefined, undefined, undefined, 'download', 'Stock Out Report');
      }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      {!showAllHistory && (
      <>
      {/* Header Section */}
      <div className="flex flex-col gap-2 pb-2">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Stock Report</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Generate and export detailed inventory reports</p>
            </div>
            <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
            >
                <CalendarClock className="w-4 h-4" />
                <span className="font-medium">Schedule Reports</span>
            </button>
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

          {/* Professional Tools Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Master Inventory List</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Comprehensive real-time status of all items</p>
                    </div>
                </div>
                <div className="mt-auto pt-4">
                    <button 
                        onClick={() => handleGenerate('balance', undefined, 'CSV')}
                        className="w-full py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                    >
                        Export to Excel
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Stock Card (Bin Card)</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Detailed FIFO ledger for specific items</p>
                    </div>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                    <div className="relative flex-1 group">
                        <select 
                            id="stock-card-select"
                            className="w-full appearance-none py-2 pl-3 pr-8 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-300 transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
                            defaultValue=""
                        >
                            <option value="" disabled>Select Item...</option>
                            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                    </div>
                    <button 
                        onClick={() => {
                            const select = document.getElementById('stock-card-select') as HTMLSelectElement;
                            const itemId = select.value;
                            if (!itemId) return alert('Please select an item');
                            handleGenerate('transactions', undefined, 'CSV', itemId);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10"
                    >
                        Export
                    </button>
                </div>
            </div>
          </div>

      {/* Generate Report Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 flex flex-col">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-xl">
                      Generate Report
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create custom report based on your needs</p>
              </div>
              <DateRangePicker 
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  onChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
              />
          </div>

          <div className="flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Report Type & Filter */}
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Report Type</label>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 pointer-events-none">
                                <FileText className="w-4 h-4" />
                            </div>
                            <select 
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value as ReportType)}
                                className="w-full appearance-none pl-12 pr-10 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
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
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 pointer-events-none">
                                <Filter className="w-4 h-4" />
                            </div>
                            <select 
                                value={selectedItemId}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                                className="w-full appearance-none pl-12 pr-10 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 dark:text-slate-200 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 transition-all shadow-sm hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
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

                  {/* Right Column: Date & Format */}
                  <div className="space-y-4">
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
      </>
      )}

      {/* Recent Reports Section */}
      <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden ${showAllHistory ? 'min-h-[80vh]' : ''}`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">
                  {showAllHistory ? 'All Generated Reports' : 'Generated Reports History'}
              </h2>
              <button 
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                  {showAllHistory ? 'Back to Generator' : 'View All'}
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
                        {[...reportHistory].reverse().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report) => (
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
                                    {report.status === 'PROCESSING' ? (
                                        <span className="text-xs text-slate-400 italic">
                                            Generating...
                                        </span>
                                    ) : report.params ? (
                                        <>
                                            <button 
                                                onClick={() => handleViewReport(report)}
                                                className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="View Report"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadReport(report)}
                                                className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                                title="Download Report"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic" title="Report expired and cannot be regenerated">
                                            Expired
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                {Math.ceil(reportHistory.length / itemsPerPage) > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, reportHistory.length)} of {reportHistory.length} reports
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Page {currentPage} of {Math.ceil(reportHistory.length / itemsPerPage)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(reportHistory.length / itemsPerPage), p + 1))}
                                disabled={currentPage === Math.ceil(reportHistory.length / itemsPerPage)}
                                className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>
                    </div>
                )}
              </div>
          )}
      </div>

      <ScheduledReportModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
      />
    </div>
  );
};
