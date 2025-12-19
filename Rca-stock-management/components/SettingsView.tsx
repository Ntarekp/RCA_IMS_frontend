import React, { useState } from 'react';
import { UserSettings } from '../types';
import { MOCK_SETTINGS } from '../constants';
import { Bell, Shield, Moon, Globe, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(MOCK_SETTINGS);

  const handleToggle = (key: keyof UserSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
         <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
         <p className="text-xs text-gray-400 mt-1">Manage system configurations and preferences</p>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700">Notifications</h3>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                    <p className="text-xs text-gray-500 mt-1">Receive daily stock summaries and alerts via email.</p>
                </div>
                <button 
                    onClick={() => handleToggle('emailNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-gray-700">SMS Alerts</h4>
                    <p className="text-xs text-gray-500 mt-1">Get instant SMS for critical stock shortages.</p>
                </div>
                <button 
                    onClick={() => handleToggle('smsNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700">Security</h3>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                </div>
                 <button 
                    onClick={() => handleToggle('twoFactorAuth')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                    <h4 className="text-sm font-medium text-gray-700">Change Password</h4>
                    <p className="text-xs text-gray-500 mt-1">Update your password regularly to stay safe.</p>
                </div>
                <button className="text-sm text-blue-600 font-medium hover:underline">Update</button>
            </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <Moon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700">Appearance & Language</h3>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <div>
                        <h4 className="text-sm font-medium text-gray-700">Language</h4>
                    </div>
                </div>
                <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="rw">Kinyarwanda</option>
                </select>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
          <button className="flex items-center gap-2 bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
      </div>
    </div>
  );
};