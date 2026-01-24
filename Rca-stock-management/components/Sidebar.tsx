import React, { useState } from 'react';
import { ViewState } from '../types';
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    BarChart3,
    FileText,
    Truck,
    Settings,
    X,
    Users,
    Cpu,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface SidebarProps {
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
    isOpen: boolean;
    onClose: () => void;
    userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose, userRole }) => {
    const [expandedSystem, setExpandedSystem] = useState(false);

    // Use import.meta.env.BASE_URL to correctly resolve the image path
    const logoPath = `${import.meta.env.BASE_URL}rca-logo.png`;

    const menuItems = [
        { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'STOCK', label: 'Stock', icon: Package },
        { id: 'TRANSACTIONS', label: 'Transactions', icon: ArrowRightLeft },
        { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
        { id: 'REPORT', label: 'Report', icon: FileText },
        { id: 'SUPPLIERS', label: 'Suppliers', icon: Truck },
    ];

    const systemSubItems = [
        { id: 'USERS', label: 'Users', icon: Users, adminOnly: true },
        { id: 'SETTINGS', label: 'Settings', icon: Settings },
    ];

    const filteredSystemItems = systemSubItems.filter(item => !item.adminOnly || userRole === 'ADMIN');
    const isSystemActive = filteredSystemItems.some(item => item.id === currentView);

    // Shared Nav Content
    const NavContent = ({ isCollapsed = false, showLogo = true }) => (
        <>
            {showLogo && (
                <div className={`h-20 flex items-center gap-3 mb-2 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
                    <div className="p-1">
                        <picture>
                            <source srcSet={logoWebP} type="image/webp" />
                            <img src={logoPath} alt="RCA Logo" className="w-10 h-10 object-contain" width="40" height="40" loading="lazy" />
                        </picture>
                    </div>
                    <div className={`leading-tight ${isCollapsed ? 'hidden' : 'block'}`}>
                        <h1 className="font-bold text-sm text-[#1E293B] dark:text-white tracking-tight">RCA</h1>
                        <h1 className="font-medium text-xs text-[#9CA3AF] dark:text-slate-400 tracking-wide">Inventory</h1>
                    </div>
                </div>
            )}

            <nav className={`flex-1 px-3 ${showLogo ? 'py-4' : 'py-6'} space-y-1`}>
                {menuItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onChangeView(item.id as ViewState);
                                if (window.innerWidth < 768) onClose();
                            }}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-[12px] transition-all duration-200 group relative ${
                                isActive
                                    ? 'bg-[#1E293B] dark:bg-blue-600 text-white shadow-md shadow-slate-900/10'
                                    : 'text-[#9CA3AF] dark:text-slate-400 hover:bg-[#EDEEF3] dark:hover:bg-slate-700 hover:text-[#1E293B] dark:hover:text-white'
                            } ${isCollapsed ? 'justify-center px-2' : ''}`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#9CA3AF] dark:text-slate-400 group-hover:text-[#1E293B] dark:group-hover:text-white'}`} strokeWidth={2} />
                            <span className={`${isCollapsed ? 'hidden' : 'block'} whitespace-nowrap`}>
                                {item.label}
                            </span>
                            {isCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-[#1E293B] dark:bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl translate-x-[-5px] group-hover:translate-x-0">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}

                {/* System Group */}
                <div className="pt-2">
                    <button
                        onClick={() => setExpandedSystem(!expandedSystem)}
                        title={isCollapsed ? "System" : undefined}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-3 text-sm font-medium rounded-[12px] transition-all duration-200 group relative ${
                            isSystemActive && !expandedSystem
                                ? 'bg-[#EDEEF3] dark:bg-slate-700 text-[#1E293B] dark:text-white'
                                : 'text-[#9CA3AF] dark:text-slate-400 hover:bg-[#EDEEF3] dark:hover:bg-slate-700 hover:text-[#1E293B] dark:hover:text-white'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <Cpu className={`w-5 h-5 flex-shrink-0 transition-colors ${isSystemActive ? 'text-[#1E293B] dark:text-white' : 'text-[#9CA3AF] dark:text-slate-400 group-hover:text-[#1E293B] dark:group-hover:text-white'}`} strokeWidth={2} />
                            <span className={`${isCollapsed ? 'hidden' : 'block'} whitespace-nowrap`}>System</span>
                        </div>
                        {!isCollapsed && (
                            <div className="text-[#9CA3AF] dark:text-slate-500">
                                {expandedSystem ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                        )}
                        
                        {isCollapsed && (
                             <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-[#1E293B] dark:bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl translate-x-[-5px] group-hover:translate-x-0">
                                System
                            </div>
                        )}
                    </button>

                    {/* Sub Items */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSystem ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                        {filteredSystemItems.map((item) => {
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onChangeView(item.id as ViewState);
                                        if (window.innerWidth < 768) onClose();
                                    }}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-[12px] transition-all duration-200 group relative ${
                                        isCollapsed ? 'justify-center' : 'pl-4'
                                    } ${
                                        isActive
                                            ? 'text-[#1E293B] dark:text-blue-400 bg-white dark:bg-slate-800 shadow-sm'
                                            : 'text-[#9CA3AF] dark:text-slate-500 hover:text-[#1E293B] dark:hover:text-slate-300'
                                    }`}
                                >
                                    {/* Icon added here */}
                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-[#1E293B] dark:text-blue-400' : 'text-[#9CA3AF] dark:text-slate-500'}`} />
                                    
                                    {!isCollapsed && (
                                        <span>{item.label}</span>
                                    )}
                                    
                                    {isCollapsed && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-[#1E293B] dark:bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl translate-x-[-5px] group-hover:translate-x-0">
                                            {item.label}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#1E293B]/20 dark:bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Mobile Sidebar (Drawer) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-[#E5E7EB] dark:border-slate-700 shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="absolute top-4 right-4">
                    <button onClick={onClose} className="p-2 text-[#9CA3AF] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white hover:bg-[#EDEEF3] dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <NavContent showLogo={true} />
            </aside>

            {/* Tablet (Icons) Sidebar */}
            <aside className="hidden md:flex flex-col border border-[#E5E7EB] dark:border-slate-700 h-[calc(100%-1rem)] transition-all duration-300 w-20 lg:hidden bg-[#F1F2F7] dark:bg-slate-800 ml-4 mb-4 rounded-2xl">
                <NavContent isCollapsed={true} showLogo={false} />
            </aside>

            {/* Desktop (Full) Sidebar */}
            <aside className="hidden lg:flex flex-col border border-[#E5E7EB] dark:border-slate-700 h-[calc(100%-1rem)] transition-all duration-300 w-64 bg-[#F1F2F7] dark:bg-slate-800 ml-4 mb-4 rounded-2xl">
                <NavContent showLogo={false} />
            </aside>
        </>
    );
};