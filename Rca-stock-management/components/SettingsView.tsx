import React, { useState, useEffect } from 'react';
import { UserSettings, UserProfile } from '../types';
import { Bell, Shield, Moon, Globe, Save, Loader2, CheckCircle2, AlertCircle, Sun } from 'lucide-react';
import { getProfile, updateProfile, UpdateProfileRequest } from '../api/services/userService';
import { ApiError } from '../api/client';

interface SettingsViewProps {
    onChangePassword?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onChangePassword }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Initialize theme based on current DOM state to prevent flash
  const [settings, setSettings] = useState<UserSettings>({
      emailNotifications: true,
      smsNotifications: false,
      twoFactorAuth: false,
      theme: document.documentElement.classList.contains('dark') ? 'DARK' : 'LIGHT',
      language: 'en'
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
      const fetchSettings = async () => {
          try {
              const userProfile = await getProfile();
              setProfile(userProfile);
              
              // Sync state with profile
              setSettings(prev => ({
                  ...prev,
                  emailNotifications: userProfile.emailNotifications ?? true,
                  smsNotifications: userProfile.smsNotifications ?? false,
                  twoFactorAuth: userProfile.twoFactorAuth ?? false,
                  theme: userProfile.theme ?? 'LIGHT',
                  language: userProfile.language ?? 'en'
              }));
              
              // Enforce theme from profile on load
              if (userProfile.theme === 'DARK') {
                  document.documentElement.classList.add('dark');
              } else {
                  document.documentElement.classList.remove('dark');
              }
          } catch (err) {
              console.error("Failed to fetch settings", err);
              setError("Failed to load settings. Please try again.");
          } finally {
              setLoading(false);
          }
      };
      fetchSettings();
  }, []);

  const handleToggle = (key: keyof UserSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    if (success) setSuccess(null);
  };

  // Direct theme toggle handler
  const handleThemeChange = (newTheme: 'LIGHT' | 'DARK') => {
      // 1. Update React State
      setSettings(prev => ({ ...prev, theme: newTheme }));
      
      // 2. Update DOM immediately
      if (newTheme === 'DARK') {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'DARK'); // Optional: Local persistence
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'LIGHT'); // Optional: Local persistence
      }
      
      if (success) setSuccess(null);
  };

  const handleSave = async () => {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      try {
          const updateData: UpdateProfileRequest = {
              emailNotifications: settings.emailNotifications,
              smsNotifications: settings.smsNotifications,
              twoFactorAuth: settings.twoFactorAuth,
              theme: settings.theme,
              language: settings.language
          };
          
          await updateProfile(updateData);
          setSuccess("Settings saved successfully.");
          
          // Refresh profile to ensure sync
          const updatedProfile = await getProfile();
          setProfile(updatedProfile);
          
      } catch (err) {
          const message = err instanceof ApiError ? err.message : "Failed to save settings.";
          setError(message);
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
         <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
         <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage system configurations and preferences</p>
      </div>

      {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
          </div>
      )}

      {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{success}</span>
          </div>
      )}

      {/* Notifications Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
                <Bell className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage how you receive alerts</p>
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email Notifications</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">Receive daily stock summaries, low stock alerts, and system updates via email.</p>
                </div>
                <button 
                    onClick={() => handleToggle('emailNotifications')}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${settings.emailNotifications ? 'bg-[#1E293B] dark:bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700">
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">SMS Alerts</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">Get instant SMS notifications for critical stock shortages and urgent actions.</p>
                </div>
                <button 
                    onClick={() => handleToggle('smsNotifications')}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${settings.smsNotifications ? 'bg-[#1E293B] dark:bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
                <Shield className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Security</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Protect your account and data</p>
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">Add an extra layer of security to your account by requiring a code at login.</p>
                </div>
                 <button 
                    onClick={() => handleToggle('twoFactorAuth')}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${settings.twoFactorAuth ? 'bg-[#1E293B] dark:bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700">
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Change Password</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update your password regularly to keep your account safe.</p>
                </div>
                <button 
                    onClick={onChangePassword}
                    className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors"
                >
                    Update Password
                </button>
            </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-xl">
                <Moon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Appearance & Language</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize your interface experience</p>
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Language</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select your preferred language</p>
                    </div>
                </div>
                <select 
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[150px] font-medium outline-none"
                >
                    <option value="en">English</option>
                    <option value="fr">French (Coming Soon)</option>
                    <option value="rw">Kinyarwanda (Coming Soon)</option>
                </select>
            </div>
            
             <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    {settings.theme === 'LIGHT' ? (
                        <Sun className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    ) : (
                        <Moon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    )}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Theme</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose your interface theme</p>
                    </div>
                </div>
                
                {/* Radio Button Group for Theme */}
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-xl">
                    <label 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            settings.theme === 'LIGHT' 
                                ? 'bg-white text-slate-800 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                        onClick={() => handleThemeChange('LIGHT')}
                    >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            settings.theme === 'LIGHT' ? 'border-[#1E293B]' : 'border-slate-400'
                        }`}>
                            {settings.theme === 'LIGHT' && <div className="w-2 h-2 rounded-full bg-[#1E293B]" />}
                        </div>
                        <span className="text-sm font-medium">Light</span>
                    </label>

                    <label 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            settings.theme === 'DARK' 
                                ? 'bg-slate-600 text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                        onClick={() => handleThemeChange('DARK')}
                    >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            settings.theme === 'DARK' ? 'border-blue-400' : 'border-slate-400'
                        }`}>
                            {settings.theme === 'DARK' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                        </div>
                        <span className="text-sm font-medium">Dark</span>
                    </label>
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1e293b] dark:bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                </>
            ) : (
                <>
                    <Save className="w-4 h-4" />
                    Save Changes
                </>
            )}
          </button>
      </div>
    </div>
  );
};
