import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Menu, Command, User, LayoutDashboard, Package, ArrowRightLeft, BarChart3, FileText, Truck, Users } from 'lucide-react';
import { ViewState } from '../types';

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
    const searchRef = useRef<HTMLDivElement>(null);

    // Use import.meta.env.BASE_URL to correctly resolve the image path
    const logoPath = `${import.meta.env.BASE_URL}rca-logo.png`;

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

    const handleSearchSelect = (view: ViewState) => {
        onChangeView?.(view);
        setShowResults(false);
        setSearchTerm('');
    };

    return (
    <header className="h-20 flex items-center justify-between px-4 sticky top-0 z-20 transition-all duration-200 bg-transparent pointer-events-none">
      {/* Left side: Menu (Mobile) + Logo */}
      <div className="flex items-center gap-4 pointer-events-auto w-full">
        <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-[#9CA3AF] dark:text-slate-400 hover:bg-[#EDEEF3] dark:hover:bg-slate-700 rounded-lg md:hidden transition-colors bg-white dark:bg-slate-800 shadow-sm border border-[#E5E7EB] dark:border-slate-700"
        >
            <Menu className="w-6 h-6" />
        </button>

        {/* Unified Header Bar - Full Width Style */}
        <div className="flex items-center gap-4 bg-[#F1F2F7] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-2xl p-2 shadow-sm w-full relative">
            {/* Logo Section */}
            <div className="flex items-center gap-3 pl-2 pr-4 border-r border-[#E5E7EB] dark:border-slate-700 flex-shrink-0">
                <img src={logoPath} alt="RCA Logo" className="w-8 h-8 object-contain" />
                <div className="hidden sm:block leading-tight">
                    <h1 className="font-bold text-xs text-[#1E293B] dark:text-white tracking-tight">RCA</h1>
                    <h1 className="font-medium text-[10px] text-[#9CA3AF] dark:text-slate-400 tracking-wide">IMS</h1>
                </div>
            </div>

            {/* Spacer to push search to right */}
            <div className="flex-1"></div>

            {/* Search Bar - Enhanced Navigation */}
            <div className="relative group w-64" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-500 w-4 h-4 group-focus-within:text-[#1E293B] dark:group-focus-within:text-white transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search pages..." 
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="w-full bg-white dark:bg-slate-700 border border-[#E5E7EB] dark:border-slate-600 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-[#D1D5DB] dark:focus:border-slate-500 transition-all placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 text-[#1E293B] dark:text-white"
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

            {/* Actions Group */}
            <div className="flex items-center gap-1 pl-2 border-l border-[#E5E7EB] dark:border-slate-700 flex-shrink-0">
                <button 
                    onClick={() => onChangeView?.('NOTIFICATIONS')}
                    className="relative text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 p-2 rounded-xl transition-all"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F1F2F7] dark:border-slate-800"></span>
                </button>
                <button 
                    onClick={() => onChangeView?.('SETTINGS')}
                    className="text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 p-2 rounded-xl transition-all hidden md:block"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Profile */}
            <button 
                onClick={() => onChangeView?.('PROFILE')}
                className="flex items-center gap-3 bg-white dark:bg-slate-700 p-1.5 pr-4 rounded-xl border border-[#E5E7EB] dark:border-slate-600 shadow-sm hover:shadow-md transition-all group ml-2 flex-shrink-0"
            >
                <div className="w-8 h-8 rounded-lg bg-[#1E293B] dark:bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform overflow-hidden">
                    <User className="w-5 h-5" />
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-[#1E293B] dark:text-white">Profile</p>
                </div>
            </button>
        </div>
      </div>
    </header>
  );
};
