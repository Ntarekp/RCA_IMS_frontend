import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit, Lock, LogOut, Briefcase, Camera, Loader2 } from 'lucide-react';
import { getProfile } from '../api/services/userService';

interface ProfileViewProps {
    onEditProfile: () => void;
    onChangePassword: () => void;
    onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onEditProfile, onChangePassword, onLogout }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your account settings and preferences</p>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-all shadow-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-blue-900 dark:to-slate-900"></div>
                
                <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6 mt-12">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 p-1.5 shadow-xl">
                            <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl font-bold text-slate-400 dark:text-slate-500 overflow-hidden">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-12 h-12" />
                                )}
                            </div>
                        </div>
                        <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex-1 mb-2">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name || 'User'}</h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4" />
                                <span>{profile.department || 'No Department'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span>{profile.location || 'Kigali, Rwanda'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-xs font-bold uppercase tracking-wide">
                                <Shield className="w-3 h-3" />
                                <span>{profile.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button 
                            onClick={onEditProfile}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1e293b] dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                        <button 
                            onClick={onChangePassword}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95"
                        >
                            <Lock className="w-4 h-4" />
                            <span>Password</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Contact Information
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Email Address</p>
                                <p className="text-slate-700 dark:text-slate-200 font-medium">{profile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                                <p className="text-slate-700 dark:text-slate-200 font-medium">{profile.phone || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Member Since</p>
                                <p className="text-slate-700 dark:text-slate-200 font-medium">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Stats / Activity Placeholder */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Account Status</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-6">
                        Your account is fully active. You have {profile.role === 'ADMIN' ? 'full administrative' : 'standard'} access to the system.
                    </p>
                    <div className="w-full bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Security Level</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Strong</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
