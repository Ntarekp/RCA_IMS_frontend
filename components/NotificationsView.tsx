import React, { useEffect, useState } from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getNotifications } from '../api/services/dashboardService';
import { NotificationDTO } from '../api/types';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
      return <div className="p-10 text-center">Loading notifications...</div>;
  }

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-10">
       <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B] dark:text-white">Notifications</h1>
            <p className="text-xs text-[#9CA3AF] dark:text-slate-400 mt-1">Stay updated with latest system alerts</p>
          </div>
          {notifications.length > 0 && (
            <button
                disabled={!hasUnread}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors border ${
                    hasUnread 
                    ? 'text-[#1E293B] dark:text-white hover:bg-[#F7F8FD] dark:hover:bg-slate-800 border-[#E5E7EB] dark:border-slate-700' 
                    : 'text-slate-400 border-transparent cursor-default'
                }`}
            >
                <Check className="w-4 h-4" />
                Mark all as read
            </button>
          )}
       </div>

       <div className="space-y-4">
          {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No new notifications</p>
                  <p className="text-sm mt-1">You're all caught up!</p>
              </div>
          ) : (
              notifications.map((notif) => {
                let Icon = Info;
                let iconColor = 'text-[#1E293B] dark:text-[#155DFC]';
                let bgColor = 'bg-[#1E293B]/10 dark:bg-[#155DFC]/20';

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
                    <div key={notif.id} className={`bg-white dark:bg-slate-800 p-5 rounded-xl border ${notif.read ? 'border-[#E5E7EB] dark:border-slate-700 opacity-80' : 'border-l-4 border-l-[#1E293B] dark:border-l-[#155DFC] shadow-sm dark:shadow-slate-900/10'} flex gap-4 transition-all hover:shadow-md dark:hover:shadow-slate-900/20`}>
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
                                <span className="w-2.5 h-2.5 bg-[#1E293B] dark:bg-[#155DFC] rounded-full block"></span>
                            </div>
                        )}
                    </div>
                );
              })
          )}
       </div>

       {notifications.length > 0 && (
           <div className="mt-8 text-center">
                <button className="text-sm text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white font-medium transition-colors">View older notifications</button>
           </div>
       )}
    </div>
  );
};
