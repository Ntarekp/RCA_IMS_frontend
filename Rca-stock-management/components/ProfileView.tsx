import React from 'react';
import { MOCK_USER_PROFILE } from '../constants';
import { Mail, Phone, Briefcase, Calendar, MapPin, Edit3, LogOut, Key } from 'lucide-react';

interface ProfileViewProps {
    onEditProfile: () => void;
    onChangePassword: () => void;
    onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onEditProfile, onChangePassword, onLogout }) => {
  return (
    <div className="max-w-4xl mx-auto">
       <div className="relative mb-20">
            {/* Cover Photo */}
            <div className="h-48 w-full bg-gradient-to-r from-[#1e293b] to-[#334155] rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>
            
            {/* Avatar & Info */}
            <div className="absolute -bottom-12 left-10 flex items-end gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    <img src={MOCK_USER_PROFILE.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-gray-800">{MOCK_USER_PROFILE.name}</h1>
                    <p className="text-sm text-gray-500">{MOCK_USER_PROFILE.role} • {MOCK_USER_PROFILE.department}</p>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute bottom-4 right-6 flex gap-3">
                 <button 
                    onClick={onEditProfile}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                 >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                </button>
            </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Personal Info */}
            <div className="md:col-span-1 space-y-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">About</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{MOCK_USER_PROFILE.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{MOCK_USER_PROFILE.phone}</span>
                        </div>
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span>{MOCK_USER_PROFILE.department}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Joined {MOCK_USER_PROFILE.joinDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>Kigali, Rwanda</span>
                        </div>
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-4">Actions</h3>
                    <div className="space-y-2">
                        <button 
                            onClick={onEditProfile}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors text-left"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile Details
                        </button>
                        <button 
                            onClick={onChangePassword}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors text-left"
                        >
                            <Key className="w-4 h-4" />
                            Change Password
                        </button>
                         <button 
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-sm text-red-600 transition-colors text-left mt-2"
                         >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                 </div>
            </div>

            {/* Right Column: Activity / Stats */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                     <h3 className="font-semibold text-gray-700 mb-6">Overview</h3>
                     <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* Renamed metrics to be more meaningful for Inventory Managers */}
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-blue-600">142</div>
                            <div className="text-xs text-blue-400 font-medium uppercase mt-1">Stock Entries</div>
                        </div>
                         <div className="bg-emerald-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-emerald-600">56</div>
                            <div className="text-xs text-emerald-400 font-medium uppercase mt-1">Reports Created</div>
                        </div>
                         <div className="bg-purple-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-purple-600">760</div>
                            <div className="text-xs text-purple-400 font-medium uppercase mt-1">Days Active</div>
                        </div>
                     </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                     <h3 className="font-semibold text-gray-700 mb-4">Recent System Logs</h3>
                     <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="text-xs font-mono text-gray-400 whitespace-nowrap pt-0.5">Oct 2{i}, 10:30 AM</div>
                                <div>
                                    <p className="text-sm text-gray-700">Approved restock request for <span className="font-medium text-gray-900">Maize Flour (500kg)</span>.</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
       </div>
    </div>
  );
};