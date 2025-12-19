import React from 'react';
import { MOCK_NOTIFICATIONS } from '../constants';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
       <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-xs text-gray-400 mt-1">Stay updated with latest system alerts</p>
          </div>
          <button className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
       </div>

       <div className="space-y-4">
          {MOCK_NOTIFICATIONS.map((notif) => {
            let Icon = Info;
            let iconColor = 'text-blue-500';
            let bgColor = 'bg-blue-50';

            if (notif.type === 'WARNING') {
                Icon = AlertTriangle;
                iconColor = 'text-yellow-600';
                bgColor = 'bg-yellow-50';
            } else if (notif.type === 'ALERT') {
                Icon = AlertCircle;
                iconColor = 'text-red-600';
                bgColor = 'bg-red-50';
            } else if (notif.type === 'SUCCESS') {
                Icon = CheckCircle2;
                iconColor = 'text-emerald-600';
                bgColor = 'bg-emerald-50';
            }

            return (
                <div key={notif.id} className={`bg-white p-5 rounded-xl border ${notif.read ? 'border-gray-100 opacity-80' : 'border-l-4 border-l-blue-500 shadow-sm'} flex gap-4 transition-all hover:shadow-md`}>
                    <div className={`${bgColor} ${iconColor} p-2.5 rounded-full h-fit flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`text-sm font-semibold ${notif.read ? 'text-gray-600' : 'text-gray-800'}`}>{notif.title}</h3>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{notif.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                    {!notif.read && (
                        <div className="self-center">
                             <span className="w-2.5 h-2.5 bg-blue-500 rounded-full block"></span>
                        </div>
                    )}
                </div>
            );
          })}
       </div>

       <div className="mt-8 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">View older notifications</button>
       </div>
    </div>
  );
};