import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Calendar, Download, Filter, Loader2 } from 'lucide-react';
import { generateCsvReport, generatePdfReport, ReportType } from '../api/services/reportService';
import { useItems } from '../hooks/useItems';

interface ReportsViewProps {
  onGenerateReport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onGenerateReport }) => {
  const [reportType, setReportType] = useState<ReportType>('balance');
  const [format, setFormat] = useState<'PDF' | 'CSV'>('CSV');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { items } = useItems();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const itemId = selectedItemId ? parseInt(selectedItemId) : undefined;
      const range = (reportType === 'stock-in' || reportType === 'stock-out' || reportType === 'transactions') 
        ? dateRange 
        : undefined;

      if (format === 'CSV') {
        await generateCsvReport(reportType, itemId, range);
      } else {
        await generatePdfReport(reportType, itemId, range);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      // Ideally show a toast here
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Generate and export detailed inventory reports</p>
        </div>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="balance">Current Stock Balance</option>
                  <option value="low-stock">Low Stock Alert</option>
                  <option value="transactions">Detailed Transactions</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  {reportType === 'balance' && "Overview of all items and their current quantities."}
                  {reportType === 'low-stock' && "List of items below their minimum threshold."}
                  {reportType === 'transactions' && "Detailed history of stock movements (In/Out)."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setFormat('CSV')}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      format === 'CSV' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-2 ring-emerald-500/20' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV (Excel)
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
                    PDF Document
                  </button>
                </div>
              </div>

              {(reportType === 'transactions' || reportType === 'stock-in' || reportType === 'stock-out') && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700">Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">From</label>
                      <input 
                        type="date" 
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">To</label>
                      <input 
                        type="date" 
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Item (Optional)</label>
                <select 
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">All Items</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-6 bg-[#1e293b] text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview / Info Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Report Preview</h3>
            <p className="text-slate-500 max-w-md">
              Select your configuration on the left to generate a comprehensive report. 
              The report will include detailed data based on your selected filters.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-medium text-slate-500 mb-1">Format</div>
                <div className="font-bold text-slate-800">{format}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-medium text-slate-500 mb-1">Type</div>
                <div className="font-bold text-slate-800 capitalize">{reportType.replace('-', ' ')}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-medium text-slate-500 mb-1">Scope</div>
                <div className="font-bold text-slate-800">
                  {selectedItemId ? items.find(i => i.id === selectedItemId)?.name : 'All Items'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
