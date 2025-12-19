import React from 'react';
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
  AlertCircle
} from 'lucide-react';
import { MOCK_REPORTS } from '../constants';

interface ReportsViewProps {
  onGenerateReport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onGenerateReport }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports Center</h1>
          <p className="text-xs text-gray-400 mt-1">Generate, manage and analyze system reports</p>
        </div>
        <button 
          onClick={onGenerateReport}
          className="flex items-center gap-2 bg-[#1e293b] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Quick Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FileSpreadsheet, title: 'Stock Summary', desc: 'Monthly inventory status', color: 'text-blue-600', bg: 'bg-blue-50', hover: 'group-hover:bg-blue-600' },
          { icon: FileText, title: 'Audit Logs', desc: 'System activity tracking', color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'group-hover:bg-emerald-600' },
          { icon: Sparkles, title: 'AI Insights', desc: 'Predictive analysis', color: 'text-purple-600', bg: 'bg-purple-50', hover: 'group-hover:bg-purple-600' },
        ].map((card, idx) => (
          <div key={idx} onClick={onGenerateReport} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
            <div className={`${card.bg} ${card.color} p-4 rounded-xl ${card.hover} group-hover:text-white transition-colors`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{card.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
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
              {MOCK_REPORTS.length > 0 ? (
                MOCK_REPORTS.map((report) => (
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
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded transition-colors">
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
            <span>Showing {MOCK_REPORTS.length} results</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};