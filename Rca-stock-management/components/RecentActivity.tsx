import React, { useEffect, useState } from 'react';
import { Clock, ArrowUpRight, ArrowDownRight, Loader2, AlertTriangle, ChevronRight } from 'lucide-react';
import { getRecentTransactions } from '../api/services/dashboardService';
import { StockTransactionDTO } from '../api/types';

interface RecentActivityProps {
    onViewAll?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = React.memo(({ onViewAll }) => {
  const [activities, setActivities] = useState<StockTransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Fetch more than 3 to check if we need to show "View All" logic, but limit display to 3
      const transactions = await getRecentTransactions(5); 
      setActivities(transactions);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error loading recent activities:', err);
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

  // Only show the first 3 activities
  const displayedActivities = activities.slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-[#E5E7EB] dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-[#1E293B] dark:text-white">Recent Activity</h3>
        <div className="text-xs font-medium text-[#1E293B] dark:text-white bg-[#F7F8FD] dark:bg-slate-700 px-2 py-1 rounded-lg">Live</div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12 flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF] dark:text-slate-500" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-[#9CA3AF] dark:text-slate-500 text-sm flex-1">
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-4 before:w-px before:bg-[#F7F8FD] dark:before:bg-slate-700 flex-1">
          {displayedActivities.map((activity, idx) => {
              const damaged = isDamaged(activity);
              // Prefer createdAt for time ago calculation if available, else transactionDate
              const timeDisplay = formatTimeAgo(activity.createdAt || activity.transactionDate);
              
              return (
              <div key={activity.id || idx} className="relative pl-10 group">
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm z-10 ${
                      damaged ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
          activity.transactionType === 'IN' ? 'bg-[#1E293B] dark:bg-[#155DFC] text-white' : 'bg-[#EDEEF3] dark:bg-slate-700 text-[#9CA3AF] dark:text-slate-400'
        }`}>
                      {damaged ? <AlertTriangle className="w-3.5 h-3.5" /> :
                       activity.transactionType === 'IN' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-[#1E293B] dark:text-white">{activity.quantity} {activity.itemName ? activity.itemName.split(' ')[0] : ''}</span>
                          <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] dark:text-slate-400 bg-[#F7F8FD] dark:bg-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <Clock className="w-3 h-3" />
                              {timeDisplay}
                          </div>
                      </div>
                      <p className="text-xs text-[#9CA3AF] dark:text-slate-400 font-medium mb-1 line-clamp-1">
                          {damaged ? 'Reported Damaged' :
                           activity.transactionType === 'IN' ? 'Stock In' : 'Stock Out'} 
                           &bull; <span className="text-[#9CA3AF] dark:text-slate-500 font-normal">{activity.notes || activity.itemName || 'Transaction'}</span>
                      </p>
                      {activity.recordedBy && (
                           <div className="flex items-center gap-1.5 mt-1">
                               <div className="w-4 h-4 rounded-full bg-[#EDEEF3] dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-[#9CA3AF] dark:text-slate-400">
                                  {activity.recordedBy.charAt(0).toUpperCase()}
                               </div>
                               <span className="text-[10px] text-[#9CA3AF] dark:text-slate-500">by {activity.recordedBy}</span>
                           </div>
                      )}
                  </div>
              </div>
          )})}
        </div>
      )}
      
      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-[#F7F8FD] dark:border-slate-700">
        <button 
            onClick={onViewAll}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[#1E293B] dark:text-white hover:bg-[#F7F8FD] dark:hover:bg-slate-700 py-2 rounded-lg transition-colors"
        >
            View Full History
            <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

// Helper functions moved outside component
const formatTimeAgo = (dateString: string) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const isDamaged = (activity: StockTransactionDTO) => {
    if (!activity) return false;
    const notes = activity.notes?.toLowerCase() || '';
    return notes.includes('damaged') || notes.includes('broken') || notes.includes('expired');
};
