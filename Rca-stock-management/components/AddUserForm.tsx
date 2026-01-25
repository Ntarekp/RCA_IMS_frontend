import React from 'react';
import { CreateUserRequest } from '../api/services/userService';
import { ApiError } from '../api/client';
import { ToastMessage } from './Toast';

interface AddUserFormProps {
    onCreateUser: (data: CreateUserRequest) => Promise<void>;
    onSuccess: () => void;
    onClose: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => string;
    removeToast: (id: string) => void;
}

export const AddUserForm = React.memo<AddUserFormProps>(({
    onCreateUser,
    onSuccess,
    onClose,
    addToast,
    removeToast
}) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const userData: CreateUserRequest = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as 'ADMIN' | 'USER',
            department: formData.get('department') as string,
            phone: formData.get('phone') as string,
        };

        try {
            const toastId = addToast("Creating user...", 'loading');
            await onCreateUser(userData);
            removeToast(toastId);
            addToast("User created successfully. An email has been sent to set their password.", 'success');
            onClose();
            onSuccess();
        } catch (error) {
            const errorMessage = error instanceof ApiError 
                ? error.message 
                : 'Failed to create user. Please try again.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <form id="add-user-form" className="space-y-5" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input name="name" type="text" placeholder="John Doe" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input name="email" type="email" placeholder="john.doe@rca.gov.rw" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                    <select name="role" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                    <input name="department" type="text" placeholder="Logistics" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <input name="phone" type="tel" placeholder="+250 7..." className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400" required />
            </div>
        </form>
    );
});
