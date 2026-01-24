import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit, Lock, LogOut, Briefcase, Camera, Loader2, Upload, Building2, Globe, Trash2 } from 'lucide-react';
import { getProfile, updateProfile } from '../api/services/userService';
import { uploadFile } from '../api/services/fileService';
import { ApiError } from '../api/client';

interface ProfileViewProps {
    onEditProfile: () => void;
    onChangePassword: () => void;
    onLogout: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning' | 'loading') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onEditProfile, onChangePassword, onLogout, addToast }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (error) {
                if (import.meta.env.DEV) console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Function to refresh profile data
    const refreshProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (error) {
            if (import.meta.env.DEV) console.error("Failed to refresh profile", error);
        }
    };

    // Listen for profile updates from other components
    useEffect(() => {
        const handleProfileUpdate = () => {
            refreshProfile();
        };

        window.addEventListener('profile-updated', handleProfileUpdate);
        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, []);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = event.target.files?.[0];
        if (!file) return;

        const toastId = addToast('Uploading image...', 'loading');
        try {
            setUploading(true);
            
            // 1. Upload file to server
            const fileUrl = await uploadFile(file);
            
            // 2. Update profile with new URL
            await updateProfile({
                [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: fileUrl
            });
            
            // 3. Update local state
            setProfile(prev => prev ? {
                ...prev,
                [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: fileUrl
            } : null);
            
            // 4. Notify other components
            window.dispatchEvent(new Event('profile-updated'));
            addToast('Image updated successfully!', 'success');

        } catch (error) {
            if (import.meta.env.DEV) console.error("Failed to upload image", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(`Upload failed: ${errorMessage}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (type: 'avatar' | 'cover') => {
        if (!confirm('Are you sure you want to remove this image?')) return;

        const toastId = addToast('Removing image...', 'loading');
        try {
            await updateProfile({
                [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: null
            });
            
            setProfile(prev => prev ? {
                ...prev,
                [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: null
            } : null);
            
            window.dispatchEvent(new Event('profile-updated'));
            removeToast(toastId);
            addToast('Image removed successfully!', 'success');
        } catch (error) {
            if (import.meta.env.DEV) console.error("Failed to remove image", error);
            removeToast(toastId);
            addToast('Failed to remove image.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center p-10 text-slate-500">Failed to load profile data.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Hidden File Inputs */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'avatar')}
            />
            <input 
                type="file" 
                ref={coverInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover')}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center mb-6 relative group/avatar">
                            <div className="w-40 h-40 rounded-3xl bg-slate-100 dark:bg-slate-700 p-1 shadow-inner overflow-hidden relative">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <div className="w-full h-full rounded-2xl flex items-center justify-center bg-slate-200 dark:bg-slate-600">
                                        <span className="text-4xl font-bold text-slate-400">{profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-20 h-20" />}</span>
                                    </div>
                                )}
                                
                                {/* Upload Overlay */}
                                <div 
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                    className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer rounded-2xl ${uploading ? 'cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : <Camera className="w-10 h-10 text-white" />}
                                </div>
                            </div>
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My profile</h2>
                                <p className="text-xs text-slate-400">Manage your personal information</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                                    <p className="text-slate-900 dark:text-white font-medium border-b border-slate-100 dark:border-slate-700 pb-2">{profile.name}</p>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                    <p className="text-slate-900 dark:text-white font-medium border-b border-slate-100 dark:border-slate-700 pb-2">{profile.phone || 'Not set'}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <p className="text-slate-900 dark:text-white font-medium border-b border-slate-100 dark:border-slate-700 pb-2 truncate" title={profile.email}>{profile.email}</p>
                                </div>
                            </div>

                            {/* Notifications Toggle (Visual Only) */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Notifications</span>
                                <div className="w-10 h-5 bg-[#1e293b] dark:bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>

                        {/* Save/Edit Button */}
                        <div className="mt-8">
                            <button 
                                onClick={onEditProfile}
                                className="w-full py-3 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-white font-bold text-sm shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Stack */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    {/* Top Card: Account Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Account Details</h3>
                            <div className="flex gap-2">
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                    <span className="sr-only">Search</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </button>
                                <button onClick={onChangePassword} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    Change Password
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Role Item */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">User Role</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white uppercase">{profile.role}</p>
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-[#1e293b] text-white text-xs font-bold shadow-md shadow-slate-900/20">
                                    Active Role
                                </div>
                            </div>

                            {/* Department Item */}
                            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-700/50 pt-6">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Department</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.department || 'Not Assigned'}</p>
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-bold shadow-md shadow-green-500/20">
                                    Verified
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Card: System Details */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">System Information</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Joined Date */}
                            <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Joined Date</span>
                                </div>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
                                    {new Date(profile.joinDate).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Language */}
                            <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Language Preferences</span>
                                </div>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full uppercase">
                                    {profile.language || 'English'}
                                </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">District of Residence</span>
                                </div>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">
                                    {profile.location || 'Kigali'}
                                </span>
                            </div>

                            {/* Logout Action Item */}
                            <div className="flex items-center justify-between p-2 mt-4 border-t border-slate-50 dark:border-slate-700/50 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Session</span>
                                </div>
                                <button 
                                    onClick={onLogout}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md shadow-red-600/20 transition-all active:scale-95"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
