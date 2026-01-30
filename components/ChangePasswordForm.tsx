import React from 'react';
import { ChangePasswordRequest } from '../api/services/userService';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';

interface ChangePasswordFormProps {
    onChangePassword: (data: ChangePasswordRequest) => Promise<void>;
    onSuccess: () => void;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const ChangePasswordForm = React.memo<ChangePasswordFormProps>(({
    onChangePassword,
    onSuccess,
    onClose,
    addToast,
    removeToast
}) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            addToast("New password and confirm password do not match", 'error');
            return;
        }

        // Validate password length
        if (newPassword.length < 8) {
            addToast("New password must be at least 8 characters long", 'error');
            return;
        }

        const passwordData: ChangePasswordRequest = {
            currentPassword,
            newPassword,
            confirmPassword,
        };

        try {
            const toastId = addToast("Changing password...", 'loading');
            await onChangePassword(passwordData);
            removeToast(toastId);
            addToast("Password changed successfully", 'success');
            onClose();
            onSuccess();
        } catch (error) {
            const errorMessage = error instanceof ApiError 
                ? error.data?.message || error.message 
                : 'Failed to change password. Please try again.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <form id="change-password-form" className="space-y-5" onSubmit={handleSubmit}>
             <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300">
                <p>Make sure your new password is at least 8 characters long and includes a number.</p>
             </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                <input name="currentPassword" type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                <input name="newPassword" type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required minLength={8} />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                <input name="confirmPassword" type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required minLength={8} />
            </div>
        </form>
    );
});
