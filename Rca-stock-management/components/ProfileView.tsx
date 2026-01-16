import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit, Lock, LogOut, Briefcase, Camera, Loader2, Upload } from 'lucide-react';
import { getProfile, updateProfile } from '../api/services/userService';
import { ApiError } from '../api/client';

interface ProfileViewProps {
    onEditProfile: () => void;
    onChangePassword: () => void;
    onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onEditProfile, onChangePassword, onLogout }) => {
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

        // In a real app, you would upload this file to a server/S3
        // For now, we'll use a local object URL to simulate the update
        const imageUrl = URL.createObjectURL(file);
        
        // Optimistic update
        setProfile(prev => prev ? {
            ...prev,
            [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: imageUrl
        } : null);

        try {
            setUploading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Failed to upload image", error);
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
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-r from-[#28375B] to-slate-900 dark:from-[#28375B] dark:to-slate-900">
                    {profile.coverUrl && (
                        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover/cover:bg-black/30 transition-colors"></div>
                    <button 
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-xl backdrop-blur-sm transition-all opacity-0 group-hover/cover:opacity-100 flex items-center gap-2 text-xs font-medium"
                    >
                        <Camera className="w-4 h-4" />
                        <span>Change Cover</span>
                    </button>
                </div>
                
                <div className="relative px-8 pb-8 pt-32 flex flex-col md:flex-row items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group/avatar">
                        <div className="w-36 h-36 rounded-[2rem] bg-white dark:bg-slate-800 p-1.5 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                            <div className="w-full h-full rounded-[1.6rem] bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-5xl font-bold text-slate-400 dark:text-slate-500 overflow-hidden relative">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-slate-300 dark:text-slate-600">{profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-16 h-16" />}</span>
                                )}
                                
                                {/* Avatar Overlay */}
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full z-10"></div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 mb-2 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name || 'User'}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{profile.email}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>{profile.department || 'No Department'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{profile.location || 'Kigali, Rwanda'}</span>
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
                        <button 
                            onClick={onLogout}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Personal Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-[#28375B] dark:text-blue-400" />
                                Personal Information
                            </h3>
                            <button onClick={onChangePassword} className="text-sm text-[#28375B] dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Change Password
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                                <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.name || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                                <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.phone || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</label>
                                <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.department || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</label>
                                <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.location || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Since</label>
                                <p className="text-slate-900 dark:text-white font-medium text-lg">
                                    {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Stats & Settings */}
                <div className="space-y-8">
                    {/* Account Status */}
                    <div className="bg-gradient-to-br from-[#28375B] to-[#1e2a45] dark:from-blue-600 dark:to-indigo-700 rounded-[2rem] p-8 text-white shadow-lg shadow-slate-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
                        
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Account Status</h3>
                            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                Your account is fully active with {profile.role === 'ADMIN' ? 'administrative' : 'standard'} privileges.
                            </p>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-blue-100">Security Score</span>
                                    <span>98%</span>
                                </div>
                                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                                    <div className="bg-white h-full w-[98%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Settings */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email Notifications</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${profile.emailNotifications ? 'bg-[#28375B] dark:bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${profile.emailNotifications ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">SMS Alerts</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${profile.smsNotifications ? 'bg-[#28375B] dark:bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${profile.smsNotifications ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
