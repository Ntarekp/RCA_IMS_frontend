import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { UserProfile } from '../types';
import { UpdateProfileRequest } from '../api/services/userService';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';

interface EditProfileFormProps {
    profile: UserProfile;
    onUpdateProfile: (data: UpdateProfileRequest) => Promise<void>;
    onSuccess: () => void;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const EditProfileForm = React.memo<EditProfileFormProps>(({
    profile,
    onUpdateProfile,
    onSuccess,
    onClose,
    addToast,
    removeToast
}) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const profileData: UpdateProfileRequest = {
            name: formData.get('name') as string || undefined,
            email: formData.get('email') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            department: formData.get('department') as string || undefined,
        };
        try {
            const toastId = addToast("Updating profile...", 'loading');
            await onUpdateProfile(profileData);
            removeToast(toastId);
            addToast("Profile updated successfully", 'success');
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof ApiError 
                ? error.data?.message || error.message 
                : 'Failed to update profile. Please try again.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <form id="edit-profile-form" className="space-y-5" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input name="name" type="text" defaultValue={profile.name} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                     <input type="text" defaultValue={profile.role} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" readOnly />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                     <input name="department" type="text" defaultValue={profile.department} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                 <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="email" type="email" defaultValue={profile.email} className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="phone" type="tel" defaultValue={profile.phone} className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                </div>
            </div>
        </form>
    );
});
