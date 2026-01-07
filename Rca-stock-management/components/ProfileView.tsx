import React, { useEffect, useState, useMemo } from 'react';
import { getProfile, updateProfile } from '../api/services/userService';
import { useItems } from '../hooks/useItems';
import { useReports } from '../hooks/useReports';
import { useTransactions } from '../hooks/useTransactions';
import { Mail, Phone, Briefcase, Calendar, MapPin, Edit3, LogOut, Key, Save, X, Loader2, Camera } from 'lucide-react';

// --- Types ---
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  avatarUrl?: string;
  joinDate?: string;
}

interface ProfileViewProps {
  onEditProfile?: () => void; // Optional if handled internally
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
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow border border-[#E5E7EB]">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#1E293B]">
        <Edit3 className="w-5 h-5 text-[#1E293B]" /> Edit Profile
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#1E293B]">Full Name</label>
          <input name="name" defaultValue={profile.name} required className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B]/20 outline-none transition-all bg-[#F7F8FD]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#1E293B]">Phone</label>
          <input name="phone" defaultValue={profile.phone} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B]/20 outline-none transition-all bg-[#F7F8FD]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#1E293B]">Department</label>
          <input name="department" defaultValue={profile.department} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B]/20 outline-none transition-all bg-[#F7F8FD]" />
        </div>
        
        <div className="flex gap-3 mt-6 pt-4 border-t border-[#E5E7EB]">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#334155] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 bg-white border border-[#E5E7EB] hover:bg-[#F7F8FD] text-[#1E293B] px-6 py-2 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
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
        <Loader2 className="animate-spin h-12 w-12 text-[#9CA3AF] mb-4" />
        <p className="text-[#9CA3AF] font-medium">Loading profile data...</p>
      </div>
    );
  }

  if (!profile) return <div className="text-center p-10 text-red-500">Failed to load profile.</div>;

  if (editMode) {
    return <ProfileEditForm profile={profile} onSave={handleUpdate} onCancel={() => setEditMode(false)} />;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="relative mb-24">
        {/* Cover Photo */}
        <div className="h-56 w-full bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-2xl overflow-hidden relative shadow-inner">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        
        {/* Avatar & Info */}
        <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
          <div className="relative group">
            <div className="w-36 h-36 rounded-full border-[5px] border-white shadow-lg overflow-hidden bg-white relative">
              <img 
                src={profile.avatarUrl || "/rca-logo.png"} // Use RCA logo as default or uploaded image
                alt={profile.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
              {/* Upload Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div className="mb-3 pb-1">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-1">{profile.name || 'User'}</h1>
            <div className="flex items-center gap-2 text-[#9CA3AF] font-medium">
               <span className="bg-[#F7F8FD] text-[#1E293B] border border-[#E5E7EB] text-xs px-2 py-0.5 rounded-full uppercase tracking-wide">
                 {profile.role || 'Member'}
               </span>
               {profile.department && <span>• {profile.department}</span>}
            </div>
          </div>
        </div>
        
        {/* Action Buttons (Top Right) */}
        <div className="absolute bottom-4 right-6 hidden md:flex gap-3">
          <button 
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h3 className="font-semibold text-[#1E293B] mb-5 flex items-center gap-2">
              Personal Information
            </h3>
            <div className="space-y-5">
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone || 'Not set'} />
              <InfoRow icon={Briefcase} label="Department" value={profile.department || 'General'} />
              {profile.joinDate && <InfoRow icon={Calendar} label="Joined" value={profile.joinDate} />}
              <InfoRow icon={MapPin} label="Location" value="Kigali, Rwanda" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h3 className="font-semibold text-[#1E293B] mb-4">Account Settings</h3>
            <div className="space-y-2">
              <ActionButton onClick={() => setEditMode(true)} icon={Edit3} label="Edit Profile Details" />
              <ActionButton onClick={onChangePassword} icon={Key} label="Change Password" />
              <ActionButton onClick={onLogout} icon={LogOut} label="Sign Out" variant="danger" />
            </div>
          </div>
        </div>

        {/* Right Column: Activity / Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h3 className="font-semibold text-[#1E293B] mb-6">Activity Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard value={stats.stockEntries} label="Stock Entries" color="blue" />
              <StatCard value={stats.reportsCreated} label="Reports Generated" color="emerald" />
              <StatCard value={stats.daysActive} label="Days Active" color="purple" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h3 className="font-semibold text-[#1E293B] mb-6">Recent System Logs</h3>
            <div className="space-y-6">
              {stats.recentLogs.length === 0 ? (
                <div className="text-center py-8 text-[#9CA3AF] text-sm bg-[#F7F8FD] rounded-lg">
                  No recent activity found.
                </div>
              ) : (
                stats.recentLogs.map((log, i) => (
                  <div key={log.id || i} className="flex gap-4 items-start relative pl-4">
                    {/* Timeline Line */}
                    {i !== stats.recentLogs.length - 1 && (
                      <div className="absolute left-[21px] top-8 bottom-[-24px] w-0.5 bg-[#F7F8FD]"></div>
                    )}
                    
                    <div className={`
                      min-w-[10px] h-[10px] mt-1.5 rounded-full border-2 
                      ${log.transactionType === 'IN' ? 'bg-[#1E293B] border-[#1E293B]' : 'bg-[#9CA3AF] border-[#9CA3AF]'}
                    `} />
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1E293B]">
                        {log.transactionType === 'IN' ? 'Stocked In' : 'Stocked Out'} 
                        <span className="font-bold text-[#1E293B] mx-1">{log.quantity}</span>
                        {log.itemName}
                      </p>
                      {log.notes && <p className="text-xs text-[#9CA3AF] mt-1 italic">"{log.notes}"</p>}
                      <div className="text-xs font-mono text-[#9CA3AF] mt-2">
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
  <div className="flex items-start gap-4">
    <div className="p-2 bg-[#F7F8FD] rounded-lg text-[#9CA3AF]">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <p className="text-sm text-[#1E293B] font-medium mt-0.5">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, icon: Icon, label, variant = 'default' }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-left
      ${variant === 'danger' 
        ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
        : 'text-[#1E293B] hover:bg-[#F7F8FD]'}
    `}
  >
    <Icon className="w-4 h-4 opacity-70" />
    {label}
  </button>
);

const StatCard = ({ value, label, color }: any) => {
  // Simplified colors to match theme
  const colors: any = {
    blue: "bg-[#F7F8FD] text-[#1E293B] border-[#E5E7EB]",
    emerald: "bg-[#F7F8FD] text-[#1E293B] border-[#E5E7EB]",
    purple: "bg-[#F7F8FD] text-[#1E293B] border-[#E5E7EB]"
  };
  
  return (
    <div className={`p-5 rounded-2xl border ${colors[color]} text-center transition-transform hover:-translate-y-1`}>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs font-semibold opacity-70 uppercase tracking-wider mt-2">{label}</div>
    </div>
  );
}
