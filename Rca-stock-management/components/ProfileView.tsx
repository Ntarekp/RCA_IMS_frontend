import React, { useEffect, useState, useMemo } from 'react';
import { getProfile, updateProfile } from '../api/services/userService';
import { useItems } from '../hooks/useItems';
import { useReports } from '../hooks/useReports';
import { useTransactions } from '../hooks/useTransactions';
import { Mail, Phone, Briefcase, Calendar, MapPin, Edit3, LogOut, Key, Save, X, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  onEditProfile?: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

interface EditFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

// --- Sub-Component: Edit Form ---
const ProfileEditForm: React.FC<EditFormProps> = ({ profile, onSave, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const updated = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      department: formData.get('department') as string,
      location: formData.get('location') as string,
    };

    try {
      await onSave(updated);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-300">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Edit3 className="w-6 h-6" />
        </div>
        Edit Profile
      </h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Full Name</label>
          <input name="name" defaultValue={profile.name} required className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400" placeholder="Enter your full name" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Phone Number</label>
                <input name="phone" defaultValue={profile.phone} className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400" placeholder="+250..." />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Department</label>
                <input name="department" defaultValue={profile.department} className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400" placeholder="e.g. Logistics" />
            </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Location</label>
          <input name="location" defaultValue={profile.location} className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400" placeholder="e.g. Kigali, Rwanda" />
        </div>
        
        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1E293B] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Main Component ---
export const ProfileView: React.FC<ProfileViewProps> = ({ onChangePassword, onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Data Hooks
  const { items, loading: itemsLoading } = useItems();
  const { dashboardItems, loading: reportsLoading } = useReports();
  const { transactions, loading: txLoading } = useTransactions();

  // Fetch Profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      // Load persisted images from local storage if available (mock persistence)
      const savedAvatar = localStorage.getItem(`avatar_${data.email}`);
      const savedCover = localStorage.getItem(`cover_${data.email}`);
      if (savedAvatar) setAvatarPreview(savedAvatar);
      if (savedCover) setCoverPreview(savedCover);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update Profile Handler
  const handleUpdate = async (updatedData: Partial<UserProfile>) => {
    if (!profile) return;
    await updateProfile({ ...profile, ...updatedData });
    await fetchProfile(); // Refresh data to get verified server state
    setEditMode(false);
  };

  const handleImageUpload = (type: 'avatar' | 'cover') => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                  const result = event.target?.result as string;
                  if (type === 'avatar') {
                      setAvatarPreview(result);
                      if (profile?.email) localStorage.setItem(`avatar_${profile.email}`, result);
                  } else {
                      setCoverPreview(result);
                      if (profile?.email) localStorage.setItem(`cover_${profile.email}`, result);
                  }
              };
              reader.readAsDataURL(file);
          }
      };
      input.click();
  };

  // Memoized Calculations (Performance Optimization)
  const stats = useMemo(() => {
    const stockEntries = items.length;
    const reportsCreated = dashboardItems.length;
    
    // Recent logs: last 3 transactions
    const recentLogs = transactions.slice(0, 3);

    // Days active calculation
    let daysActive = 0;
    if (transactions.length > 0) {
      const dates = transactions
        .map(t => t.createdAt || t.transactionDate ? new Date(t.createdAt || t.transactionDate).getTime() : 0)
        .filter(d => d > 0);

      if (dates.length > 0) {
        const minDate = Math.min(...dates);
        const now = Date.now();
        daysActive = Math.max(1, Math.ceil((now - minDate) / (1000 * 60 * 60 * 24)));
      }
    }

    return { stockEntries, reportsCreated, daysActive, recentLogs };
  }, [items.length, dashboardItems.length, transactions]);

  const isLoadingAll = loading || itemsLoading || reportsLoading || txLoading;

  if (isLoadingAll) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="animate-spin h-12 w-12 text-[#9CA3AF] dark:text-slate-500 mb-4" />
        <p className="text-[#9CA3AF] dark:text-slate-500 font-medium">Loading profile data...</p>
      </div>
    );
  }

  if (!profile) return <div className="text-center p-10 text-red-500 dark:text-red-400">Failed to load profile.</div>;

  if (editMode) {
    return <ProfileEditForm profile={profile} onSave={handleUpdate} onCancel={() => setEditMode(false)} />;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="relative mb-24 group/cover">
        {/* Cover Photo */}
        <div className="h-64 w-full bg-gradient-to-r from-[#1E293B] to-[#334155] dark:from-slate-800 dark:to-slate-900 rounded-3xl overflow-hidden relative shadow-inner">
          {coverPreview && (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          {/* Change Cover Button */}
          <button 
            onClick={() => handleImageUpload('cover')}
            className="absolute top-6 right-6 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-xl backdrop-blur-md transition-all opacity-0 group-hover/cover:opacity-100 flex items-center gap-2 text-sm font-medium border border-white/10"
          >
              <ImageIcon className="w-4 h-4" />
              Change Cover
          </button>
        </div>
        
        {/* Avatar & Info */}
        <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-[6px] border-white dark:border-slate-900 shadow-2xl overflow-hidden bg-white dark:bg-slate-800 relative">
              <img 
                src={avatarPreview || profile.avatarUrl || "/rca-logo.png"} 
                alt={profile.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
              {/* Upload Overlay */}
              <div 
                onClick={() => handleImageUpload('avatar')}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-1 backdrop-blur-[2px]"
              >
                  <Camera className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-wider">Update</span>
              </div>
            </div>
          </div>
          <div className="mb-4 pb-1">
            <h1 className="text-4xl font-bold text-[#1E293B] dark:text-white mb-2 shadow-black/5 drop-shadow-sm">{profile.name || 'User'}</h1>
            <div className="flex items-center gap-3 text-[#9CA3AF] dark:text-slate-400 font-medium">
               <span className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-[#1E293B] dark:text-slate-200 border border-[#E5E7EB] dark:border-slate-700 text-xs px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                 {profile.role || 'Member'}
               </span>
               {profile.department && (
                   <span className="flex items-center gap-1.5 text-sm">
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                       {profile.department}
                   </span>
               )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons (Top Right) */}
        <div className="absolute bottom-6 right-8 hidden md:flex gap-3">
          <button 
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/50 dark:border-slate-700 text-slate-800 dark:text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-800 hover:scale-105 transition-all shadow-lg shadow-slate-900/5"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-[#1E293B] dark:text-white mb-6 flex items-center gap-2 text-lg">
              Personal Information
            </h3>
            <div className="space-y-5">
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone || 'Not set'} />
              <InfoRow icon={Briefcase} label="Department" value={profile.department || 'General'} />
              {profile.joinDate && <InfoRow icon={Calendar} label="Joined" value={profile.joinDate} />}
              <InfoRow icon={MapPin} label="Location" value={profile.location || 'Kigali, Rwanda'} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-[#1E293B] dark:text-white mb-4 text-lg">Account Settings</h3>
            <div className="space-y-2">
              <ActionButton onClick={() => setEditMode(true)} icon={Edit3} label="Edit Profile Details" />
              <ActionButton onClick={onChangePassword} icon={Key} label="Change Password" />
              <ActionButton onClick={onLogout} icon={LogOut} label="Sign Out" variant="danger" />
            </div>
          </div>
        </div>

        {/* Right Column: Activity / Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-[#1E293B] dark:text-white mb-6 text-lg">Activity Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard value={stats.stockEntries} label="Stock Entries" color="blue" />
              <StatCard value={stats.reportsCreated} label="Reports Generated" color="emerald" />
              <StatCard value={stats.daysActive} label="Days Active" color="purple" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-[#1E293B] dark:text-white mb-6 text-lg">Recent System Logs</h3>
            <div className="space-y-6">
              {stats.recentLogs.length === 0 ? (
                <div className="text-center py-12 text-[#9CA3AF] dark:text-slate-500 text-sm bg-[#F7F8FD] dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  No recent activity found.
                </div>
              ) : (
                stats.recentLogs.map((log, i) => (
                  <div key={log.id || i} className="flex gap-4 items-start relative pl-2 group">
                    {/* Timeline Line */}
                    {i !== stats.recentLogs.length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-[#F7F8FD] dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors"></div>
                    )}
                    
                    <div className={`
                      min-w-[10px] h-[10px] mt-1.5 rounded-full border-2 z-10
                      ${log.transactionType === 'IN' ? 'bg-[#1E293B] dark:bg-blue-500 border-[#1E293B] dark:border-blue-500' : 'bg-[#9CA3AF] dark:bg-slate-500 border-[#9CA3AF] dark:border-slate-500'}
                    `} />
                    
                    <div className="flex-1 p-3 rounded-xl hover:bg-[#F7F8FD] dark:hover:bg-slate-700/50 transition-colors -mt-2">
                      <p className="text-sm font-medium text-[#1E293B] dark:text-slate-200">
                        {log.transactionType === 'IN' ? 'Stocked In' : 'Stocked Out'} 
                        <span className="font-bold text-[#1E293B] dark:text-white mx-1.5">{log.quantity}</span>
                        {log.itemName}
                      </p>
                      {log.notes && <p className="text-xs text-[#9CA3AF] dark:text-slate-400 mt-1 italic">"{log.notes}"</p>}
                      <div className="text-xs font-mono text-[#9CA3AF] dark:text-slate-500 mt-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : log.transactionDate}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components for clean JSX ---

const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-4 group">
    <div className="p-2.5 bg-[#F7F8FD] dark:bg-slate-700/50 rounded-xl text-[#9CA3AF] dark:text-slate-400 group-hover:text-[#1E293B] dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs font-bold text-[#9CA3AF] dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-[#1E293B] dark:text-slate-200 font-medium">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, icon: Icon, label, variant = 'default' }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left
      ${variant === 'danger' 
        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300' 
        : 'text-[#1E293B] dark:text-slate-200 hover:bg-[#F7F8FD] dark:hover:bg-slate-700 hover:translate-x-1'}
    `}
  >
    <Icon className="w-4 h-4 opacity-70" />
    {label}
  </button>
);

const StatCard = ({ value, label, color }: any) => {
  // Simplified colors to match theme
  const colors: any = {
    blue: "bg-[#F7F8FD] dark:bg-slate-700/30 text-[#1E293B] dark:text-white border-[#E5E7EB] dark:border-slate-700",
    emerald: "bg-[#F7F8FD] dark:bg-slate-700/30 text-[#1E293B] dark:text-white border-[#E5E7EB] dark:border-slate-700",
    purple: "bg-[#F7F8FD] dark:bg-slate-700/30 text-[#1E293B] dark:text-white border-[#E5E7EB] dark:border-slate-700"
  };
  
  return (
    <div className={`p-5 rounded-2xl border ${colors[color]} text-center transition-all hover:-translate-y-1 hover:shadow-md dark:hover:shadow-slate-900/20`}>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs font-bold opacity-60 uppercase tracking-wider mt-2">{label}</div>
    </div>
  );
}
