import React from 'react';
import { ViewState } from '../types';
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    BarChart3,
    FileText,
    Truck,
    Settings,
    X
} from 'lucide-react';

interface SidebarProps {
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose }) => {
    const menuItems: { id: ViewState; label: string; icon: React.ElementType }[] = [
        { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'STOCK', label: 'Stock', icon: Package },
        { id: 'TRANSACTIONS', label: 'Transactions', icon: ArrowRightLeft },
        { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
        { id: 'REPORT', label: 'Report', icon: FileText },
        { id: 'SUPPLIERS', label: 'Suppliers', icon: Truck },
        { id: 'SETTINGS', label: 'Settings', icon: Settings },
    ];

    // Shared Nav Content
    const NavContent = ({ isCollapsed = false, showLogo = true }) => (
        <>
            {showLogo && (
                <div className={`h-20 flex items-center gap-3 mb-2 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
                    <div className="p-1">
                        <img src="/rca-logo.png" alt="RCA Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div className={`leading-tight ${isCollapsed ? 'hidden' : 'block'}`}>
                        <h1 className="font-bold text-sm text-[#1E293B] tracking-tight">RCA</h1>
                        <h1 className="font-medium text-xs text-[#9CA3AF] tracking-wide">Inventory</h1>
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
                                onChangeView(item.id);
                                // Close mobile menu on selection if open
                                if (window.innerWidth < 768) {
                                    onClose();
                                }
                            }}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-[12px] transition-all duration-200 group relative ${
                                isActive
                                    ? 'bg-[#1E293B] text-white shadow-md shadow-slate-900/10'
                                    : 'text-[#9CA3AF] hover:bg-[#EDEEF3] hover:text-[#1E293B]'
                            } ${isCollapsed ? 'justify-center px-2' : ''}`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-[#1E293B]'}`} strokeWidth={2} />
                            <span className={`${isCollapsed ? 'hidden' : 'block'} whitespace-nowrap`}>
                  {item.label}
              </span>

                            {/* Tooltip for collapsed mode */}
                            {isCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-[#1E293B] text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl translate-x-[-5px] group-hover:translate-x-0">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>
        </>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#1E293B]/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Mobile Sidebar (Drawer) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="absolute top-4 right-4">
                    <button onClick={onClose} className="p-2 text-[#9CA3AF] hover:text-[#1E293B] hover:bg-[#EDEEF3] rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <NavContent showLogo={true} />
            </aside>

            {/* Tablet (Icons) Sidebar */}
            <aside className="hidden md:flex flex-col border border-[#E5E7EB] h-[calc(100%-1rem)] transition-all duration-300 w-20 lg:hidden bg-[#F1F2F7] ml-4 mb-4 rounded-2xl">
                <NavContent isCollapsed={true} showLogo={false} />
            </aside>

            {/* Desktop (Full) Sidebar */}
            <aside className="hidden lg:flex flex-col border border-[#E5E7EB] h-[calc(100%-1rem)] transition-all duration-300 w-64 bg-[#F1F2F7] ml-4 mb-4 rounded-2xl">
                <NavContent showLogo={false} />
            </aside>
        </>
    );
};