import React from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

// Real notification data structure
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  timestamp: string;
  read: boolean;
}

// Mock real data for now, but structured for easy API replacement
const REAL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Low Stock Alert: Rice', message: 'Rice inventory has dropped below the minimum threshold of 250kg. Current stock: 200kg.', type: 'ALERT', timestamp: '10 mins ago', read: false },
  { id: '2', title: 'Stock In Successful', message: 'Successfully recorded 500kg of Beans from Kigali Grains Ltd.', type: 'SUCCESS', timestamp: '2 hours ago', read: false },
  { id: '3', title: 'System Maintenance', message: 'Scheduled maintenance will occur on Saturday at 2:00 AM. Expected downtime: 30 mins.', type: 'INFO', timestamp: '1 day ago', read: true },
  { id: '4', title: 'Pending Supplier Approval', message: 'New supplier "Rwanda Foods" is awaiting your approval.', type: 'WARNING', timestamp: '2 days ago', read: true },
];

export const NotificationsView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-10">
       <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B] dark:text-white">Notifications</h1>
            <p className="text-xs text-[#9CA3AF] dark:text-slate-400 mt-1">Stay updated with latest system alerts</p>
          </div>
          <button className="flex items-center gap-2 text-sm text-[#1E293B] dark:text-white font-medium hover:bg-[#F7F8FD] dark:hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors border border-[#E5E7EB] dark:border-slate-700">
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
       </div>

       <div className="space-y-4">
          {REAL_NOTIFICATIONS.map((notif) => {
            let Icon = Info;
            let iconColor = 'text-blue-500 dark:text-blue-400';
            let bgColor = 'bg-blue-50 dark:bg-blue-900/20';

            if (notif.type === 'WARNING') {
                Icon = AlertTriangle;
                iconColor = 'text-amber-600 dark:text-amber-400';
                bgColor = 'bg-amber-50 dark:bg-amber-900/20';
            } else if (notif.type === 'ALERT') {
                Icon = AlertCircle;
                iconColor = 'text-rose-600 dark:text-rose-400';
                bgColor = 'bg-rose-50 dark:bg-rose-900/20';
            } else if (notif.type === 'SUCCESS') {
                Icon = CheckCircle2;
                iconColor = 'text-emerald-600 dark:text-emerald-400';
                bgColor = 'bg-emerald-50 dark:bg-emerald-900/20';
            }

            return (
                <div key={notif.id} className={`bg-white dark:bg-slate-800 p-5 rounded-xl border ${notif.read ? 'border-[#E5E7EB] dark:border-slate-700 opacity-80' : 'border-l-4 border-l-[#1E293B] dark:border-l-blue-500 shadow-sm dark:shadow-slate-900/10'} flex gap-4 transition-all hover:shadow-md dark:hover:shadow-slate-900/20`}>
                    <div className={`${bgColor} ${iconColor} p-2.5 rounded-full h-fit flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`text-sm font-semibold ${notif.read ? 'text-[#9CA3AF] dark:text-slate-400' : 'text-[#1E293B] dark:text-white'}`}>{notif.title}</h3>
                            <span className="text-xs text-[#9CA3AF] dark:text-slate-500 whitespace-nowrap ml-4">{notif.timestamp}</span>
                        </div>
                        <p className="text-sm text-[#9CA3AF] dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                    {!notif.read && (
                        <div className="self-center">
                             <span className="w-2.5 h-2.5 bg-[#1E293B] dark:bg-blue-500 rounded-full block"></span>
                        </div>
                    )}
                </div>
            );
          })}
       </div>

       <div className="mt-8 text-center">
            <button className="text-sm text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white font-medium transition-colors">View older notifications</button>
       </div>
    </div>
  );
};
