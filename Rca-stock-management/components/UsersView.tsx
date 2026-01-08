import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Plus, Search, Trash2, User, Mail, Phone, MapPin, Shield, Loader2, AlertCircle } from 'lucide-react';
import { get } from '../api/client';
import { API_CONFIG } from '../config';

interface UsersViewProps {
    onAddUser: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onAddUser }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await get<UserProfile[]>(`${API_CONFIG.BASE_URL}/api/admin/users`);
            setUsers(data);
        } catch (err) {
            setError('Failed to load users. You might not have permission.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            fetchUsers();
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
                <button 
                    onClick={onAddUser}
                    className="flex items-center gap-2 bg-[#1e293b] dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search users by name, email or role..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200"
                />
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg">
                                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{user.name || 'Unknown User'}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                        user.role === 'ADMIN' 
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800' 
                                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            {user.role !== 'ADMIN' && ( // Prevent deleting main admin easily
                                <button 
                                    onClick={() => user.id && handleDelete(user.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Phone className="w-4 h-4" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user.location && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
