import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Menu, Command, User, LayoutDashboard, Package, ArrowRightLeft, BarChart3, FileText, Truck, Users, X, ChevronRight } from 'lucide-react';
import { ViewState } from '../types';
import { getProfile } from '../api/services/userService';
import { getNotifications } from '../api/services/dashboardService';

interface HeaderProps {
    onChangeView?: (view: ViewState) => void;
    onMenuClick?: () => void;
}

interface SearchResult {
    id: string;
    title: string;
    description: string;
    view: ViewState;
    icon: React.ElementType;
}

export const Header: React.FC<HeaderProps> = ({ onChangeView, onMenuClick }) => {
    const [searchQuery, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [hasNotifications, setHasNotifications] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Use import.meta.env.BASE_URL to correctly resolve the image path
    const logoPath = `${import.meta.env.BASE_URL}rca-logo.png`;
    const logoWebP = `${import.meta.env.BASE_URL}rca-logo.webp`;

    const searchItems: SearchResult[] = [
        { id: '1', title: 'Dashboard', description: 'Go to Dashboard page', view: 'DASHBOARD', icon: LayoutDashboard },
        { id: '2', title: 'Stock', description: 'Manage inventory items', view: 'STOCK', icon: Package },
        { id: '3', title: 'Transactions', description: 'View stock history', view: 'TRANSACTIONS', icon: ArrowRightLeft },
        { id: '4', title: 'Analytics', description: 'View reports and stats', view: 'ANALYTICS', icon: BarChart3 },
        { id: '5', title: 'Reports', description: 'Generate system reports', view: 'REPORT', icon: FileText },
        { id: '6', title: 'Suppliers', description: 'Manage suppliers', view: 'SUPPLIERS', icon: Truck },
        { id: '7', title: 'Users', description: 'Manage system users', view: 'USERS', icon: Users },
        { id: '8', title: 'Settings', description: 'System configuration', view: 'SETTINGS', icon: Settings },
        { id: '9', title: 'Profile', description: 'Your account details', view: 'PROFILE', icon: User },
    ];

    const filteredResults = searchItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch profile for avatar
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getProfile();
                setAvatarUrl(profile.avatarUrl || null);
            } catch (error) {
                if (import.meta.env.DEV) console.error("Failed to fetch profile for header", error);
            }
        };
        fetchProfile();

        // Listen for profile updates
        const handleProfileUpdate = () => fetchProfile();
        window.addEventListener('profile-updated', handleProfileUpdate);
        return () => window.removeEventListener('profile-updated', handleProfileUpdate);
    }, []);

    // Check for notifications
    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const notifications = await getNotifications();
                // Only show indicator if there are unread notifications
                const hasUnread = notifications.some(n => !n.read);
                setHasNotifications(hasUnread);
            } catch (error) {
                if (import.meta.env.DEV) console.error("Failed to check notifications", error);
            }
        };
        
        checkNotifications();
        // Poll every minute
        const interval = setInterval(checkNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleSearchSelect = (view: ViewState) => {
        onChangeView?.(view);
        setShowResults(false);
        setShowMobileSearch(false);
        setSearchTerm('');
    };

    return (
    <header className="h-16 md:h-20 flex items-center justify-between px-2 md:px-4 sticky top-0 z-20 transition-all duration-200 bg-transparent pointer-events-none">
      {/* Left side: Logo */}
      <div className="flex items-center gap-2 md:gap-4 pointer-events-auto w-full">
        
        {/* Unified Header Bar */}
        <div className="flex items-center gap-2 md:gap-4 bg-white md:bg-[#F1F2F7] dark:bg-slate-800 md:border border-[#E5E7EB] dark:border-slate-700 rounded-xl md:rounded-2xl p-1 md:p-2 shadow-sm md:shadow-none w-full relative">
            {/* Logo Section - Compact on mobile */}
            <div className="flex items-center gap-2 md:gap-3 pl-2 pr-2 md:pr-4 md:border-r border-[#E5E7EB] dark:border-slate-700 flex-shrink-0">
                <picture>
                    <source srcSet={logoWebP} type="image/webp" />
                    <img src={logoPath} alt="RCA Logo" className="w-8 h-8 md:w-8 md:h-8 object-contain" width="32" height="32" loading="lazy" />
                </picture>
                <div className="hidden sm:block leading-tight">
                    <h1 className="font-bold text-xs text-[#1E293B] dark:text-white tracking-tight">RCA</h1>
                    <h1 className="font-medium text-[10px] text-[#9CA3AF] dark:text-slate-400 tracking-wide">IMS</h1>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Desktop Search Bar */}
            <div className="hidden sm:block relative group w-full max-w-xs transition-all duration-300 ease-in-out focus-within:max-w-md" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-500 w-4 h-4 group-focus-within:text-[#1E293B] dark:group-focus-within:text-white transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="w-full bg-white dark:bg-slate-700 border border-[#E5E7EB] dark:border-slate-600 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-[#D1D5DB] dark:focus:border-slate-500 transition-all placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 text-[#1E293B] dark:text-white truncate"
                />
                
                {/* Search Results Dropdown */}
                {showResults && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                            Pages
                        </div>
                        {filteredResults.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto py-1">
                                {filteredResults.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSearchSelect(item.view)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors group/item"
                                    >
                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 group-hover/item:bg-blue-50 dark:group-hover/item:bg-blue-900/20 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                No pages found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 pl-1 md:pl-2 md:border-l border-[#E5E7EB] dark:border-slate-700 flex-shrink-0">
                 {/* Mobile Search Trigger */}
                <button 
                    onClick={() => setShowMobileSearch(true)}
                    className="sm:hidden text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded-xl transition-all"
                >
                    <Search className="w-5 h-5" />
                </button>

                <button 
                    onClick={() => onChangeView?.('NOTIFICATIONS')}
                    className="relative text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white hover:bg-gray-50 md:hover:bg-white dark:hover:bg-slate-700 p-2 rounded-xl transition-all"
                >
                    <Bell className="w-5 h-5" />
                    {hasNotifications && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F1F2F7] dark:border-slate-800"></span>
                    )}
                </button>
                <button 
                    onClick={() => onChangeView?.('SETTINGS')}
                    className="text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 p-2 rounded-xl transition-all hidden md:block"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Profile - Only Picture */}
            <button 
                onClick={() => onChangeView?.('PROFILE')}
                className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity ml-1 md:ml-2 flex-shrink-0"
                title="View Profile"
            >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-xs shadow-sm ring-2 ring-white dark:ring-slate-800 overflow-hidden">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        "A"
                    )}
                </div>
            </button>
            
            {/* Hamburger Menu (Moved to right) */}
            <button 
                onClick={onMenuClick}
                className="ml-1 p-2 text-[#1E293B] dark:text-white hover:bg-[#EDEEF3] dark:hover:bg-slate-700 rounded-lg md:hidden transition-colors flex-shrink-0"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
         <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-900 animate-in slide-in-from-top-10 duration-200">
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Search pages..." 
                        value={searchQuery}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-3 text-base outline-none text-slate-900 dark:text-white placeholder:text-slate-500"
                    />
                </div>
                <button 
                    onClick={() => setShowMobileSearch(false)}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
                 {searchQuery ? (
                    filteredResults.length > 0 ? (
                        filteredResults.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleSearchSelect(item.view)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-4 rounded-xl mb-1"
                            >
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-base font-medium text-slate-900 dark:text-white">{item.title}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{item.description}</div>
                                </div>
                            </button>
                        ))
                    ) : (
                         <div className="p-8 text-center text-slate-500">
                            No results found for "{searchQuery}"
                        </div>
                    )
                 ) : (
                    <div className="p-2">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</div>
                        <div className="grid grid-cols-3 gap-2">
                            {searchItems.filter(item => ['DASHBOARD', 'ANALYTICS', 'REPORT', 'SUPPLIERS', 'STOCK', 'SETTINGS'].includes(item.view)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSearchSelect(item.view)}
                                    className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                                >
                                    <item.icon className="w-6 h-6 text-slate-500 mb-2" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                 )}
            </div>
         </div>
      )}
    </header>
    );
};
