import React from 'react';
import { Search, Bell, Settings, Menu, Command } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
    onChangeView?: (view: ViewState) => void;
    onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onChangeView, onMenuClick }) => {
  return (
    <header className="h-24 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 transition-all duration-200 bg-transparent pointer-events-none">
      {/* Left side: Menu (Mobile) + Search + Logo */}
      <div className="flex items-center flex-1 max-w-3xl gap-4 pointer-events-auto">
        <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-[#9CA3AF] hover:bg-[#EDEEF3] rounded-lg md:hidden transition-colors bg-white shadow-sm border border-[#E5E7EB]"
        >
            <Menu className="w-6 h-6" />
        </button>

        {/* Unified Header Bar */}
        <div className="flex-1 flex items-center gap-4 bg-[#F1F2F7] border border-[#E5E7EB] rounded-2xl p-2 shadow-sm">
            {/* Logo Section */}
            <div className="flex items-center gap-3 pl-2 pr-4 border-r border-[#E5E7EB]">
                <img src="/rca-logo.png" alt="RCA Logo" className="w-8 h-8 object-contain" />
                <div className="hidden sm:block leading-tight">
                    <h1 className="font-bold text-xs text-[#1E293B] tracking-tight">RCA</h1>
                    <h1 className="font-medium text-[10px] text-[#9CA3AF] tracking-wide">IMS</h1>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4 group-focus-within:text-[#1E293B] transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search inventory..." 
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-12 py-2 text-sm outline-none focus:border-[#D1D5DB] transition-all placeholder:text-[#9CA3AF] text-[#1E293B]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#9CA3AF] bg-[#F7F8FD] border border-[#E5E7EB] rounded-md">
                        <Command className="w-3 h-3" /> K
                    </kbd>
                </div>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-1 pl-2 border-l border-[#E5E7EB]">
                <button 
                    onClick={() => onChangeView?.('NOTIFICATIONS')}
                    className="relative text-[#9CA3AF] hover:text-[#1E293B] hover:bg-white p-2 rounded-xl transition-all"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F1F2F7]"></span>
                </button>
                <button 
                    onClick={() => onChangeView?.('SETTINGS')}
                    className="text-[#9CA3AF] hover:text-[#1E293B] hover:bg-white p-2 rounded-xl transition-all hidden md:block"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Profile */}
            <button 
                onClick={() => onChangeView?.('PROFILE')}
                className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group ml-2"
            >
                <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
                    PN
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-[#1E293B]">Prince</p>
                </div>
            </button>
        </div>
      </div>
    </header>
  );
};
