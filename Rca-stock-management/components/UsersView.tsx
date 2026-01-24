import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Plus, Search, Trash2, User, Mail, Phone, MapPin, Shield, Loader2, AlertCircle, MoreVertical } from 'lucide-react';
import { getUsers, deleteUser } from '../api/services/userService';
import { ConfirmationModal } from './ConfirmationModal';

interface UsersViewProps {
    onAddUser: () => void;
    refreshTrigger?: number;
}

export const UsersView: React.FC<UsersViewProps> = ({ onAddUser, refreshTrigger }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Confirmation State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to load users. You might not have permission.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [refreshTrigger]);

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteClick = (id: number) => {
        setUserToDelete(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        
        try {
            await deleteUser(userToDelete);
            fetchUsers();
            setConfirmOpen(false);
            setUserToDelete(null);
        } catch (e) {
            alert('Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage system access and team members</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search Bar - Adjusted size */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200"
                        />
                    </div>
                    
                    <button 
                        onClick={onAddUser}
                        className="flex items-center gap-2 bg-[#1e293b] dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/20 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-700/30 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                        <div className="relative flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm overflow-hidden ${
                                    user.role === 'ADMIN' 
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                }`}>
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{user.name || 'Unknown User'}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">{user.department || 'No Department'}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-1">
                                {user.role !== 'ADMIN' && (
                                    <button 
                                        onClick={() => user.id && handleDeleteClick(user.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 relative">
                            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-medium">{user.email}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">{user.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    <span className="truncate capitalize">{user.role.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="absolute bottom-6 right-6">
                            <span className={`flex h-3 w-3 rounded-full ${user.role ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.role ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            <ConfirmationModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete User"
                type="danger"
            />
        </div>
    );
};
