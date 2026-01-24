import React, { useState, useEffect } from 'react';
import { X, Mail, Calendar, Clock, Loader2, Trash2, Plus, AlertCircle, Check } from 'lucide-react';
import { ScheduledReportConfig } from '../types';
import { scheduleReport, getScheduledReports, deleteScheduledReport } from '../api/services/reportService';
import { ConfirmationModal } from './ConfirmationModal';

interface ScheduledReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduledReportModal: React.FC<ScheduledReportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<ScheduledReportConfig[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Confirmation State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [reportType, setReportType] = useState<'ALL_REPORTS_ZIP' | 'TRANSACTION_HISTORY' | 'STOCK_BALANCE' | 'LOW_STOCK'>('ALL_REPORTS_ZIP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConfigs();
    }
  }, [isOpen]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getScheduledReports();
      setConfigs(data);
    } catch (err) {
      setError('Failed to load scheduled reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      await scheduleReport({
        email,
        frequency,
        reportType,
        scheduledTime,
        active: true
      });
      
      // Reset form and refresh list
      setEmail('');
      setFrequency('DAILY');
      setReportType('ALL_REPORTS_ZIP');
      setActiveTab('list');
      fetchConfigs();
    } catch (err) {
      setError('Failed to schedule report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete === null) return;
    
    try {
      await deleteScheduledReport(itemToDelete);
      setConfigs(configs.filter(c => c.id !== itemToDelete));
    } catch (err) {
      setError('Failed to delete scheduled report');
    } finally {
      setItemToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Scheduled Reports</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Automated email reporting</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Active Schedules
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Schedule New Report
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'list' ? (
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Loading schedules...</p>
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No active schedules</p>
                  <p className="text-sm mt-1">Create a schedule to receive automated reports</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Create Schedule
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {configs.map((config) => (
                    <div key={config.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between group hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                              {config.reportType.replace(/_/g, ' ')}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase">
                              {config.frequency}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <Mail className="w-3 h-3" />
                            {config.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => config.id && handleDeleteClick(config.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter recipient email"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="INTERVAL">Interval (Hours)</option>
                    </select>
                  </div>

                  {frequency === 'INTERVAL' ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Interval (Hours)</label>
                      <input
                        type="number"
                        min="1"
                        value={intervalHours}
                        onChange={(e) => setIntervalHours(parseInt(e.target.value) || 24)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="ALL_REPORTS_ZIP">All Reports (Zip Bundle)</option>
                      <option value="TRANSACTION_HISTORY">Transaction History</option>
                      <option value="STOCK_BALANCE">Stock Balance</option>
                      <option value="LOW_STOCK">Low Stock Alert</option>
                    </select>
                  </div>
                </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Scheduled Report"
        message="Are you sure you want to stop receiving this report? This action cannot be undone."
        confirmText="Delete Schedule"
        type="danger"
      />
    </div>
  );
};
