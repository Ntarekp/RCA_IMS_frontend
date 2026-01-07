import React from 'react';
import { Search, Bell, Settings, Menu, Command } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
    onChangeView?: (view: ViewState) => void;
    onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onChangeView, onMenuClick }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 transition-all duration-200">
      {/* Left side: Menu (Mobile) + Search */}
      <div className="flex items-center flex-1 max-w-xl gap-4">
        <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-[#9CA3AF] hover:bg-[#EDEEF3] rounded-lg md:hidden transition-colors"
        >
            <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4 group-focus-within:text-[#1E293B] transition-colors" />
            <input 
                type="text" 
                placeholder="Search inventory..." 
                className="w-full bg-[#F7F8FD] border border-[#E5E7EB] rounded-[12px] pl-10 pr-12 py-2.5 text-sm outline-none focus:bg-white focus:border-[#D1D5DB] transition-all placeholder:text-[#9CA3AF] text-[#1E293B]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#9CA3AF] bg-white border border-[#E5E7EB] rounded-md shadow-sm">
                    <Command className="w-3 h-3" /> K
                </kbd>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4 pl-4">
        <button 
            onClick={() => onChangeView?.('NOTIFICATIONS')}
            className="relative text-[#9CA3AF] hover:text-[#1E293B] hover:bg-[#EDEEF3] p-2 rounded-full transition-all"
        >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button 
            onClick={() => onChangeView?.('SETTINGS')}
            className="text-[#9CA3AF] hover:text-[#1E293B] hover:bg-[#EDEEF3] p-2 rounded-full transition-all hidden md:block"
        >
            <Settings className="w-5 h-5" />
        </button>
        <div className="h-8 w-px bg-[#E5E7EB] mx-2 hidden md:block"></div>
        <button 
            onClick={() => onChangeView?.('PROFILE')}
            className="flex items-center gap-3 hover:bg-[#EDEEF3] p-1.5 rounded-full pr-4 transition-all border border-transparent hover:border-[#E5E7EB]"
        >
            <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-slate-900/10">
                PN
            </div>
            <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#1E293B]">Prince N.</p>
                <p className="text-[10px] text-[#9CA3AF]">Admin</p>
            </div>
        </button>
      </div>
    </header>
  );
};
