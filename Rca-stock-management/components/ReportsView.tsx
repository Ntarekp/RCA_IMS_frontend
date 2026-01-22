import React, { useState } from 'react';
import { 
    FileText, 
    Calendar as CalendarIcon, 
    Download, 
    ChevronDown,
    BarChart3,
    PieChart,
    LineChart
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
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [dateRangeOption, setDateRangeOption] = useState('This Month');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { items } = useItems();
  const { reportHistory, addReportToHistory } = useReports();

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate report generation based on selected options
    const typeToUse = reportType;
    const reportId = Math.random().toString(36).substr(2, 9);
    
    // Create a pending report entry
    const newReport: SystemReport = {
        id: reportId,
        title: `${dateRangeOption} ${reportType === 'transactions' ? 'All Data' : reportType} Report`,
        generatedDate: new Date().toLocaleDateString(),
        type: 'STOCK', // Generic type
        format: format,
        status: 'PROCESSING',
        size: '0 KB'
    };
    addReportToHistory(newReport);

    try {
      let blob: Blob;
      // Calculate date range based on dateRangeOption
      const end = new Date();
      const start = new Date();
      if (dateRangeOption === 'This Month') {
          start.setDate(1);
      } else if (dateRangeOption === 'Last Month') {
          start.setMonth(start.getMonth() - 1);
          start.setDate(1);
          end.setDate(0); // Last day of previous month
      } else if (dateRangeOption === 'This Year') {
          start.setMonth(0, 1);
      }
      
      const range = { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };

      if (format === 'CSV') {
          blob = await generateCsvReport(typeToUse, undefined, range, false);
      } else {
          blob = await generatePdfReport(typeToUse, undefined, range, false);
      }
      
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
      const ext = format === 'CSV' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `Report_${new Date().toISOString().split('T')[0]}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const quickReport = (type: string) => {
      // Placeholder for quick report logic
      console.log('Generating quick report:', type);
      handleGenerate();
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Stock Report</h1>
        <p className="text-sm text-gray-500 font-medium">Imbonerahamwe rusange y'ububiko</p>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-4">
            <CalendarIcon className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Top Section: Quick Reports & Generate Report */}
      <div className="flex flex-col gap-8">
        
        {/* Quick Reports Section */}
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-gray-500">Quick Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <button 
                    onClick={() => quickReport('monthly')}
                    className="bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col justify-between hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 group h-32"
                >
                    <div className="w-full flex justify-end">
                        <BarChart3 className="w-6 h-6 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-medium text-lg text-left">Monthly Report</span>
                </button>
                <button 
                    onClick={() => quickReport('weekly')}
                    className="bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col justify-between hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 group h-32"
                >
                    <div className="w-full flex justify-end">
                        <PieChart className="w-6 h-6 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-medium text-lg text-left">Weekly Report</span>
                </button>
                <button 
                    onClick={() => quickReport('stock-in')}
                    className="bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col justify-between hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 group h-32"
                >
                    <div className="w-full flex justify-end">
                        <LineChart className="w-6 h-6 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-medium text-lg text-left">Stock In</span>
                </button>
                <button 
                    onClick={() => quickReport('stock-out')}
                    className="bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col justify-between hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 group h-32"
                >
                    <div className="w-full flex justify-end">
                        <FileText className="w-6 h-6 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-medium text-lg text-left">Stock Out</span>
                </button>
            </div>
        </div>

        {/* Generate Report Card */}
        <div className="bg-[#f8f9fc] rounded-[2rem] p-8 flex flex-col justify-center">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[#1e293b]">Generate Report</h2>
                <p className="text-sm text-gray-500 mt-1">Create custom reports based on your requirements</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2 w-full md:w-1/3">
                    <label className="text-sm text-gray-500 font-medium">Date Range</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <select 
                            value={dateRangeOption}
                            onChange={(e) => setDateRangeOption(e.target.value)}
                            className="w-full appearance-none bg-white border-none rounded-xl py-3 pl-10 pr-10 text-gray-700 font-medium shadow-sm focus:ring-2 focus:ring-[#1e293b]/20 outline-none"
                        >
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-500 font-medium">Report Type</label>
                        <div className="relative">
                            <select 
                                value={format}
                                onChange={(e) => setFormat(e.target.value as 'PDF' | 'CSV')}
                                className="w-full appearance-none bg-white border-none rounded-xl py-3 pl-4 pr-10 text-gray-700 font-medium shadow-sm focus:ring-2 focus:ring-[#1e293b]/20 outline-none"
                            >
                                <option value="PDF">PDF Report</option>
                                <option value="CSV">CSV Export</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-500 font-medium">Data Section</label>
                        <div className="relative">
                            <select 
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value as ReportType)}
                                className="w-full appearance-none bg-white border-none rounded-xl py-3 pl-4 pr-10 text-gray-700 font-medium shadow-sm focus:ring-2 focus:ring-[#1e293b]/20 outline-none"
                            >
                                <option value="transactions">All Data</option>
                                <option value="stock-in">Stock In Only</option>
                                <option value="stock-out">Stock Out Only</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-[#1e293b] text-white rounded-xl py-4 px-12 font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Stock Balance Report Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-500">Stock Balance Report</h2>
        <div className="bg-[#f8f9fc] rounded-[2rem] p-6 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left">
                            <th className="pb-4 pl-4 font-bold text-[#1e293b]">Item</th>
                            <th className="pb-4 font-bold text-[#1e293b]">Unit</th>
                            <th className="pb-4 font-bold text-[#1e293b]">Total In</th>
                            <th className="pb-4 font-bold text-[#1e293b]">Total Out</th>
                            <th className="pb-4 font-bold text-[#1e293b]">Damaged</th>
                            <th className="pb-4 font-bold text-[#1e293b]">Min</th>
                            <th className="pb-4 font-bold text-[#1e293b]">Current</th>
                            <th className="pb-4 pr-4 font-bold text-[#1e293b] text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="space-y-2">
                        {items.slice(0, 5).map((item, index) => (
                            <tr key={item.id} className="bg-[#eef2f6] rounded-xl">
                                <td className="py-4 pl-4 rounded-l-xl font-medium text-[#1e293b]">{item.name}</td>
                                <td className="py-4 font-medium text-[#1e293b]">{item.unit}</td>
                                <td className="py-4 font-medium text-[#1e293b]">{item.totalIn || 0}</td>
                                <td className="py-4 font-medium text-[#1e293b]">{item.totalOut || 0}</td>
                                <td className="py-4 font-medium text-[#1e293b]">{item.quantityDamaged || '0 kg'}</td>
                                <td className="py-4 font-medium text-[#1e293b]">{item.minimumQuantity}</td>
                                <td className="py-4 font-medium text-[#1e293b]">{item.currentQuantity}</td>
                                <td className="py-4 pr-4 rounded-r-xl text-right">
                                    <span className="inline-block px-4 py-1 rounded-full bg-[#8b9db5] text-white text-xs font-bold">
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Report History Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-500">Stock Balance Report</h2>
        <div className="space-y-2">
            {reportHistory.length > 0 ? (
                reportHistory.slice(0, 5).map((report) => (
                    <div key={report.id} className="bg-[#f8f9fc] rounded-xl p-4 flex items-center justify-between group hover:bg-[#e2e8f0] transition-colors">
                        <div className="flex flex-col">
                            <span className="font-bold text-[#1e293b] text-sm">{report.title}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{report.generatedDate}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-xs font-bold text-gray-500 uppercase">{report.format}</span>
                            <span className="text-xs text-gray-400 font-medium">{report.size}</span>
                            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1e293b] hover:bg-[#1e293b] hover:text-white transition-colors shadow-sm">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-gray-500 bg-[#f8f9fc] rounded-xl">No reports generated yet</div>
            )}
        </div>
      </div>

    </div>
  );
};
