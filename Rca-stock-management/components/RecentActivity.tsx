import React from 'react';
import { MOCK_ACTIVITIES } from '../constants';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Recent Activity</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">View All</button>
      </div>
      
      <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-4 before:w-px before:bg-slate-100">
        {MOCK_ACTIVITIES.map((activity, idx) => (
            <div key={activity.id + idx} className="relative pl-10 group">
                {/* Timeline Dot */}
                <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${
                    activity.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                    {activity.type === 'IN' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                </div>

                <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-800">{activity.quantity}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {activity.timeAgo}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-1">
                        {activity.type === 'IN' ? 'Stock In' : 'Stock Out'} &bull; <span className="text-slate-400 font-normal">{activity.reason}</span>
                    </p>
                    {activity.processedBy && (
                         <div className="flex items-center gap-1.5 mt-1">
                             <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                {activity.processedBy.charAt(0)}
                             </div>
                             <span className="text-[10px] text-slate-400">by {activity.processedBy}</span>
                         </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};