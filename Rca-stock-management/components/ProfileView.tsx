import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit, Lock, LogOut, Briefcase, Camera, Loader2, Upload, Building2, Globe } from 'lucide-react';
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
                console.error("Failed to load profile", error);
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
            console.error("Failed to refresh profile", error);
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
            console.error("Failed to upload image", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(`Upload failed: ${errorMessage}`, 'error');
        } finally {
            setUploading(false);
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

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group/cover">
                {/* Cover Image */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#28375B] to-slate-900 dark:from-[#28375B] dark:to-slate-900">
                    {profile.coverUrl && (
                        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover/cover:bg-black/30 transition-colors"></div>
                    <button 
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-xl backdrop-blur-sm transition-all opacity-0 group-hover/cover:opacity-100 flex items-center gap-2 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        <span>Change Cover</span>
                    </button>
                </div>
                
                <div className="relative px-8 pb-8 pt-48 flex flex-col md:flex-row items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group/avatar -mb-4">
                        <div className="w-40 h-40 rounded-[2rem] bg-white dark:bg-slate-800 p-1.5 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                            <div className="w-full h-full rounded-[1.6rem] bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-5xl font-bold text-slate-400 dark:text-slate-500 overflow-hidden relative">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-slate-300 dark:text-slate-600">{profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-16 h-16" />}</span>
                                )}
                                
                                {/* Avatar Overlay */}
                                <div 
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                    className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer ${uploading ? 'cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full z-10"></div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 mb-2 text-center md:text-left pt-4 md:pt-0">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name || 'User'}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{profile.email}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>{profile.department || 'No Department'}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                profile.role === 'ADMIN' 
                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800' 
                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                            }`}>
                                <Shield className="w-3 h-3" />
                                <span>{profile.role}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button 
                            onClick={onEditProfile}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#28375B] dark:bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1e2a45] dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-5xl mx-auto pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <label className="text-sm font-medium text-slate-500 block mb-1">Full Name:</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile.name || 'Not set'}</p>
                    </div>

                    {/* Email */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <label className="text-sm font-medium text-slate-500 block mb-1">Email Address:</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white truncate" title={profile.email}>{profile.email}</p>
                    </div>

                    {/* Phone */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <label className="text-sm font-medium text-slate-500 block mb-1">Phone Number:</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile.phone || 'Not set'}</p>
                    </div>

                    {/* Department */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <label className="text-sm font-medium text-slate-500 block mb-1">Department:</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile.department || 'Not set'}</p>
                    </div>

                    {/* Role */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <label className="text-sm font-medium text-slate-500 block mb-1">Role:</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white uppercase">{profile.role}</p>
                    </div>

                    {/* Joined Date */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <label className="text-sm font-medium text-slate-500 block mb-1">Joined Date:</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{new Date(profile.joinDate).toLocaleDateString()}</p>
                    </div>

                    {/* Language */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <label className="text-sm font-medium text-slate-500 block mb-1">Language:</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white uppercase">{profile.language || 'EN'}</p>
                    </div>

                    {/* Location */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                        <label className="text-sm font-medium text-slate-500 block mb-1">District of Residence:</label>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile.location || 'Kigali, Rwanda'}</p>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="flex justify-end mt-8">
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-red-600/20 active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
