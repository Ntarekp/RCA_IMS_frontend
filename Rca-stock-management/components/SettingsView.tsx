import React, { useState, useEffect } from 'react';
import { UserSettings, UserProfile } from '../types';
import { Bell, Shield, Moon, Globe, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getProfile, updateProfile, UpdateProfileRequest } from '../api/services/userService';
import { ApiError } from '../api/client';

export const SettingsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<UserSettings>({
      emailNotifications: true,
      smsNotifications: false,
      twoFactorAuth: false,
      theme: 'LIGHT',
      language: 'en'
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
      const fetchSettings = async () => {
          try {
              const userProfile = await getProfile();
              setProfile(userProfile);
              setSettings(prev => ({
                  ...prev,
                  emailNotifications: userProfile.emailNotifications ?? true,
                  smsNotifications: userProfile.smsNotifications ?? false,
                  twoFactorAuth: userProfile.twoFactorAuth ?? false,
              }));
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
    // Clear success message when user makes changes
    if (success) setSuccess(null);
  };

  const handleSave = async () => {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      try {
          const updateData: UpdateProfileRequest = {
              // Preserve existing profile data if available, otherwise undefined (backend handles partial updates)
              // But updateProfile API expects fields. If we send undefined, backend might ignore or set null.
              // Our backend implementation checks for null and only updates if not null.
              // So we can just send the settings fields.
              emailNotifications: settings.emailNotifications,
              smsNotifications: settings.smsNotifications,
              twoFactorAuth: settings.twoFactorAuth
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
         <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
         <p className="text-sm text-slate-500 font-medium">Manage system configurations and preferences</p>
      </div>

      {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
          </div>
      )}

      {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{success}</span>
          </div>
      )}

      {/* Notifications Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                <Bell className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Notifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage how you receive alerts</p>
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">Email Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">Receive daily stock summaries, low stock alerts, and system updates via email.</p>
                </div>
                <button 
                    onClick={() => handleToggle('emailNotifications')}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${settings.emailNotifications ? 'bg-[#1E293B]' : 'bg-slate-200'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">SMS Alerts</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">Get instant SMS notifications for critical stock shortages and urgent actions.</p>
                </div>
                <button 
                    onClick={() => handleToggle('smsNotifications')}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${settings.smsNotifications ? 'bg-[#1E293B]' : 'bg-slate-200'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                <Shield className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Security</h3>
                <p className="text-xs text-slate-500 mt-0.5">Protect your account and data</p>
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">Add an extra layer of security to your account by requiring a code at login.</p>
                </div>
                 <button 
                    onClick={() => handleToggle('twoFactorAuth')}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${settings.twoFactorAuth ? 'bg-[#1E293B]' : 'bg-slate-200'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">Change Password</h4>
                    <p className="text-xs text-slate-500 mt-1">Update your password regularly to keep your account safe.</p>
                </div>
                <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                    Update Password
                </button>
            </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-purple-50 text-purple-600 p-2 rounded-xl">
                <Moon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Appearance & Language</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize your interface experience</p>
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700">Language</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Select your preferred language</p>
                    </div>
                </div>
                <select 
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[150px] font-medium outline-none"
                >
                    <option value="en">English</option>
                    <option value="fr">French (Coming Soon)</option>
                    <option value="rw">Kinyarwanda (Coming Soon)</option>
                </select>
            </div>
            
             <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-slate-400" />
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700">Theme</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Choose your interface theme</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setSettings(prev => ({ ...prev, theme: 'LIGHT' }))}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.theme === 'LIGHT' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Light
                    </button>
                    <button 
                        onClick={() => setSettings(prev => ({ ...prev, theme: 'DARK' }))}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.theme === 'DARK' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Dark
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1e293b] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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
