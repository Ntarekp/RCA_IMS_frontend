import React, { useEffect, useState } from 'react';
import { Clock, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { getRecentTransactions } from '../api/services/dashboardService';
import { StockTransactionDTO } from '../api/types';

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<StockTransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const transactions = await getRecentTransactions(5);
      setActivities(transactions);
    } catch (err) {
      console.error('Error loading recent activities:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // Refresh activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    try {
      // Handle ISO date string format (YYYY-MM-DD)
      const date = new Date(dateString + 'T00:00:00');
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Recent Activity</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">View All</button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-4 before:w-px before:bg-slate-100">
          {activities.map((activity, idx) => (
              <div key={activity.id || idx} className="relative pl-10 group">
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${
                      activity.transactionType === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                      {activity.transactionType === 'IN' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-slate-800">{activity.quantity} {activity.itemName ? activity.itemName.split(' ')[0] : ''}</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(activity.transactionDate)}
                          </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mb-1">
                          {activity.transactionType === 'IN' ? 'Stock In' : 'Stock Out'} &bull; <span className="text-slate-400 font-normal">{activity.notes || activity.itemName || 'Transaction'}</span>
                      </p>
                      {activity.recordedBy && (
                           <div className="flex items-center gap-1.5 mt-1">
                               <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                  {activity.recordedBy.charAt(0).toUpperCase()}
                               </div>
                               <span className="text-[10px] text-slate-400">by {activity.recordedBy}</span>
                           </div>
                      )}
                  </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};